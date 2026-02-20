from app.extensions import db
from app.models.leave_request import LeaveRequest
from app.services.leave_calculator import calculate_leave_days
from app.services.leave_ledger_service import LeaveLedgerService
from uuid import UUID
from sqlalchemy import or_
from sqlalchemy.exc import SQLAlchemyError
from typing import List

class LeaveService:

    @staticmethod
    def apply_leave(user_id: UUID, data):
        start_date = data["start_date"]
        end_date = data["end_date"]

        if start_date > end_date:
            raise ValueError("Invalid date range")

        # Check for overlapping leaves (PENDING or APPROVED)
        existing_leave = LeaveRequest.query.filter(
            LeaveRequest.user_id == user_id,
            LeaveRequest.status.in_(["PENDING", "APPROVED"]),
            ~or_(
                LeaveRequest.end_date < start_date,
                LeaveRequest.start_date > end_date
            )
        ).first()

        if existing_leave:
            raise ValueError(f"You already have a {existing_leave.status.lower()} leave request for overlapping dates")

        # Check for exact duplicate (including REJECTED)
        duplicate = LeaveRequest.query.filter(
            LeaveRequest.user_id == user_id,
            LeaveRequest.start_date == start_date,
            LeaveRequest.end_date == end_date,
            LeaveRequest.leave_type_id == data["leave_type_id"]
        ).first()

        if duplicate:
            raise ValueError(f"You already applied for this exact leave period. Status: {duplicate.status}")

        total_days = calculate_leave_days(start_date, end_date)

        leave = LeaveRequest(
            user_id=user_id,
            leave_type_id=data["leave_type_id"],
            start_date=start_date,
            end_date=end_date,
            total_days=total_days,
            reason=data.get("reason")
        )

        db.session.add(leave)
        db.session.commit()

        return leave, total_days

    @staticmethod
    def approve_leave(leave_id: UUID):
        try:
            leave = LeaveRequest.query.filter_by(
                id=leave_id,
                status="PENDING"
            ).with_for_update().first_or_404()

            LeaveLedgerService.deduct_leave(
                user_id=leave.user_id,
                leave_type_id=leave.leave_type_id,
                days=leave.total_days
            )

            leave.status = "APPROVED"
            leave.processed_at = db.func.now()

            db.session.commit()
            return leave

        except Exception as e:
            db.session.rollback()
            raise ValueError(str(e))

    @staticmethod
    def reject_leave(leave_id: UUID, rejection_reason: str = None):
        leave = LeaveRequest.query.get_or_404(leave_id)

        if leave.status != "PENDING":
            raise ValueError("Only pending leaves can be rejected")

        leave.status = "REJECTED"
        leave.rejection_reason = rejection_reason
        leave.processed_at = db.func.now()
        db.session.commit()
        return leave

    @staticmethod
    def get_user_leaves(user_id: UUID) -> List[LeaveRequest]:
        return LeaveRequest.query.filter_by(user_id=user_id).all()

    @staticmethod
    def get_pending_leaves() -> List[LeaveRequest]:
        return LeaveRequest.query.filter_by(status="PENDING").all()
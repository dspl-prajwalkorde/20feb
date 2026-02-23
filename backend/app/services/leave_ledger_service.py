from datetime import date
from app.models.ledger import LeaveLedger
from app.extensions import db

class LeaveLedgerService:

    @staticmethod
    def deduct_leave(user_id, leave_type_id, days, leave_start_date):
        # Use the year from the leave start date, not current year
        leave_year = leave_start_date.year

        ledger = LeaveLedger.query.filter_by(
            user_id=user_id,
            leave_type_id=leave_type_id,
            year=leave_year
        ).with_for_update().first()

        if not ledger:
            # Auto-create ledger for the year if it doesn't exist
            from app.models.leave_type import LeaveType
            leave_type = LeaveType.query.get(leave_type_id)
            if not leave_type:
                raise ValueError("Invalid leave type")
            
            ledger = LeaveLedger(
                user_id=user_id,
                leave_type_id=leave_type_id,
                year=leave_year,
                total_quota=20,  # Default quota
                used_days=0
            )
            db.session.add(ledger)
            db.session.flush()

        if ledger.remaining_days < days:
            raise ValueError(f"Insufficient leave balance for year {leave_year}")

        ledger.used_days += days
        return ledger

    @staticmethod
    def restore_leave(user_id, leave_type_id, days, leave_start_date):
        """Restore leave balance when leave is cancelled"""
        leave_year = leave_start_date.year

        ledger = LeaveLedger.query.filter_by(
            user_id=user_id,
            leave_type_id=leave_type_id,
            year=leave_year
        ).with_for_update().first()

        if not ledger:
            raise ValueError(f"Leave ledger not found for year {leave_year}")

        # Restore the days
        ledger.used_days = max(0, ledger.used_days - days)
        return ledger
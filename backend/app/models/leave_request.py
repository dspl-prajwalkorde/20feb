# app/models/leave_request.py
import uuid
from datetime import date
from app.extensions import db

class LeaveRequest(db.Model):
    __tablename__ = "leave_requests"

    id = db.Column(db.UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    user_id = db.Column(
        db.UUID(as_uuid=True),
        db.ForeignKey("users.id"),
        nullable=False
    )

    leave_type_id = db.Column(
        db.UUID(as_uuid=True),
        db.ForeignKey("leave_types.id"),
        nullable=False
    )

    start_date = db.Column(db.Date, nullable=False)
    end_date = db.Column(db.Date, nullable=False)

    total_days = db.Column(db.Integer, nullable=False)

    status = db.Column(
        db.String(20),
        default="PENDING"  # PENDING / APPROVED / REJECTED
    )

    reason = db.Column(db.String(255))
    rejection_reason = db.Column(db.String(255))
    applied_at = db.Column(db.DateTime, server_default=db.func.now())
    processed_at = db.Column(db.DateTime)

    user = db.relationship("User")
    leave_type = db.relationship("LeaveType")

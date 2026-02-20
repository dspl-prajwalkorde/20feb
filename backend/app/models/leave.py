import uuid
from app.extensions import db

class LeaveType(db.Model):
    __tablename__ = "leave_types"

    id = db.Column(db.UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = db.Column(db.String(50), nullable=False)
    is_active = db.Column(db.Boolean, default=True)

class Leave(db.Model):
    __tablename__ = "leaves"

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

    status = db.Column(db.String(20), default="PENDING")

    reason = db.Column(db.Text)

    # 🔥 RELATIONSHIPS (THIS FIXES YOUR PROBLEM)
    user = db.relationship("User", backref="leaves")
    leave_type = db.relationship("LeaveType", backref="leaves")


# class LeaveLedger(db.Model):
#     __tablename__ = "leave_ledger"

#     id = db.Column(db.UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
#     user_id = db.Column(db.UUID(as_uuid=True), db.ForeignKey("users.id"), nullable=False)
#     leave_type_id = db.Column(db.UUID(as_uuid=True), db.ForeignKey("leave_types.id"), nullable=False)

#     year = db.Column(db.Integer, nullable=False)

#     total_quota = db.Column(db.Integer, nullable=False)
#     used_days = db.Column(db.Integer, default=0)
#     remaining_days = db.Column(db.Integer, nullable=False)
#     user = db.relationship("User", backref="leave_ledgers")
#     leave_type = db.relationship("LeaveType", backref="leave_ledgers")

#     __table_args__ = (
#         db.UniqueConstraint("user_id", "leave_type_id", "year"),
#     )

#     @property
#     def remaining_days(self):
#         return self.total_quota - self.used_days




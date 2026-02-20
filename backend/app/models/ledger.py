import uuid
from app.extensions import db

class LeaveLedger(db.Model):
    __tablename__ = "leave_ledger"

    id = db.Column(db.UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = db.Column(db.UUID(as_uuid=True), db.ForeignKey("users.id"), nullable=False)
    leave_type_id = db.Column(db.UUID(as_uuid=True), db.ForeignKey("leave_types.id"), nullable=False)

    year = db.Column(db.Integer, nullable=False)

    total_quota = db.Column(db.Integer, nullable=False)
    used_days = db.Column(db.Integer, default=0)
    
    user = db.relationship("User", backref="leave_ledgers")
    leave_type = db.relationship("LeaveType", backref="leave_ledgers")

    __table_args__ = (
        db.UniqueConstraint("user_id", "leave_type_id", "year"),
    )

    @property
    def remaining_days(self):
        return self.total_quota - self.used_days
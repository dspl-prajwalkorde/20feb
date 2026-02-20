import uuid
from app.extensions import db

class Role(db.Model):
    __tablename__ = "roles"

    id = db.Column(db.UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = db.Column(db.String(50), unique=True, nullable=False)

    users = db.relationship(
        "User",
        secondary="user_roles",
        back_populates="roles"
    )


import uuid
from app.extensions import db

class Holiday(db.Model):
    __tablename__ = "holidays"

    id = db.Column(db.UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = db.Column(db.String(150), nullable=False)
    date = db.Column(db.Date, nullable=False)
    location = db.Column(db.String(50), nullable=False)  # Pune, Ahmedabad, All
    created_at = db.Column(db.DateTime, server_default=db.func.now())
    
    def __repr__(self):
        return f"<Holiday {self.name} - {self.location} - {self.date}>"

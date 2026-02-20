from app import create_app, db
from app.models import Role, LeaveType
from app.extensions import db

def seed_roles():
    roles = ["EMPLOYEE", "HR", "MANAGER", "ADMIN"]
    for role_name in roles:
        if not Role.query.filter_by(name=role_name).first():
            db.session.add(Role(name=role_name))
    db.session.commit()
    print("✅ Roles seeded")

def seed_leave_types():
    leave_types = [
        {"name": "Planned Leave", "is_active": True},
        {"name": "Emergency Leave", "is_active": True},
    ]

    for lt in leave_types:
        if not LeaveType.query.filter_by(name=lt["name"]).first():
            db.session.add(LeaveType(**lt))

    db.session.commit()
    print("✅ Leave types seeded")

def run():
    app = create_app()
    with app.app_context():
        seed_roles()
        seed_leave_types()

if __name__ == "__main__":
    run()
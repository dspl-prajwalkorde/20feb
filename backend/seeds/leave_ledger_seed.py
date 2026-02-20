from datetime import date
from app.extensions import db
from app.models.user import User
from app.models.leave import LeaveType
from app.models.ledger import LeaveLedger
from app import create_app


def seed_leave_ledger(year=None):
    year = year or date.today().year

    users = User.query.all()
    leave_types = LeaveType.query.all()

    created = 0
    default_quota = 20  # Default quota per leave type

    for user in users:
        for lt in leave_types:
            exists = LeaveLedger.query.filter_by(
                user_id=user.id,
                leave_type_id=lt.id,
                year=year
            ).first()

            if exists:
                continue

            ledger = LeaveLedger(
                user_id=user.id,
                leave_type_id=lt.id,
                year=year,
                total_quota=default_quota,
                used_days=0
            )

            db.session.add(ledger)
            created += 1

    db.session.commit()
    print(f"✅ Seeded {created} leave ledger rows for year {year}")
if __name__ == "__main__":
    app = create_app()
    with app.app_context():
        seed_leave_ledger()

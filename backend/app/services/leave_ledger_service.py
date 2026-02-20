from datetime import date
from app.models.ledger import LeaveLedger

class LeaveLedgerService:

    @staticmethod
    def deduct_leave(user_id, leave_type_id, days):
        current_year = date.today().year

        ledger = LeaveLedger.query.filter_by(
            user_id=user_id,
            leave_type_id=leave_type_id,
            year=current_year
        ).with_for_update().first()

        if not ledger:
            raise ValueError("Leave ledger not initialized for this year")

        if ledger.remaining_days < days:
            raise ValueError("Insufficient leave balance")

        ledger.used_days += days
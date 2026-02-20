# app/services/leave_calculator.py
from datetime import timedelta

WEEKEND_DAYS = {5, 6}  # Saturday=5, Sunday=6

def is_weekend(date):
    """Check if date is Saturday or Sunday"""
    return date.weekday() in WEEKEND_DAYS

def calculate_leave_days(start_date, end_date):
    """
    Applies sandwich rule.
    """
    total_days = 0
    current = start_date

    while current <= end_date:
        total_days += 1
        current += timedelta(days=1)

    return total_days

def validate_leave_dates(start_date, end_date):
    """Validate that leave dates don't fall on weekends"""
    if is_weekend(start_date):
        return False, "Start date cannot be on a weekend (Saturday/Sunday)"
    
    if is_weekend(end_date):
        return False, "End date cannot be on a weekend (Saturday/Sunday)"
    
    return True, None

#!/bin/bash
set -e

echo "Waiting for database to be ready..."
sleep 5

echo "Running database migrations..."
flask db upgrade

echo "Seeding database..."
export PYTHONPATH=/app:$PYTHONPATH
python3 seeds/seed_master_data.py
python3 seeds/seed_admin.py
python3 seeds/seed_users.py
python3 seeds/leave_ledger_seed.py

echo "Database initialization complete!"

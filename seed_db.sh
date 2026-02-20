#!/bin/bash

echo "Seeding database..."

cd backend

echo "Seeding master data (roles and leave types)..."
python seeds/seed_master_data.py

echo "Seeding users (admin, hr, employees)..."
python seeds/seed_users.py

echo "Seeding leave ledger..."
python seeds/leave_ledger_seed.py

echo "Database seeding complete!"
echo ""
echo "Login credentials:"
echo "Admin: admin@nexus.com / admin123"
echo "HR: hr@nexus.com / hr123"
echo "Employee 1: emp1@nexus.com / emp123"
echo "Employee 2: emp2@nexus.com / emp123"

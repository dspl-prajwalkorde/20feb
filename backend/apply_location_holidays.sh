#!/bin/bash
# Run this inside the backend container to add location and holidays features

docker-compose exec backend python3 << 'EOF'
from app.extensions import db
from sqlalchemy import text

# Add location column to users table
db.session.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS location VARCHAR(50) DEFAULT 'Pune'"))

# Create holidays table
db.session.execute(text("""
CREATE TABLE IF NOT EXISTS holidays (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(150) NOT NULL,
    date DATE NOT NULL,
    location VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
)
"""))

db.session.commit()
print("✓ Location and holidays tables created successfully!")
EOF

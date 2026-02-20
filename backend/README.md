# Nexus Pulse Backend

Flask-based REST API for the Nexus Pulse Leave Management System with JWT authentication and role-based access control.

## Tech Stack

- **Flask** - Web framework
- **PostgreSQL** - Database
- **SQLAlchemy** - ORM
- **Flask-JWT-Extended** - JWT authentication
- **Flask-Migrate** - Database migrations
- **Flask-CORS** - Cross-origin resource sharing

## Prerequisites

- Python 3.8+
- PostgreSQL 12+
- pip

## Setup

### 1. Install Dependencies

```bash
pip install -r requirements.txt
```

### 2. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/nexus_pulse
JWT_SECRET_KEY=your-secret-key-change-this-in-production
FLASK_ENV=development
FLASK_APP=manage.py
FRONTEND_URL=http://localhost:3000
```

### 3. Initialize Database

```bash
# Run migrations
flask db upgrade

# Seed master data (leave types, roles)
python seeds/seed_master_data.py

# Seed test users
python seeds/seed_users.py
```

### 4. Run Development Server

```bash
flask run
```

API will be available at `http://localhost:5000`

## Project Structure

```
backend/
├── app/
│   ├── models/          # Database models
│   ├── routes/          # API endpoints
│   ├── services/        # Business logic
│   ├── utils/           # Helper functions
│   ├── config.py        # Configuration
│   └── extensions.py    # Flask extensions
├── migrations/          # Database migrations
├── seeds/              # Database seed scripts
├── manage.py           # Application entry point
└── requirements.txt    # Python dependencies
```

## API Endpoints

### Authentication

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/auth/login` | User login | Public |

**Request Body:**
```json
{
  "email": "user@nexus.com",
  "password": "password123"
}
```

### Leave Management

| Method | Endpoint | Description | Role |
|--------|----------|-------------|------|
| POST | `/leaves/apply` | Apply for leave | Employee |
| GET | `/leaves/my` | Get user's leave requests | Employee |
| GET | `/leaves/mybalance` | Get leave balance | Employee |
| GET | `/leaves/pending` | Get pending requests | HR |
| GET | `/leaves/all` | Get all leave history | HR |
| POST | `/leaves/{id}/approve` | Approve leave request | HR |
| POST | `/leaves/{id}/reject` | Reject leave request | HR |
| POST | `/leaves/adjust-quota` | Adjust employee quota | HR |

### HR Management

| Method | Endpoint | Description | Role |
|--------|----------|-------------|------|
| GET | `/leaves/employees` | Get all employees with balances | HR |
| POST | `/hr/employees` | Create new employee | HR |

## Authentication

All protected endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <token>
```

## Default Test Users

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@nexus.com | admin123 |
| HR | hr@nexus.com | hr123 |
| Employee | emp1@nexus.com | emp123 |

## Database Migrations

```bash
# Create a new migration
flask db migrate -m "Description of changes"

# Apply migrations
flask db upgrade

# Rollback migration
flask db downgrade
```

## Development

### Adding New Endpoints

1. Create route in `app/routes/`
2. Add business logic in `app/services/`
3. Use decorators for authentication and authorization

Example:
```python
from app.utils.permissions import role_required

@leave_bp.route('/apply', methods=['POST'])
@jwt_required()
@role_required(['employee', 'hr', 'admin'])
def apply_leave():
    # Implementation
    pass
```

### Database Models

Models are located in `app/models/`:
- `user.py` - User accounts
- `role.py` - User roles
- `leave_type.py` - Leave types (Casual, Sick, etc.)
- `leave_request.py` - Leave applications
- `leave.py` - Leave ledger entries
- `ledger.py` - Leave balance tracking

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| DATABASE_URL | PostgreSQL connection string | Required |
| JWT_SECRET_KEY | Secret key for JWT tokens | Required |
| FLASK_ENV | Environment (development/production) | development |
| FLASK_APP | Flask application entry point | manage.py |
| FRONTEND_URL | Frontend URL for CORS | http://localhost:3000 |

## License

MIT

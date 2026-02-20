# Nexus Pulse - Leave Management System

A modern leave management system with role-based access control built with Flask and Next.js.

## Features

- JWT Authentication with session isolation per browser tab
- Role-based access (Admin, HR, Employee)
- Leave application and approval workflow
- Leave balance tracking with real-time updates
- Transaction history
- Quota management by HR/Admin
- Modern dark theme UI with Material-UI

## Tech Stack

**Backend:**
- Flask (Python 3.10+)
- PostgreSQL
- SQLAlchemy ORM
- Flask-JWT-Extended
- Flask-Migrate

**Frontend:**
- Next.js 16
- React 18
- Material-UI (MUI)
- Axios
- SessionStorage for tab-specific sessions

## Prerequisites

- Python 3.10+
- Node.js 18+
- PostgreSQL 12+

## Setup Instructions

### 1. Database Setup

```bash
# Create PostgreSQL database
sudo -u postgres psql
CREATE DATABASE leave_mgmt;
CREATE USER leave_user WITH PASSWORD 'leave_pass';
GRANT ALL PRIVILEGES ON DATABASE leave_mgmt TO leave_user;
\q
```

### 2. Backend Setup

```bash
cd backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env with your database credentials

# Run migrations
flask db upgrade

# Seed database
cd ..
bash seed_db.sh
```

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Configure environment
cp .env.example .env.local
# Edit .env.local if backend runs on different port

# Start development server
npm run dev
```

### 4. Start Application

**Terminal 1 - Backend:**
```bash
cd backend
source venv/bin/activate
flask run
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

Access the application at: http://localhost:3000

## Default Users

| Role     | Email              | Password |
|----------|-------------------|----------|
| Admin    | admin@nexus.com   | admin123 |
| HR       | hr@nexus.com      | hr123    |
| Employee | emp1@nexus.com    | emp123   |
| Employee | emp2@nexus.com    | emp123   |

## Project Structure

```
nexus-pulse/
├── backend/
│   ├── app/
│   │   ├── models/          # Database models
│   │   ├── routes/          # API endpoints
│   │   ├── services/        # Business logic
│   │   ├── utils/           # Helper functions
│   │   ├── __init__.py      # App factory
│   │   ├── config.py        # Configuration
│   │   └── extensions.py    # Flask extensions
│   ├── migrations/          # Database migrations
│   ├── seeds/              # Database seed scripts
│   ├── .env                # Environment variables (not in git)
│   ├── .env.example        # Environment template
│   ├── manage.py           # Flask CLI
│   └── requirements.txt    # Python dependencies
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── api/        # Next.js API routes (proxy)
│   │   │   ├── auth/       # Authentication pages
│   │   │   ├── context/    # React context
│   │   │   ├── dashboard/  # Dashboard pages
│   │   │   ├── lib/        # Utilities
│   │   │   └── providers/  # React providers
│   │   └── middleware.js   # Next.js middleware
│   ├── .env.local          # Environment variables (not in git)
│   ├── next.config.mjs     # Next.js configuration
│   └── package.json        # Node dependencies
├── seed_db.sh              # Database seeding script
├── .gitignore              # Git ignore rules
└── README.md               # This file
```

## API Endpoints

### Authentication
- `POST /auth/login` - User login

### Leaves (Employee)
- `POST /leaves/apply` - Apply for leave
- `GET /leaves/my` - Get user's leaves (paginated)
- `GET /leaves/mybalance` - Get leave balance
- `GET /leaves/types` - Get all leave types

### Leaves (HR/Admin)
- `GET /leaves/pending` - Get pending requests
- `GET /leaves/all` - Get all leave history
- `GET /leaves/employees` - Get all employees with balances
- `POST /leaves/{id}/approve` - Approve leave
- `POST /leaves/{id}/reject` - Reject leave
- `POST /leaves/adjust-quota` - Adjust leave quota

### HR
- `POST /hr/employees` - Create new employee

## Key Features

### Tab-Specific Sessions
- Uses sessionStorage instead of localStorage
- Each browser tab maintains its own session
- Login in one tab doesn't affect other tabs
- Prevents privilege escalation across tabs

### Role-Based Access Control
- Admin: Full access to all features
- HR: Manage employees, approve/reject leaves, adjust quotas
- Employee: Apply for leaves, view own history and balance

### Leave Management
- Apply for leaves with date range
- Automatic calculation of leave days
- Validation for overlapping leaves
- Real-time balance updates
- Approval/rejection workflow with reasons

## Development

### Adding New Migrations
```bash
cd backend
flask db migrate -m "Description of changes"
flask db upgrade
```

### Adding New Seed Data
Create a new file in `backend/seeds/` and add it to `seed_db.sh`

### Testing Routes
```bash
cd backend
bash test_routes.sh
```

## Security Notes

- JWT tokens stored in sessionStorage (tab-specific)
- Passwords hashed with bcrypt
- CORS configured for frontend origin
- Role-based endpoint protection
- Input validation on all endpoints

## Troubleshooting

### Backend won't start
- Check PostgreSQL is running: `sudo systemctl status postgresql`
- Verify database credentials in `.env`
- Ensure migrations are up to date: `flask db upgrade`

### Frontend won't connect
- Verify backend is running on port 5000
- Check `NEXT_PUBLIC_BACKEND_URL` in `.env.local`
- Clear browser cache and sessionStorage

### Database errors
- Run migrations: `flask db upgrade`
- Reseed database: `bash seed_db.sh`

## License

MIT

## Contributors

Built with ❤️ for efficient leave management

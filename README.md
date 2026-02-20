# Nexus Pulse - Leave Management System

A modern, full-stack leave management system with role-based access control, built with Flask and Next.js. Features include JWT authentication with tab-specific sessions, real-time leave balance tracking, and comprehensive admin controls for employee and role management.

## ✨ Features

### Authentication & Security
- JWT-based authentication with session isolation per browser tab
- Secure password hashing with bcrypt
- Role-based access control (Admin, HR, Employee)
- Tab-specific sessions prevent privilege escalation

### Leave Management
- Apply for leaves with date range selection
- Automatic calculation of leave days (excluding weekends)
- Real-time leave balance tracking
- Leave approval/rejection workflow with reasons
- Validation for overlapping leaves
- Transaction history for all leave activities

### Admin Features
- **Employee Management Dashboard**: View all employees in a centralized table
- **Dynamic Role Management**: Add or remove roles (Admin, HR, Employee) for any user
- **User Status Control**: Toggle user status between Active/Inactive with a switch
- View system statistics (total employees, pending requests)

### HR Features
- Create new employee accounts
- Approve or reject leave requests
- Adjust leave quotas for employees
- View all employee leave balances

### UI/UX
- Modern dark theme with Material-UI
- Responsive design for all screen sizes
- Gradient cards and smooth animations
- Real-time success/error notifications

## 🛠️ Tech Stack

**Backend:**
- Flask (Python 3.10+)
- PostgreSQL 12+
- SQLAlchemy ORM
- Flask-JWT-Extended
- Flask-Migrate
- Werkzeug (password hashing)

**Frontend:**
- Next.js 15+
- React 18
- Material-UI (MUI) v5
- Axios
- SessionStorage for tab-specific sessions

## 📋 Prerequisites

- Python 3.10 or higher
- Node.js 18 or higher
- PostgreSQL 12 or higher
- Git

## 🚀 Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/nexus-pulse.git
cd nexus-pulse
```

### 2. Database Setup

```bash
# Start PostgreSQL service
sudo systemctl start postgresql

# Create database and user
sudo -u postgres psql
```

```sql
CREATE DATABASE leave_mgmt;
CREATE USER leave_user WITH PASSWORD 'leave_pass';
GRANT ALL PRIVILEGES ON DATABASE leave_mgmt TO leave_user;
\q
```

### 3. Backend Setup

```bash
cd backend

# Create and activate virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment variables
cp .env.example .env
# Edit .env with your database credentials:
# DATABASE_URL=postgresql://leave_user:leave_pass@localhost/leave_mgmt
# JWT_SECRET_KEY=your-secret-key-here
# FRONTEND_URL=http://localhost:3000

# Run database migrations
flask db upgrade

# Seed database with initial data
cd ..
bash seed_db.sh
```

### 4. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env.local
# Edit .env.local:
# NEXT_PUBLIC_BACKEND_URL=http://localhost:5000
```

### 5. Start the Application

**Terminal 1 - Backend:**
```bash
cd backend
source venv/bin/activate
flask run
# Backend runs on http://localhost:5000
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
# Frontend runs on http://localhost:3000
```

### 6. Access the Application

Open your browser and navigate to: **http://localhost:3000**

## 👥 Default Users

| Role     | Email              | Password | Access Level |
|----------|-------------------|----------|-------------|
| Admin    | admin@nexus.com   | admin123 | Full system access, employee & role management |
| HR       | hr@nexus.com      | hr123    | Employee management, leave approvals |
| Employee | emp1@nexus.com    | emp123   | Apply for leaves, view own data |
| Employee | emp2@nexus.com    | emp123   | Apply for leaves, view own data |

## 📁 Project Structure

```
nexus-pulse/
├── backend/
│   ├── app/
│   │   ├── models/              # Database models (User, Role, Leave, etc.)
│   │   ├── routes/              # API endpoints
│   │   │   ├── admin.py         # Admin routes (user & role management)
│   │   │   ├── auth.py          # Authentication routes
│   │   │   ├── hr.py            # HR routes
│   │   │   ├── leave.py         # Leave management routes
│   │   │   └── user.py          # User profile routes
│   │   ├── services/            # Business logic
│   │   ├── utils/               # Helper functions & permissions
│   │   ├── __init__.py          # Flask app factory
│   │   ├── config.py            # Configuration
│   │   └── extensions.py        # Flask extensions
│   ├── migrations/              # Database migrations
│   ├── seeds/                   # Database seed scripts
│   ├── .env.example             # Environment template
│   ├── manage.py                # Flask CLI
│   └── requirements.txt         # Python dependencies
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── api/             # Next.js API routes (proxy to backend)
│   │   │   │   ├── admin/       # Admin API proxies
│   │   │   │   ├── auth/        # Auth API proxies
│   │   │   │   ├── hr/          # HR API proxies
│   │   │   │   └── leaves/      # Leave API proxies
│   │   │   ├── auth/            # Authentication pages
│   │   │   ├── context/         # React context (AuthContext)
│   │   │   ├── dashboard/       # Dashboard pages
│   │   │   │   ├── admin/       # Admin dashboard & employee management
│   │   │   │   ├── hr/          # HR dashboard
│   │   │   │   └── employee/    # Employee dashboard
│   │   │   ├── lib/             # Utilities (API client)
│   │   │   └── providers/       # React providers
│   │   └── middleware.js        # Next.js auth middleware
│   ├── .env.example             # Environment template
│   ├── next.config.mjs          # Next.js configuration
│   └── package.json             # Node dependencies
├── seed_db.sh                   # Database seeding script
├── .gitignore                   # Git ignore rules
└── README.md                    # This file
```

## 🔌 API Endpoints

### Authentication
- `POST /auth/login` - User login (returns JWT token)

### Admin Routes
- `GET /admin/users` - Get all users with pagination
- `POST /admin/users/{user_id}/roles` - Assign role to user
- `DELETE /admin/users/{user_id}/roles/{role_name}` - Remove role from user
- `PATCH /admin/users/{user_id}/status` - Update user active/inactive status

### Leave Routes (Employee)
- `POST /leaves/apply` - Apply for leave
- `GET /leaves/my` - Get user's leave history (paginated)
- `GET /leaves/mybalance` - Get current leave balance
- `GET /leaves/types` - Get all available leave types

### Leave Routes (HR/Admin)
- `GET /leaves/pending` - Get pending leave requests
- `GET /leaves/all` - Get all leave history (paginated)
- `GET /leaves/employees` - Get all employees with leave balances
- `POST /leaves/{id}/approve` - Approve leave request
- `POST /leaves/{id}/reject` - Reject leave request
- `POST /leaves/adjust-quota` - Adjust employee leave quota

### HR Routes
- `POST /hr/employees` - Create new employee account

## 🎯 Key Features Explained

### Tab-Specific Sessions
- Uses `sessionStorage` instead of `localStorage`
- Each browser tab maintains its own independent session
- Logging in as different users in different tabs is supported
- Prevents privilege escalation across tabs
- Automatic session cleanup on tab close

### Role-Based Access Control

**Admin:**
- Full system access
- View and manage all employees
- Add/remove roles dynamically (Admin, HR, Employee)
- Toggle user status (Active/Inactive)
- All HR and Employee permissions

**HR:**
- Create new employee accounts
- Approve/reject leave requests
- Adjust leave quotas
- View all employee leave balances
- All Employee permissions

**Employee:**
- Apply for leaves
- View own leave history
- Check leave balance
- View leave types

### Admin Employee Management
- **Centralized Dashboard**: Click "Total Employees" card to access
- **Role Management**: 
  - Click `+` icon to add roles
  - Click `X` on role chips to remove roles
  - Supports multiple roles per user
- **Status Control**: Toggle switch to activate/deactivate users
- **Real-time Updates**: Changes reflect immediately

## 🔧 Development

### Adding Database Migrations

```bash
cd backend
source venv/bin/activate
flask db migrate -m "Description of changes"
flask db upgrade
```

### Adding Seed Data

1. Create a new Python file in `backend/seeds/`
2. Add the seed script to `seed_db.sh`
3. Run: `bash seed_db.sh`

### Environment Variables

**Backend (.env):**
```env
DATABASE_URL=postgresql://leave_user:leave_pass@localhost/leave_mgmt
JWT_SECRET_KEY=your-secret-key-here
JWT_ACCESS_TOKEN_EXPIRES=3600
FRONTEND_URL=http://localhost:3000
```

**Frontend (.env.local):**
```env
NEXT_PUBLIC_BACKEND_URL=http://localhost:5000
```

## 🔒 Security Features

- JWT tokens with configurable expiration
- Passwords hashed using bcrypt
- CORS configured for specific frontend origin
- Role-based endpoint protection with decorators
- Input validation on all API endpoints
- SQL injection prevention via SQLAlchemy ORM
- XSS protection with React's built-in escaping

## 🐛 Troubleshooting

### Backend Issues

**Backend won't start:**
```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Verify database connection
psql -U leave_user -d leave_mgmt -h localhost

# Check migrations
flask db upgrade
```

**Database errors:**
```bash
# Reset database
flask db downgrade base
flask db upgrade
bash seed_db.sh
```

### Frontend Issues

**Frontend won't connect:**
- Verify backend is running: `curl http://localhost:5000`
- Check `NEXT_PUBLIC_BACKEND_URL` in `.env.local`
- Clear browser cache and sessionStorage
- Check browser console for errors

**Build errors:**
```bash
# Clear Next.js cache
rm -rf .next
npm run dev
```

### Common Errors

**"params is a Promise" error:**
- Ensure all API routes use `await params` (Next.js 15+)

**CORS errors:**
- Verify `FRONTEND_URL` in backend `.env` matches frontend URL

**JWT errors:**
- Check token expiration settings
- Clear sessionStorage and login again

## 📝 License

MIT License - feel free to use this project for personal or commercial purposes.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📧 Support

For issues and questions, please open an issue on GitHub.

## 🙏 Acknowledgments

- Built with Flask and Next.js
- UI components from Material-UI
- Icons from Material Icons

---

Built with ❤️ for efficient leave management

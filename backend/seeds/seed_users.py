from app import create_app, db
from app.models.user import User
from app.models.role import Role

app = create_app()

with app.app_context():
    admin_role = Role.query.filter_by(name="ADMIN").first()
    hr_role = Role.query.filter_by(name="HR").first()
    emp_role = Role.query.filter_by(name="EMPLOYEE").first()

    # Check and create admin
    if not User.query.filter_by(email="admin@nexus.com").first():
        admin = User(email="admin@nexus.com", full_name="Admin User")
        admin.set_password("admin123")
        admin.roles.append(admin_role)
        db.session.add(admin)

    # Check and create HR
    if not User.query.filter_by(email="hr@nexus.com").first():
        hr = User(email="hr@nexus.com", full_name="HR Manager")
        hr.set_password("hr123")
        hr.roles.append(hr_role)
        db.session.add(hr)

    # Check and create Employee 1
    if not User.query.filter_by(email="emp1@nexus.com").first():
        emp1 = User(email="emp1@nexus.com", full_name="Employee One")
        emp1.set_password("emp123")
        emp1.roles.append(emp_role)
        db.session.add(emp1)

    # Check and create Employee 2
    if not User.query.filter_by(email="emp2@nexus.com").first():
        emp2 = User(email="emp2@nexus.com", full_name="Employee Two")
        emp2.set_password("emp123")
        emp2.roles.append(emp_role)
        db.session.add(emp2)

    db.session.commit()
    print("✅ Users and roles seeded")

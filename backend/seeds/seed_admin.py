from app import create_app, db
from app.models.user import User
from app.models.role import Role

app = create_app()

with app.app_context():
    admin_role = Role.query.filter_by(name="ADMIN").first()
    
    if not admin_role:
        print("❌ ADMIN role not found. Please run seed_master_data.py first")
        exit(1)
    
    existing_admin = User.query.filter_by(email="admin@nexus.com").first()
    
    if existing_admin:
        print("⚠️  Admin user already exists")
    else:
        admin = User(email="admin@nexus.com", full_name="Admin User")
        admin.set_password("admin123")
        admin.roles.append(admin_role)
        
        db.session.add(admin)
        db.session.commit()
        
        print("✅ Admin user created successfully")
        print("   Email: admin@nexus.com")
        print("   Password: admin123")

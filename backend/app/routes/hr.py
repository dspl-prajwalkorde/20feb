from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from app.utils.permissions import role_required
from app.models.user import User
from app.models.role import Role
from app.models.ledger import LeaveLedger
from app.models.leave import LeaveType
from app.extensions import db
from datetime import datetime

hr_bp = Blueprint("hr", __name__, url_prefix="/hr")

@hr_bp.route("/dashboard")
@role_required("HR")
def dashboard():
    return {"message": "Welcome HR"}

@hr_bp.route("/employees", methods=["POST"])
@jwt_required()
@role_required("HR")
def create_employee():
    data = request.get_json()
    
    email = data.get("email")
    full_name = data.get("full_name")
    password = data.get("password")
    
    if not email or not full_name or not password:
        return jsonify({"message": "Email, full name, and password are required"}), 400
    
    if User.query.filter_by(email=email).first():
        return jsonify({"message": "Email already exists"}), 400
    
    employee_role = Role.query.filter_by(name="EMPLOYEE").first()
    if not employee_role:
        return jsonify({"message": "Employee role not found"}), 500
    
    new_user = User(email=email, full_name=full_name)
    new_user.set_password(password)
    new_user.roles.append(employee_role)
    
    db.session.add(new_user)
    db.session.flush()
    
    current_year = datetime.utcnow().year
    leave_types = LeaveType.query.all()
    
    if not leave_types:
        db.session.rollback()
        return jsonify({"message": "No leave types found. Please contact administrator."}), 500
    
    leave_quotas = {
        "Planned Leave": 18,
        "Emergency Leave": 5
    }
    
    for leave_type in leave_types:
        quota = leave_quotas.get(leave_type.name, 15)
        ledger = LeaveLedger(
            user_id=new_user.id,
            leave_type_id=leave_type.id,
            year=current_year,
            total_quota=quota,
            used_days=0
        )
        db.session.add(ledger)
    
    db.session.commit()
    
    return jsonify({
        "message": "Employee created successfully",
        "user_id": str(new_user.id),
        "email": new_user.email,
        "full_name": new_user.full_name
    }), 201

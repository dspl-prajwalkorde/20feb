from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from uuid import UUID
from app.models.user import User
from app.models.role import Role
from app.models.user_role import UserRole
from app.utils.permissions import role_required
from app.extensions import db

admin_bp = Blueprint("admin", __name__, url_prefix="/admin")


@admin_bp.route("/users", methods=["GET"])
@jwt_required()
@role_required("ADMIN")
def get_all_users():
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    
    pagination = User.query.paginate(page=page, per_page=per_page, error_out=False)
    
    return jsonify({
        "items": [
            {
                "id": str(user.id),
                "email": user.email,
                "full_name": user.full_name,
                "is_active": user.is_active,
                "roles": [role.name for role in user.roles]
            }
            for user in pagination.items
        ],
        "total": pagination.total,
        "page": pagination.page,
        "per_page": pagination.per_page,
        "pages": pagination.pages
    }), 200


@admin_bp.route("/users/<uuid:user_id>/roles", methods=["POST"])
@jwt_required()
@role_required("ADMIN")
def assign_role(user_id):
    data = request.get_json()
    
    if not data.get("role_name"):
        return jsonify({"message": "role_name is required"}), 400
    
    role_name = data.get("role_name").upper()
    
    if role_name not in ["ADMIN", "HR", "EMPLOYEE"]:
        return jsonify({"message": "Invalid role. Must be ADMIN, HR, or EMPLOYEE"}), 400
    
    user = User.query.get_or_404(user_id)
    role = Role.query.filter_by(name=role_name).first()
    
    if not role:
        return jsonify({"message": "Role not found"}), 404
    
    if user.has_role(role_name):
        return jsonify({"message": f"User already has {role_name} role"}), 400
    
    user_role = UserRole(user_id=user.id, role_id=role.id)
    db.session.add(user_role)
    db.session.commit()
    
    return jsonify({
        "message": f"{role_name} role assigned successfully",
        "user_id": str(user.id),
        "roles": [r.name for r in user.roles]
    }), 200


@admin_bp.route("/users/<uuid:user_id>/roles/<role_name>", methods=["DELETE"])
@jwt_required()
@role_required("ADMIN")
def remove_role(user_id, role_name):
    role_name = role_name.upper()
    
    if role_name not in ["ADMIN", "HR", "EMPLOYEE"]:
        return jsonify({"message": "Invalid role"}), 400
    
    user = User.query.get_or_404(user_id)
    role = Role.query.filter_by(name=role_name).first()
    
    if not role:
        return jsonify({"message": "Role not found"}), 404
    
    if not user.has_role(role_name):
        return jsonify({"message": f"User does not have {role_name} role"}), 400
    
    user_role = UserRole.query.filter_by(user_id=user.id, role_id=role.id).first()
    
    if user_role:
        db.session.delete(user_role)
        db.session.commit()
    
    return jsonify({
        "message": f"{role_name} role removed successfully",
        "user_id": str(user.id),
        "roles": [r.name for r in user.roles]
    }), 200


@admin_bp.route("/users/<uuid:user_id>/status", methods=["PATCH"])
@jwt_required()
@role_required("ADMIN")
def update_user_status(user_id):
    data = request.get_json()
    
    if "is_active" not in data:
        return jsonify({"message": "is_active is required"}), 400
    
    user = User.query.get_or_404(user_id)
    user.is_active = bool(data["is_active"])
    db.session.commit()
    
    return jsonify({
        "message": "User status updated successfully",
        "user_id": str(user.id),
        "is_active": user.is_active
    }), 200

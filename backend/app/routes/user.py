from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from uuid import UUID
from app.extensions import db
from app.models.user import User

user_bp = Blueprint("user", __name__, url_prefix="/user")

@user_bp.route("/profile", methods=["PUT"])
@jwt_required()
def update_profile():
    data = request.get_json()
    
    if not data.get('full_name', '').strip():
        return jsonify({"message": "Full name is required"}), 400
    
    identity = get_jwt_identity()
    user_id = identity if isinstance(identity, UUID) else UUID(identity)
    
    user = User.query.get(user_id)
    if not user:
        return jsonify({"message": "User not found"}), 404
    
    user.full_name = data['full_name'].strip()
    db.session.commit()
    
    return jsonify({
        "message": "Profile updated successfully",
        "full_name": user.full_name
    }), 200

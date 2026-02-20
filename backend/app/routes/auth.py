from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token
from flask_cors import cross_origin
from app.models.user import User

auth_bp = Blueprint("auth", __name__, url_prefix="/auth")

@auth_bp.route("/login", methods=["POST", "OPTIONS"])
@cross_origin(origins="http://localhost:3000")
def login():
    data = request.get_json()

    if not data:
        return jsonify({"message": "Invalid JSON"}), 400

    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return jsonify({"message": "Email and password required"}), 400

    user = User.query.filter_by(email=email).first()

    if not user or not user.check_password(password):
        return jsonify({"message": "Invalid credentials"}), 401

    access_token = create_access_token(
        identity=str(user.id),
        additional_claims={
            "roles": [role.name for role in user.roles]
        }
    )

    return jsonify({
        "access_token": access_token,
        "user": {
            "email": user.email,
            "full_name": user.full_name,
            "roles": [r.name for r in user.roles]
        }
    }), 200
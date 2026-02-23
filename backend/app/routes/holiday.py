from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from datetime import datetime
from uuid import UUID
from app.models.holiday import Holiday
from app.utils.permissions import role_required
from app.extensions import db

holiday_bp = Blueprint("holiday", __name__, url_prefix="/holidays")


@holiday_bp.route("", methods=["GET"])
@jwt_required()
def get_holidays():
    """Get all holidays or filter by location"""
    location = request.args.get('location', None)
    
    query = Holiday.query
    if location and location != 'All':
        query = query.filter((Holiday.location == location) | (Holiday.location == 'All'))
    
    holidays = query.order_by(Holiday.date.desc()).all()
    
    return jsonify([
        {
            "id": str(h.id),
            "name": h.name,
            "date": h.date.isoformat(),
            "location": h.location
        }
        for h in holidays
    ]), 200


@holiday_bp.route("", methods=["POST"])
@jwt_required()
@role_required("ADMIN")
def create_holiday():
    """Create a new holiday"""
    data = request.get_json()
    
    required_fields = ['name', 'date', 'location']
    if not all(field in data for field in required_fields):
        return jsonify({"message": "Missing required fields"}), 400
    
    try:
        holiday_date = datetime.strptime(data['date'], '%Y-%m-%d').date()
    except ValueError:
        return jsonify({"message": "Invalid date format. Use YYYY-MM-DD"}), 400
    
    if data['location'] not in ['Pune', 'Ahmedabad', 'All']:
        return jsonify({"message": "Invalid location. Must be Pune, Ahmedabad, or All"}), 400
    
    holiday = Holiday(
        name=data['name'],
        date=holiday_date,
        location=data['location']
    )
    
    db.session.add(holiday)
    db.session.commit()
    
    return jsonify({
        "message": "Holiday created successfully",
        "holiday": {
            "id": str(holiday.id),
            "name": holiday.name,
            "date": holiday.date.isoformat(),
            "location": holiday.location
        }
    }), 201


@holiday_bp.route("/<uuid:holiday_id>", methods=["DELETE"])
@jwt_required()
@role_required("ADMIN")
def delete_holiday(holiday_id):
    """Delete a holiday"""
    holiday = Holiday.query.get_or_404(holiday_id)
    
    db.session.delete(holiday)
    db.session.commit()
    
    return jsonify({"message": "Holiday deleted successfully"}), 200

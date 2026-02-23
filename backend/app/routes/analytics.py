from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required
from app.utils.permissions import role_required
from app.models.leave_request import LeaveRequest
from app.models.leave import LeaveType
from app.extensions import db
from sqlalchemy import func, extract
from datetime import datetime

analytics_bp = Blueprint("analytics", __name__, url_prefix="/analytics")


@analytics_bp.route("/leave-trends", methods=["GET"])
@jwt_required()
@role_required("HR")
def leave_trends():
    """Monthly leave trends for current year"""
    year = request.args.get('year', datetime.now().year, type=int)
    
    trends = db.session.query(
        extract('month', LeaveRequest.start_date).label('month'),
        func.count(LeaveRequest.id).label('count'),
        func.sum(LeaveRequest.total_days).label('total_days')
    ).filter(
        extract('year', LeaveRequest.start_date) == year,
        LeaveRequest.status == 'APPROVED'
    ).group_by('month').order_by('month').all()
    
    return jsonify([
        {
            "month": int(t.month),
            "count": t.count,
            "total_days": float(t.total_days) if t.total_days else 0
        }
        for t in trends
    ]), 200


@analytics_bp.route("/leave-types-stats", methods=["GET"])
@jwt_required()
@role_required("HR")
def leave_types_stats():
    """Most used leave types"""
    stats = db.session.query(
        LeaveType.name,
        func.count(LeaveRequest.id).label('count'),
        func.sum(LeaveRequest.total_days).label('total_days')
    ).join(LeaveRequest).filter(
        LeaveRequest.status == 'APPROVED'
    ).group_by(LeaveType.name).all()
    
    return jsonify([
        {
            "leave_type": s.name,
            "count": s.count,
            "total_days": float(s.total_days) if s.total_days else 0
        }
        for s in stats
    ]), 200


@analytics_bp.route("/peak-periods", methods=["GET"])
@jwt_required()
@role_required("HR")
def peak_periods():
    """Peak leave periods"""
    year = request.args.get('year', datetime.now().year, type=int)
    
    peaks = db.session.query(
        LeaveRequest.start_date,
        func.count(LeaveRequest.id).label('count')
    ).filter(
        extract('year', LeaveRequest.start_date) == year,
        LeaveRequest.status == 'APPROVED'
    ).group_by(LeaveRequest.start_date).order_by(
        func.count(LeaveRequest.id).desc()
    ).limit(10).all()
    
    return jsonify([
        {
            "date": p.start_date.isoformat(),
            "count": p.count
        }
        for p in peaks
    ]), 200


@analytics_bp.route("/summary", methods=["GET"])
@jwt_required()
@role_required("HR")
def analytics_summary():
    """Overall analytics summary"""
    from app.models.user import User
    
    total_employees = User.query.filter(User.roles.any(name='EMPLOYEE')).count()
    
    current_year = datetime.now().year
    total_leaves = LeaveRequest.query.filter(
        extract('year', LeaveRequest.start_date) == current_year
    ).count()
    
    approved_leaves = LeaveRequest.query.filter(
        extract('year', LeaveRequest.start_date) == current_year,
        LeaveRequest.status == 'APPROVED'
    ).count()
    
    pending_leaves = LeaveRequest.query.filter_by(status='PENDING').count()
    
    return jsonify({
        "total_employees": total_employees,
        "total_leaves": total_leaves,
        "approved_leaves": approved_leaves,
        "pending_leaves": pending_leaves,
        "approval_rate": round((approved_leaves / total_leaves * 100) if total_leaves > 0 else 0, 2)
    }), 200

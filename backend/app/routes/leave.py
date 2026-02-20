from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime, date
from uuid import UUID
from app.services.leave_service import LeaveService
from app.services.leave_calculator import validate_leave_dates
from app.models.ledger import LeaveLedger
from app.models.leave_request import LeaveRequest
from app.utils.permissions import role_required
from app.extensions import db

leave_bp = Blueprint("leave", __name__, url_prefix="/leaves")


# ---------------- EMPLOYEE ----------------
@leave_bp.route("/types", methods=["GET"])
@jwt_required()
def get_leave_types():
    from app.models.leave import LeaveType
    leave_types = LeaveType.query.all()
    
    return jsonify([
        {
            "id": str(lt.id),
            "name": lt.name
        }
        for lt in leave_types
    ]), 200


@leave_bp.route("/apply", methods=["POST"])
@jwt_required()
def apply_leave():
    data = request.get_json()
    
    required_fields = ['start_date', 'end_date', 'leave_type_id', 'reason']
    if not all(field in data for field in required_fields):
        return jsonify({"message": "Missing required fields"}), 400

    # Validate reason is not empty
    if not data.get('reason', '').strip():
        return jsonify({"message": "Reason is required"}), 400

    try:
        data["start_date"] = datetime.strptime(
            data["start_date"], "%Y-%m-%d"
        ).date()

        data["end_date"] = datetime.strptime(
            data["end_date"], "%Y-%m-%d"
        ).date()
    except ValueError:
        return jsonify({"message": "Invalid date format. Use YYYY-MM-DD"}), 400

    # Validate dates are not in the past
    today = date.today()
    if data["start_date"] < today:
        return jsonify({"message": "Start date cannot be in the past"}), 400
    
    if data["end_date"] < today:
        return jsonify({"message": "End date cannot be in the past"}), 400

    # Validate dates are not on weekends
    is_valid, error_msg = validate_leave_dates(data["start_date"], data["end_date"])
    if not is_valid:
        return jsonify({"message": error_msg}), 400

    try:
        identity = get_jwt_identity()
        user_id = identity if isinstance(identity, UUID) else UUID(identity)
        
        leave, total_days = LeaveService.apply_leave(
            user_id, data
        )
    except ValueError as e:
        return jsonify({"message": str(e)}), 400
    except Exception as e:
        return jsonify({"message": f"Error applying leave: {str(e)}"}), 500

    return jsonify({
    "message": "Leave applied successfully",
    "leave_id": str(leave.id),
    "total_days": total_days,
    "status": leave.status
    }), 201

@leave_bp.route("/my", methods=["GET"])
@jwt_required()
def my_leaves():
    identity = get_jwt_identity()
    user_id = identity if isinstance(identity, UUID) else UUID(identity)
    
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)
    status_filter = request.args.get('status', 'all', type=str).lower()
    sort_by = request.args.get('sort', 'date_desc', type=str)
    
    print(f"DEBUG: Filters - status={status_filter}, sort={sort_by}, page={page}")
    
    query = LeaveRequest.query.filter_by(user_id=user_id)
    
    # Apply status filter
    if status_filter != 'all':
        query = query.filter_by(status=status_filter.upper())
    
    # Apply sorting
    if sort_by == 'date_asc':
        query = query.order_by(LeaveRequest.applied_at.asc())
    else:  # date_desc (default)
        query = query.order_by(LeaveRequest.applied_at.desc())
    
    pagination = query.paginate(page=page, per_page=per_page, error_out=False)
    
    print(f"DEBUG: Found {pagination.total} total items, {len(pagination.items)} on this page")

    response = jsonify({
        "items": [
            {
                "leave_id": str(l.id),
                "leave_type": l.leave_type.name,
                "status": l.status,
                "start_date": l.start_date.isoformat(),
                "end_date": l.end_date.isoformat(),
                "total_days": l.total_days,
                "reason": l.reason,
                "rejection_reason": l.rejection_reason,
                "applied_at": l.applied_at.isoformat() if l.applied_at else None,
                "processed_at": l.processed_at.isoformat() if l.processed_at else None
            }
            for l in pagination.items
        ],
        "total": pagination.total,
        "page": pagination.page,
        "per_page": pagination.per_page,
        "pages": pagination.pages
    })
    
    response.headers['Cache-Control'] = 'no-store, no-cache, must-revalidate, max-age=0'
    response.headers['Pragma'] = 'no-cache'
    response.headers['Expires'] = '0'
    
    return response, 200

@leave_bp.route("/mybalance", methods=["GET"])
@jwt_required()
def my_balance():
    identity = get_jwt_identity()
    user_id = identity if isinstance(identity, UUID) else UUID(identity)

    current_year = datetime.utcnow().year

    # Filter by current year (VERY IMPORTANT)
    ledgers = LeaveLedger.query.filter_by(
        user_id=user_id,
        year=current_year
    ).all()

    result = []

    for ledger in ledgers:
        result.append({
            "leave_type_id": str(ledger.leave_type.id),
            "leave_type": ledger.leave_type.name,
            "total_quota": ledger.total_quota,
            "used_days": ledger.used_days,
            "remaining_days": ledger.remaining_days
        })

    return jsonify(result), 200


# ---------------- HR ----------------

@leave_bp.route("/employees", methods=["GET"])
@jwt_required()
@role_required("HR")
def get_employees():
    from app.models.user import User
    current_year = datetime.utcnow().year
    
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    
    pagination = User.query.paginate(page=page, per_page=per_page, error_out=False)
    
    result = []
    for emp in pagination.items:
        if not emp.is_employee:
            continue
            
        ledgers = LeaveLedger.query.filter_by(
            user_id=emp.id,
            year=current_year
        ).all()
        
        result.append({
            "user_id": str(emp.id),
            "full_name": emp.full_name,
            "email": emp.email,
            "leave_balances": [
                {
                    "leave_type_id": str(l.leave_type.id),
                    "leave_type": l.leave_type.name,
                    "total_quota": l.total_quota,
                    "used_days": l.used_days,
                    "remaining_days": l.remaining_days
                }
                for l in ledgers
            ]
        })
    
    return jsonify({
        "items": result,
        "total": pagination.total,
        "page": pagination.page,
        "per_page": pagination.per_page,
        "pages": pagination.pages
    }), 200


@leave_bp.route("/all", methods=["GET"])
@jwt_required()
@role_required("HR")
def all_leaves():
    from app.models.user import User
    
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    status_filter = request.args.get('status', 'all', type=str).lower()
    sort_by = request.args.get('sort', 'date_desc', type=str)
    search = request.args.get('search', '', type=str).strip()
    
    query = LeaveRequest.query.join(User)
    
    # Apply status filter
    if status_filter != 'all':
        query = query.filter(LeaveRequest.status == status_filter.upper())
    
    # Apply search filter
    if search:
        query = query.filter(User.full_name.ilike(f'%{search}%'))
    
    # Apply sorting
    if sort_by == 'date_asc':
        query = query.order_by(LeaveRequest.applied_at.asc())
    else:  # date_desc (default)
        query = query.order_by(LeaveRequest.applied_at.desc())
    
    pagination = query.paginate(page=page, per_page=per_page, error_out=False)
    
    return jsonify({
        "items": [
            {
                "leave_id": str(l.id),
                "employee_name": l.user.full_name,
                "employee_email": l.user.email,
                "leave_type": l.leave_type.name,
                "start_date": l.start_date.isoformat(),
                "end_date": l.end_date.isoformat(),
                "total_days": l.total_days,
                "status": l.status,
                "reason": l.reason,
                "rejection_reason": l.rejection_reason,
                "applied_at": l.applied_at.isoformat() if l.applied_at else None,
                "processed_at": l.processed_at.isoformat() if l.processed_at else None
            }
            for l in pagination.items
        ],
        "total": pagination.total,
        "page": pagination.page,
        "per_page": pagination.per_page,
        "pages": pagination.pages
    }), 200


@leave_bp.route("/pending", methods=["GET"])
@jwt_required()
@role_required("HR")
def pending_leaves():
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        
        pagination = LeaveRequest.query.filter_by(status="PENDING").order_by(
            LeaveRequest.applied_at.desc()
        ).paginate(page=page, per_page=per_page, error_out=False)

        return jsonify({
            "items": [
                {
                    "leave_id": str(l.id),
                    "employee_name": l.user.full_name,
                    "employee_id": str(l.user.id),
                    "leave_type": l.leave_type.name,
                    "leave_type_id": str(l.leave_type.id),
                    "start_date": l.start_date.isoformat(),
                    "end_date": l.end_date.isoformat(),
                    "total_days": l.total_days,
                    "reason": l.reason
                }
                for l in pagination.items
            ],
            "total": pagination.total,
            "page": pagination.page,
            "per_page": pagination.per_page,
            "pages": pagination.pages
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@leave_bp.route("/update-quota", methods=["POST"])
@jwt_required()
@role_required("HR")
def update_quota():
    data = request.get_json()
    
    required_fields = ['user_id', 'leave_type_id', 'new_quota']
    if not all(field in data for field in required_fields):
        return jsonify({"message": "Missing required fields"}), 400

    try:
        user_id = UUID(data.get("user_id"))
        leave_type_id = UUID(data.get("leave_type_id"))
        new_quota = int(data.get("new_quota"))
    except (ValueError, TypeError):
        return jsonify({"message": "Invalid user_id, leave_type_id, or new_quota"}), 400

    current_year = datetime.utcnow().year

    ledger = LeaveLedger.query.filter_by(
        user_id=user_id,
        leave_type_id=leave_type_id,
        year=current_year
    ).first()

    if not ledger:
        return jsonify({"message": "Leave ledger not found"}), 404

    if new_quota < ledger.used_days:
        return jsonify({
            "message": "New quota cannot be less than already used days"
        }), 400

    ledger.total_quota = new_quota
    db.session.commit()

    return jsonify({
        "message": "Quota updated successfully",
        "total_quota": ledger.total_quota,
        "remaining_days": ledger.remaining_days
    }), 200


@leave_bp.route("/adjust-quota", methods=["POST"])
@jwt_required()
@role_required("HR")
def adjust_quota():
    data = request.get_json()
    
    required_fields = ['user_id', 'leave_type_id', 'adjustment']
    if not all(field in data for field in required_fields):
        return jsonify({"message": "Missing required fields"}), 400

    try:
        user_id = UUID(data.get("user_id"))
        leave_type_id = UUID(data.get("leave_type_id"))
        adjustment = int(data.get("adjustment"))
    except (ValueError, TypeError):
        return jsonify({"message": "Invalid user_id, leave_type_id, or adjustment"}), 400

    current_year = datetime.utcnow().year

    ledger = LeaveLedger.query.filter_by(
        user_id=user_id,
        leave_type_id=leave_type_id,
        year=current_year
    ).first()

    if not ledger:
        return jsonify({"message": "Leave ledger not found"}), 404

    new_quota = ledger.total_quota + adjustment

    if new_quota < ledger.used_days:
        return jsonify({
            "message": f"Cannot adjust quota. New quota ({new_quota}) would be less than already used days ({ledger.used_days})"
        }), 400

    if new_quota < 0:
        return jsonify({"message": "Quota cannot be negative"}), 400

    ledger.total_quota = new_quota
    db.session.commit()

    return jsonify({
        "message": f"Quota adjusted successfully by {adjustment:+d} days",
        "total_quota": ledger.total_quota,
        "remaining_days": ledger.remaining_days
    }), 200



@leave_bp.route("/<uuid:leave_id>/approve", methods=["POST"])
@jwt_required()
@role_required("HR")
def approve_leave(leave_id):
    try:
        leave = LeaveService.approve_leave(leave_id)
        return jsonify({
            "message": "Leave approved",
            "leave_id": str(leave.id),
            "status": leave.status
        }), 200
    
    except ValueError as e:
        return jsonify({"error": str(e)}), 400


@leave_bp.route("/<uuid:leave_id>/reject", methods=["POST"])
@jwt_required()
@role_required("HR")
def reject_leave(leave_id):
    data = request.get_json() or {}
    rejection_reason = data.get("rejection_reason")
    
    leave = LeaveService.reject_leave(leave_id, rejection_reason)

    return jsonify({
        "message": "Leave rejected",
        "leave_id": str(leave.id),
        "status": leave.status
    }), 200


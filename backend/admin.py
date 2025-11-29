from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from backend.db import SessionLocal
from backend.models import User

admin_bp = Blueprint("admin", __name__)

def is_admin(user_id):
    """Check if user is admin"""
    db = SessionLocal()
    try:
        user = db.get(User, int(user_id))
        return user and user.role == "admin"
    finally:
        db.close()

@admin_bp.get("/users")
@jwt_required()
def list_users():
    """List all users (admin only)"""
    user_id = get_jwt_identity()
    if not is_admin(user_id):
        return jsonify({"error": "Admin access required"}), 403
    
    db = SessionLocal()
    try:
        users = db.query(User).all()
        return jsonify({
            "users": [
                {
                    "id": u.id,
                    "email": u.email,
                    "role": u.role
                }
                for u in users
            ]
        }), 200
    finally:
        db.close()

@admin_bp.put("/users/<int:user_id>/role")
@jwt_required()
def change_user_role(user_id):
    """Change user role (admin only)"""
    admin_id = get_jwt_identity()
    if not is_admin(admin_id):
        return jsonify({"error": "Admin access required"}), 403
    
    data = request.get_json(force=True) or {}
    new_role = data.get("role", "").strip().lower()
    
    if new_role not in ["member", "admin"]:
        return jsonify({"error": "Invalid role. Must be 'member' or 'admin'"}), 400
    
    db = SessionLocal()
    try:
        user = db.get(User, user_id)
        if not user:
            return jsonify({"error": "User not found"}), 404
        
        user.role = new_role
        db.commit()
        return jsonify({
            "user": {
                "id": user.id,
                "email": user.email,
                "role": user.role
            }
        }), 200
    except Exception as e:
        db.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        db.close()

@admin_bp.delete("/users/<int:user_id>")
@jwt_required()
def delete_user(user_id):
    """Delete user (admin only)"""
    admin_id = get_jwt_identity()
    if not is_admin(admin_id):
        return jsonify({"error": "Admin access required"}), 403
    
    # Prevent admin from deleting themselves
    if int(admin_id) == user_id:
        return jsonify({"error": "Cannot delete your own account"}), 400
    
    db = SessionLocal()
    try:
        user = db.get(User, user_id)
        if not user:
            return jsonify({"error": "User not found"}), 404
        
        db.delete(user)
        db.commit()
        return jsonify({"message": "User deleted successfully"}), 200
    except Exception as e:
        db.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        db.close()

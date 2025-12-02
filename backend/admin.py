from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt
from functools import wraps
from backend.db import SessionLocal
from backend.models import User, Profile, Item
from backend.rules import score_item

admin_bp = Blueprint("admin", __name__)

def admin_required(fn):
    """Decorator to require admin role"""
    @wraps(fn)
    @jwt_required()
    def wrapper(*args, **kwargs):
        claims = get_jwt()
        if claims.get('role') != 'admin':
            return jsonify({"error": "Admin access required"}), 403
        return fn(*args, **kwargs)
    return wrapper

@admin_bp.get("/users")
@admin_required
def list_users():
    """List all users in the database"""
    db = SessionLocal()
    try:
        users = db.query(User).all()
        return jsonify({
            "users": [
                {
                    "id": u.id,
                    "email": u.email,
                    "role": u.role,
                    "profile": {
                        "location": u.profile.location_text if u.profile else None,
                        "units": u.profile.units if u.profile else "F"
                    }
                }
                for u in users
            ]
        }), 200
    finally:
        db.close()

@admin_bp.patch("/users/<int:user_id>/role")
@admin_required
def update_user_role(user_id):
    """Update a user's role"""
    data = request.get_json(force=True) or {}
    new_role = data.get("role")
    
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
            "message": f"User {user.email} role updated to {new_role}",
            "user": {
                "id": user.id,
                "email": user.email,
                "role": user.role
            }
        }), 200
    finally:
        db.close()

@admin_bp.delete("/users/<int:user_id>")
@admin_required
def delete_user(user_id):
    """Delete a user account"""
    db = SessionLocal()
    try:
        user = db.get(User, user_id)
        if not user:
            return jsonify({"error": "User not found"}), 404
        
        email = user.email
        # Delete profile first (if it exists)
        if user.profile:
            db.delete(user.profile)
        # Then delete user
        db.delete(user)
        db.commit()
        
        return jsonify({
            "message": f"User {email} deleted successfully"
        }), 200
    finally:
        db.close()

@admin_bp.post("/debug/test-outfit-scoring")
@admin_required
def debug_outfit_scoring():
    data = request.get_json(force=True) or {}
    temp_f = data.get("temp_f")
    occasion = data.get("occasion", "casual_outing")
    condition = data.get("condition")
    
    if temp_f is None:
        return jsonify({"error": "temp_f required"}), 400
    
    try:
        temp_f = float(temp_f)
    except (TypeError, ValueError):
        return jsonify({"error": "temp_f must be a number"}), 400
    
    db = SessionLocal()
    try:
        items = db.query(Item).all()
        scored = []
        
        for item in items:
            score = score_item(item, temp_f, occasion, condition)
            scored.append({
                "id": item.id,
                "name": item.name,
                "category": item.category,
                "score": score,
                "warmth_score": item.warmth_score,
                "formality": item.formality,
                "activity_comfort": item.activity_comfort,
            })
        
        scored.sort(key=lambda x: x["score"], reverse=True)
        
        return jsonify({
            "test_params": {
                "temp_f": temp_f,
                "occasion": occasion,
                "condition": condition,
            },
            "all_items_scored": scored,
            "top_picks": scored[:4], 
        }), 200
    finally:
        db.close()


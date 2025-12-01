from flask import Blueprint, request, jsonify
from passlib.hash import bcrypt
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from backend.db import SessionLocal
from backend.models import User, Profile

auth_bp = Blueprint("auth", __name__)

def _db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@auth_bp.post("/register")
def register():
    data = request.get_json(force=True) or {}
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""
    location = (data.get("location") or "").strip()
    units = (data.get("units") or "F").strip().upper()

    if not email or not password:
        return jsonify({"error": "email and password required"}), 400

    db = next(_db())
    if db.query(User).filter_by(email=email).first():
        return jsonify({"error": "email already registered"}), 409

    user = User(
        email=email,
        password_hash=bcrypt.hash(password),
        role="member",
    )
    db.add(user)
    db.flush()  # get user.id

    profile = Profile(user_id=user.id, location_text=location, units=units)
    db.add(profile)
    db.commit()

    token = create_access_token(
    identity=str(user.id),  
    additional_claims={"email": user.email, "role": user.role}
)
    return jsonify({"access_token": token, "user": {"id": user.id, "email": user.email}}), 201

@auth_bp.post("/login")
def login():
    data = request.get_json(force=True) or {}
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""

    if not email or not password:
        return jsonify({"error": "email and password required"}), 400

    db = SessionLocal()
    try:
        user = db.query(User).filter_by(email=email).first()
        if not user or not bcrypt.verify(password, user.password_hash):
            return jsonify({"error": "invalid credentials"}), 401

        token = create_access_token(
            identity=str(user.id),  # <-- must be a string
            additional_claims={"email": user.email, "role": user.role}
        )
        return jsonify({"access_token": token, "user": {"id": user.id, "email": user.email}})
    finally:
        db.close()

@auth_bp.get("/me")
@jwt_required()
def me():
    user_id = get_jwt_identity()     # string (we set identity=str(user.id))
    db = SessionLocal()
    try:
        user = db.get(User, int(user_id))   # SQLAlchemy 2.x style
        if not user:
            return jsonify({"error": "user not found"}), 404
        profile = db.query(Profile).filter_by(user_id=user.id).first()
        return jsonify({
            "user": {
                "id": user.id,
                "email": user.email,
                "role": user.role,
                "location": profile.location_text if profile else None,
                "units": profile.units if profile else "F"
            }
        })
    finally:
        db.close()

@auth_bp.patch("/me")
@jwt_required()
def update_profile():
    user_id = get_jwt_identity()
    data = request.get_json(force=True) or {}
    location = data.get("location")
    units = data.get("units")
    
    db = SessionLocal()
    try:
        profile = db.query(Profile).filter_by(user_id=int(user_id)).first()
        if not profile:
            return jsonify({"error": "profile not found"}), 404
        
        if location is not None:
            profile.location_text = location.strip() if isinstance(location, str) else ""
        if units is not None:
            profile.units = units.strip().upper() if isinstance(units, str) else "F"
        
        db.commit()
        user = db.get(User, int(user_id))
        return jsonify({
            "user": {
                "id": user.id,
                "email": user.email,
                "role": user.role,
                "location": profile.location_text,
                "units": profile.units
            }
        }), 200
    finally:
        db.close()
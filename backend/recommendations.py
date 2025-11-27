from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity

from backend.db import SessionLocal
from backend.models import Item, Recommendation
from backend.rules import pick_outfit

rec_bp = Blueprint("recommendations", __name__)

@rec_bp.post("/recommendations")
@jwt_required(optional=True)  # allow anonymous for now; you can require auth later
def get_recommendations():
    data = request.get_json(force=True) or {}

    occasion = (data.get("occasion") or "casual_outing").strip()
    temp_f = data.get("temp_f")
    weather_snapshot = data.get("weather_snapshot")  # optional JSON blob

    if temp_f is None:
        return jsonify({"error": "temp_f is required for now"}), 400

    temp_f = float(temp_f)

    db = SessionLocal()
    try:
        items = db.query(Item).all()
        outfit_items = pick_outfit(items, temp_f=temp_f, occasion=occasion, limit=4)

        # Try to associate with a user if logged in
        user_id = get_jwt_identity()  # will be a string or None (because optional=True)
        rec_row = None
        if user_id is not None:
            rec_row = Recommendation(
                user_id=int(user_id),
                occasion=occasion,
                weather_snapshot=weather_snapshot or {"temp_f": temp_f},
                outfit=[{"id": i.id, "name": i.name} for i in outfit_items],
            )
            db.add(rec_row)
            db.commit()

        return jsonify({
            "occasion": occasion,
            "temp_f": temp_f,
            "items": [
                {
                    "id": i.id,
                    "name": i.name,
                    "category": i.category,
                    "formality": i.formality,
                    "warmth_score": i.warmth_score,
                    "activity_comfort": i.activity_comfort,
                }
                for i in outfit_items
            ],
            "saved_recommendation_id": rec_row.id if rec_row else None
        })
    finally:
        db.close()
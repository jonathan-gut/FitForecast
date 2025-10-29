import os
from datetime import timedelta
from flask import Flask, jsonify
from dotenv import load_dotenv
from flask_jwt_extended import JWTManager

from backend.db import engine, Base, SessionLocal
from backend.models import Item
from backend.auth import auth_bp

load_dotenv()
app = Flask(__name__)

# JWT config
app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY", "dev-secret-change-me")
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(days=7)
jwt = JWTManager(app)  # <-- initialize once here

# blueprints
app.register_blueprint(auth_bp, url_prefix="/api/auth")

@app.route("/health")
def health():
    return jsonify({"status": "Flask app working"})

@app.get("/api/items")
def list_items():
    db = SessionLocal()
    try:
        rows = db.query(Item).limit(10).all()
        return jsonify([{"id": r.id, "name": r.name, "formality": r.formality} for r in rows])
    finally:
        db.close()

# one-time table creation for local dev
with engine.begin() as conn:
    Base.metadata.create_all(bind=conn)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.environ.get("PORT", 5050)))
import os
from flask import Flask, jsonify
from dotenv import load_dotenv

from backend.db import engine, Base, SessionLocal   # <-- add SessionLocal
from backend.models import Item                     # <-- ensure this import too

load_dotenv()
app = Flask(__name__)

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
import os
from datetime import timedelta

import requests
from flask import Flask, jsonify, request
from dotenv import load_dotenv
from flask_jwt_extended import JWTManager
from flask_cors import CORS

from backend.db import engine, Base, SessionLocal
from backend.models import Item
from backend.auth import auth_bp

load_dotenv()
app = Flask(__name__)
CORS(app)

OPEN_METEO_BASE = "https://api.open-meteo.com/v1/forecast"
OPEN_METEO_GEOCODE = "https://geocoding-api.open-meteo.com/v1/search"

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

def request_from_api(lat, lon, hourly, units, timezone):
    params = {"latitude": lat, "longitude": lon, "hourly": hourly, "timezone": timezone}
    if units == "fahrenheit":
        params["temperature_unit"] = "fahrenheit"
    r = requests.get(OPEN_METEO_BASE, params=params, timeout=8)
    r.raise_for_status()
    return r.json()

def geocode(city, country=None, state=None, count=5):
    params = {"name": city, "count": count, "format": "json", "language": "en"}
    if country: params["country"] = country
    if state: params["admin1"] = state
    r = requests.get(OPEN_METEO_GEOCODE, params=params, timeout=8)
    r.raise_for_status()
    data = r.json() or {}
    results = data.get("results") or []
    return results[0] if results else None

@app.get("/weather/city/<path:city>")
def get_weather(city):
    country = request.args.get("country")
    state = request.args.get("state")
    count = int(request.args.get("count", "5"))
    hourly = request.args.get("hourly", "temperature_2m")
    units = request.args.get("units")
    timezone = request.args.get("timezone", "auto")
    try:
        best = geocode(city, country=country, state=state, count=count)
        if not best:
            return jsonify({"error": "City not found", "query": {"city": city, "country": country, "state": state}}), 404
        lat, lon = best["latitude"], best["longitude"]
        resolved = {
            "name": best.get("name"),
            "latitude": lat,
            "longitude": lon,
            "country": best.get("country"),
            "admin1": best.get("admin1"),
            "timezone": best.get("timezone"),
        }
        data = request_from_api(lat, lon, hourly, units, timezone)
        data["_resolved_location"] = resolved
        return jsonify(data), 200
    except requests.exceptions.HTTPError as e:
        status = getattr(e.response, "status_code", 502)
        return jsonify({"error": "Upstream error", "details": str(e)}), status
    except requests.exceptions.RequestException as e:
        return jsonify({"error": "Network error", "details": str(e)}), 502

# one-time table creation for local dev
with engine.begin() as conn:
    Base.metadata.create_all(bind=conn)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.environ.get("PORT", 5050)))
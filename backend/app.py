import os
from datetime import timedelta

import requests
from flask import Flask, jsonify, request
from dotenv import load_dotenv
from flask_jwt_extended import JWTManager, jwt_required, get_jwt_identity
from flask_cors import CORS

from backend.db import engine, Base, SessionLocal
from backend.models import Item, User, Profile
from backend.auth import auth_bp
from backend.admin import admin_bp

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
app.register_blueprint(admin_bp, url_prefix="/api/admin")

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

def get_current_temp(lat, lon, units, timezone):
    """Get current temperature and daily high/low using the forecast endpoint"""
    params = {
        "latitude": lat,
        "longitude": lon,
        "current": "temperature_2m",
        "daily": "temperature_2m_max,temperature_2m_min",
        "timezone": timezone
    }
    if units == "fahrenheit":
        params["temperature_unit"] = "fahrenheit"
    try:
        # Use the forecast endpoint with current and daily parameters
        r = requests.get(OPEN_METEO_BASE, params=params, timeout=8)
        r.raise_for_status()
        data = r.json()
        print(f"DEBUG: Current weather response: {data}")
        current_data = data.get("current", {})
        daily_data = data.get("daily", {})
        temp = current_data.get("temperature_2m")
        # Get the actual unit returned by the API
        temp_unit = data.get("current_units", {}).get("temperature_2m", "°C")
        # Get today's high and low (first element of daily arrays)
        high = daily_data.get("temperature_2m_max", [None])[0]
        low = daily_data.get("temperature_2m_min", [None])[0]
        return temp, temp_unit, high, low
    except Exception as e:
        print(f"DEBUG: Error fetching current temp: {e}")
        raise

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

@app.get("/api/weather/saved")
@jwt_required()
def get_saved_weather():
    """Fetch weather for the user's saved location"""
    user_id = get_jwt_identity()
    db = SessionLocal()
    try:
        profile = db.query(Profile).filter_by(user_id=int(user_id)).first()
        if not profile or not profile.location_text or profile.location_text.strip() == "":
            return jsonify({"error": "No saved location found", "code": "NO_LOCATION"}), 404
        
        location = profile.location_text.strip()
        timezone = request.args.get("timezone", "auto")
        units = profile.units.lower() if profile.units else "fahrenheit"
        
        try:
            best = geocode(location)
            if not best:
                return jsonify({"error": "Could not geocode saved location", "location": location}), 404
            
            lat, lon = best["latitude"], best["longitude"]
            resolved = {
                "name": best.get("name"),
                "latitude": lat,
                "longitude": lon,
                "country": best.get("country"),
                "admin1": best.get("admin1"),
                "timezone": best.get("timezone"),
            }
            # Get current temperature
            current_temp, temp_unit, high, low = get_current_temp(lat, lon, units, timezone)
            data = {
                "current_temperature": current_temp,
                "temperature_high": high,
                "temperature_low": low,
                "temperature_unit": temp_unit,
                "_resolved_location": resolved,
                "timezone": best.get("timezone")
            }
            return jsonify(data), 200
        except requests.exceptions.HTTPError as e:
            print(f"DEBUG: HTTP Error: {e}")
            status = getattr(e.response, "status_code", 502)
            return jsonify({"error": "Upstream error", "details": str(e)}), status
        except requests.exceptions.RequestException as e:
            print(f"DEBUG: Request Error: {e}")
            return jsonify({"error": "Network error", "details": str(e)}), 502
        except Exception as e:
            print(f"DEBUG: Unexpected error: {e}")
            return jsonify({"error": "Unexpected error", "details": str(e)}), 500
    finally:
        db.close()

# one-time table creation for local dev
with engine.begin() as conn:
    Base.metadata.create_all(bind=conn)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.environ.get("PORT", 5050)))
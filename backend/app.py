import os
from flask import Flask, jsonify
from dotenv import load_dotenv
from .db import engine, Base  # noqa
from . import models  # noqa

load_dotenv()
app = Flask(__name__)

@app.route("/health")
def health():
    return jsonify({"status": "Flask app working"})

# one-time: create tables for local dev (later replace with Alembic)
with engine.begin() as conn:
    Base.metadata.create_all(bind=conn)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.environ.get("PORT", 5050)))
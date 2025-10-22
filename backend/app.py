import os
from flask import Flask, jsonify

app = Flask(__name__)

@app.route("/health")
def health():
    return jsonify({"status": "Flask app working"})


# one-off: create tables if not using Alembic yet
with engine.begin() as conn:
    Base.metadata.create_all(bind=conn)



if __name__ == "__main__":
    # default to 5050 if PORT isn't set
    app.run(host="0.0.0.0", port=int(os.environ.get("PORT", 5050)))
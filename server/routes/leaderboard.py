from flask import Blueprint, request, jsonify
import redis
import pickle

leaderboard_bp = Blueprint("leaderboard", __name__)

# Use the same Redis config as game_manager
r = redis.Redis(host="localhost", port=6379, db=0)
LEADERBOARD_KEY = "leaderboard"


@leaderboard_bp.route("/leaderboard", methods=["GET"])
def get_leaderboard():
    data = r.get(LEADERBOARD_KEY)
    if data:
        leaderboard = pickle.loads(data)
    else:
        leaderboard = []
    # Sort by score (smaller is better)
    leaderboard = sorted(leaderboard, key=lambda x: x["score"])
    return jsonify(leaderboard)


@leaderboard_bp.route("/leaderboard", methods=["POST"])
def add_leaderboard_entry():
    entry = request.json
    # Validate required fields
    for field in ["playerName", "timeSeconds", "moves", "optimalDistance"]:
        if field not in entry:
            return jsonify({"error": f"Missing field: {field}"}), 400
    # Compute score
    try:
        score = float(entry["timeSeconds"]) * (
            float(entry["moves"]) / float(entry["optimalDistance"])
        )
    except Exception:
        return jsonify({"error": "Invalid numeric values"}), 400
    entry["score"] = score
    # Load, append, and save
    data = r.get(LEADERBOARD_KEY)
    if data:
        leaderboard = pickle.loads(data)
    else:
        leaderboard = []
    leaderboard.append(entry)
    r.set(LEADERBOARD_KEY, pickle.dumps(leaderboard))
    return jsonify({"success": True})

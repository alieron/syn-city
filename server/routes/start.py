import uuid
import random
from flask import Blueprint, jsonify, request

game_bp = Blueprint("game", __name__)

# In-memory game store (replace later)
GAMES: dict[str, dict] = {}

@game_bp.route("/start", methods=["POST"])
def start_game():
   

    game_id = str(uuid.uuid4())

    GAMES[game_id] = {
        "start": start,
        "target": target
    }

    return jsonify({
        "gameId": game_id,
        "startWord": start,
        "targetWord": target,
        "optimalDistance": dist
    })


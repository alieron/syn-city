import uuid
from flask import Blueprint, jsonify, request

from services.game import Game
from services.game_manager import GameManager

start_bp = Blueprint("start", __name__)


@start_bp.route("/start", methods=["POST"])
def start_game():
    game_id = str(uuid.uuid4())

    difficulty = request.headers.get("X-Difficulty")
    if difficulty is None:
        difficulty = 4  # Default difficulty
    else:
        difficulty = int(difficulty)

    game = Game(
        walk_steps=5 * difficulty,
        min_path_length=difficulty,
        max_attempts=5 * difficulty,
    )
    # game.play(None, steps=10, min_path_length=4)

    GameManager.save_game(game_id, game)

    return jsonify(
        {
            "gameId": game_id,
            "startWord": game.start.word,
            "targetWord": game.end.word,
            "optimalDistance": game.shortest_path(game.start),
        }
    )

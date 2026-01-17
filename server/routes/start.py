import uuid
from flask import Blueprint, jsonify, request

from services.game import Game
from services.game_manager import GameManager

start_bp = Blueprint("start", __name__)


@start_bp.route("/start", methods=["POST"])
def start_game():
    game_id = str(uuid.uuid4())

    difficulty = request.headers.get("X-Difficulty")
    game = Game(min_path_length=int(difficulty) if difficulty is not None else 4)
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

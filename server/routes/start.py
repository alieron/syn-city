import uuid
from flask import Blueprint, jsonify

from services.game import Game
from server.main import GAMES

start_bp = Blueprint("start", __name__)


@start_bp.route("/start", methods=["POST"])
def start_game():
    game_id = str(uuid.uuid4())

    game = Game()
    # game.play(None, steps=10, min_path_length=4)

    GAMES[game_id] = game

    return jsonify(
        {
            "gameId": game_id,
            "startWord": game.start.word,
            "targetWord": game.end.word,
            "optimalDistance": game.shortest_path(game.start),
        }
    )

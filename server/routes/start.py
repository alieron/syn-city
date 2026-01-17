import uuid
import random
from flask import Blueprint, jsonify, request

from services.game import Game

start_bp = Blueprint("start", __name__)

@start_bp.route("/start", methods=["POST"])
def start_game():
    game_id = str(uuid.uuid4())

    game = Game()
    game.play(None, steps=10, min_path_length=4)

    GAMES[game_id] = game

    return jsonify({
        "gameId": game_id,
        "startWord": game.start,
        "targetWord": game.end,
        "optimalDistance": game.shortest_path(game.start, game.end)
    })


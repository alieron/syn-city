import uuid
from flask import Blueprint, jsonify

from services.game import Game
from services.game_manager import GameManager

start_bp = Blueprint("start", __name__)


@start_bp.route("/start", methods=["POST"])
def start_game():
    game_id = str(uuid.uuid4())

    game = Game()
    # game.play(None, steps=10, min_path_length=4)

    GameManager.save_game(game_id, game)

    # Return both the puzzle path (random walk) and the true shortest path (solution)
    puzzle_path_words = [node.word for node in getattr(game, "puzzle_path", [])]
    solution_path_words = [node.word for node in getattr(game, "solution_path", [])]
    return jsonify(
        {
            "gameId": game_id,
            "startWord": game.start.word,
            "targetWord": game.end.word,
            "optimalDistance": game.shortest_path(game.start),
            "puzzlePath": puzzle_path_words,
            "shortestPath": solution_path_words,
        }
    )

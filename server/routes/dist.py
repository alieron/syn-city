from flask import Blueprint, jsonify, request

from services.game import Game
from server.main import GAMES

dist_bp = Blueprint("dist", __name__)


@dist_bp.route("/dist", methods=["GET"])
def distance():
    game_id = request.headers.get("X-Game-Id")
    current_word = request.headers.get("X-Current-Word")

    if not game_id or not current_word:
        return jsonify({"error": "X-Game-Id and X-Current-Word headers required"}), 400

    game = GAMES.get(game_id)
    if not game:
        return jsonify({"error": "invalid game id"}), 404

    target = game.end
    dist = game.shortest_path(game.graph.nodes[current_word])

    return jsonify(
        {
            "currentWord": current_word,
            "targetWord": target,
            "distance": dist,
            "reachable": dist is not None,
        }
    )

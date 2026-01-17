import json
import uuid
import random
from flask import Blueprint, jsonify, request

from services.game import Game

dist_bp = Blueprint("dist", __name__)


@dist_bp.route("/next", methods=["GET"])
def curr():
    game_id = request.headers.get("X-Game-Id")
    current_word = request.headers.get("X-Current-Word")

    if not game_id or not current_word:
        return jsonify({"error": "X-Game-Id and X-Current-Word headers required"}), 400

    game = GAMES.get(game_id)
    if not game:
        return jsonify({"error": "invalid game id"}), 404

    node = game.graph.nodes.get(current_word)
    if not node:
        return jsonify({"error": "invalid current word"}), 404

    return jsonify(
        {
            "currentWord": current_word,
            "synonyms": [n.word for n in node.synonyms],
            "antonyms": [n.word for n in node.antonyms],
            "related": [n.word for n in node.related],
        }
    )

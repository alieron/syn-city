from flask import Blueprint, jsonify, request

from services.game_manager import GameManager

next_bp = Blueprint("next", __name__)


@next_bp.route("/next", methods=["GET"])
def curr():
    game_id = request.headers.get("X-Game-Id")
    current_word = request.headers.get("X-Current-Word")

    if not game_id or not current_word:
        return jsonify({"error": "X-Game-Id and X-Current-Word headers required"}), 400

    game = GameManager.load_game(game_id)
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

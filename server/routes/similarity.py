from flask import Blueprint, request, jsonify

from sentence_transformers import SentenceTransformer
import numpy as np

from services.game_manager import GameManager

similarity_bp = Blueprint("similarity", __name__)

# Load the model once at import time
model = SentenceTransformer("all-MiniLM-L6-v2")


@similarity_bp.route("/similarity", methods=["GET"])
def similarity():
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

    # Get embeddings
    embeddings = model.encode([node.word, game.end.word])
    sim = np.dot(embeddings[0], embeddings[1]) / (
        np.linalg.norm(embeddings[0]) * np.linalg.norm(embeddings[1])
    )

    return jsonify(
        {"currentWord": node.word, "targetWord": game.end.word, "similarity": sim}
    )

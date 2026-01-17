from flask import Flask
from flask_cors import CORS

from services.game import Game

def create_app():
    app = Flask(__name__)
    CORS(app)

    from routes.health import health_bp
    from routes.synonyms import synonyms_bp

    app.register_blueprint(health_bp)
    app.register_blueprint(synonyms_bp, url_prefix="/api")

    return app

app = create_app()

# In-memory game store
GAMES: dict[str, Game] = {}

if __name__ == "__main__":
    app.run(debug=True, port=3001)

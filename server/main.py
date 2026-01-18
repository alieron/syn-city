from flask import Flask
from flask_cors import CORS


def create_app():
    app = Flask(__name__)
    CORS(app)

    from routes.health import health_bp
    from routes.start import start_bp
    from routes.dist import dist_bp
    from routes.next import next_bp
    from routes.similarity import similarity_bp
    from routes.leaderboard import leaderboard_bp

    app.register_blueprint(health_bp)
    app.register_blueprint(start_bp, url_prefix="/api")
    app.register_blueprint(dist_bp, url_prefix="/api")
    app.register_blueprint(next_bp, url_prefix="/api")
    app.register_blueprint(similarity_bp, url_prefix="/api")
    app.register_blueprint(leaderboard_bp, url_prefix="/api")

    return app


app = create_app()


if __name__ == "__main__":
    app.run(debug=True, port=3001)

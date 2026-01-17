import redis
import pickle

# Configure Redis connection (adjust host/port as needed)
r = redis.Redis(host="localhost", port=6379, db=0)


class GameManager:
    @staticmethod
    def save_game(game_id, game, ttl=3600):
        r.setex(game_id, ttl, pickle.dumps(game))

    @staticmethod
    def load_game(game_id):
        data = r.get(game_id)
        return pickle.loads(data) if data else None

    @staticmethod
    def delete_game(game_id):
        r.delete(game_id)

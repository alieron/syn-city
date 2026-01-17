import json
import random
from collections import deque

INPUT_FILE = "filtered_words.json"

from sentence_transformers import SentenceTransformer
import numpy as np

model = SentenceTransformer("all-MiniLM-L6-v2")


class Node:
    def __init__(self, word: str):
        self.word = word
        self.synonyms: set[Node] = set()
        self.antonyms: set[Node] = set()
        self.related: set[Node] = set()

    def to_dict(self):
        return {
            "word": self.word,
            "synonyms": list(self.synonyms),
            "antonyms": list(self.antonyms),
            "related": list(self.related),
        }


class Graph:
    def __init__(self):
        self.nodes = {}
        compressed_graph = json.load(open(INPUT_FILE, "r", encoding="utf-8"))
        for word, relations in compressed_graph.items():
            for relation, targets in relations.items():
                for target in targets:
                    self.add_edge(word, relation, target)

    def add_edge(self, word: str, relation: str, target: str):
        if word not in self.nodes:
            self.nodes[word] = Node(word)
        if target not in self.nodes:
            self.nodes[target] = Node(target)

        if relation == "synonyms":
            self.nodes[word].synonyms.add(self.nodes[target])
            # self.nodes[target].synonyms.add(self.nodes[word])
        elif relation == "antonyms":
            self.nodes[word].antonyms.add(self.nodes[target])
            # self.nodes[target].antonyms.add(self.nodes[word])
        elif relation == "related":
            self.nodes[word].related.add(self.nodes[target])
            # self.nodes[target].related.add(self.nodes[word])

    def to_dict(self):
        return {word: node.to_dict() for word, node in self.nodes.items()}


class Game:
    def __init__(self, walk_steps=10, min_path_length=4, max_attempts=100):
        self.graph = Graph()

        random_word = random.choice(list(self.graph.nodes.keys()))
        self.start = self.graph.nodes[random_word]
        self.end, self.path = self.random_walk(self.start, walk_steps)
        curr_max_length = len(self.path)
        attempts = 0
        while len(self.path) < min_path_length and attempts < max_attempts:
            random_word = random.choice(list(self.graph.nodes.keys()))
            start = self.graph.nodes[random_word]
            end, path = self.random_walk(start, walk_steps)
            if len(path) > curr_max_length:
                curr_max_length = len(path)
                self.start = start
                self.end = end
                self.path = path
            attempts += 1

        self.visited: set[Node] = set()
        self.shortest_path_cache: dict[tuple[Node, Node], int] = {}
        self.queue = deque([(self.end, 0, [self.end])])  # curr, dist, path
        self.shortest_path(self.start)

    def random_walk(self, start: Node, steps: int) -> tuple[Node, list[Node]]:
        path = [start]
        visited = set([start])
        curr = start
        for _ in range(steps):
            neighbors = [
                n
                for n in (curr.synonyms | curr.antonyms | curr.related)
                if n not in visited
            ]
            if not neighbors:
                # Backtrack if possible
                if len(path) > 1:
                    path.pop()
                    curr = path[-1]
                    continue
                else:
                    break
            next_node = random.choice(neighbors)
            path.append(next_node)
            visited.add(next_node)
            curr = next_node
        return curr, path

    def shortest_path(self, end: Node) -> int:
        if (self.end, end) in self.shortest_path_cache:
            return self.shortest_path_cache[(self.end, end)]

        while self.queue:
            curr, dist, path = self.queue.popleft()
            self.shortest_path_cache[(self.end, curr)] = dist
            for neighbor in curr.synonyms | curr.antonyms | curr.related:
                if neighbor not in self.visited:
                    self.visited.add(neighbor)
                    self.queue.append((neighbor, dist + 1, path + [neighbor]))
            if curr == end:
                if end == self.start:  # only for intial call
                    self.path = path
                return dist

        return -1

    def similarity(self, node: Node) -> float:
        embeddings = model.encode([node.word, self.end.word])
        sim = np.dot(embeddings[0], embeddings[1]) / (
            np.linalg.norm(embeddings[0]) * np.linalg.norm(embeddings[1])
        )
        return sim

    def _play(self):
        #     if start_word in self.graph.nodes:
        #         start = self.graph.nodes[start_word]
        #     else:
        #         random_word = random.choice(list(self.graph.nodes.keys()))
        #         start = self.graph.nodes[random_word]

        #     end, path = self.random_walk(start, steps)
        #     while len(path) < min_path_length:
        #         random_word = random.choice(list(self.graph.nodes.keys()))
        #         start = self.graph.nodes[random_word]
        #         end, path = self.random_walk(start, steps)

        #     self.start = start
        #     self.end = end
        #     self.path = path

        print(f"Start word: {self.start.word}, End word: {self.end.word}")
        print("Possible Path:", " -> ".join([node.word for node in self.path]))

        curr = self.start
        num_actions = 0
        path_taken = [curr]
        while curr != self.end:
            print(f"Current word: {curr.word}")
            options = list(curr.synonyms | curr.antonyms | curr.related)
            print("Options:", ", ".join([node.word for node in options]))

            choice = input("Choose your next word: ").strip()
            if choice == "/quit":
                print("Game over. Thanks for playing!")
                return
            elif choice == "/back" and len(path_taken) > 1:
                path_taken.pop()
                curr = path_taken[-1]
                num_actions += 1
            elif choice in self.graph.nodes:
                curr = self.graph.nodes[choice]
                num_actions += 1
                path_taken.append(curr)
            else:
                print("Invalid choice, try again.")

            print(f"Closest distance to target: {self.shortest_path(curr)} steps")
            print(f"Similarity to target: {self.similarity(curr):.4f}")

        print(
            f"Congratulations! You reached the end word '{self.end.word}' in {num_actions} actions."
        )


if __name__ == "__main__":
    # start_word = (
    #     input("Enter a starting word (or leave blank for random): ").strip().lower()
    # )
    # start_word = "hack"
    Game()._play()

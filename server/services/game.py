import json
import random

INPUT_FILE = "filtered words.json"


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
    def __init__(self):
        self.graph = Graph()
        self.visited: set[str] = set()
        self.shortest_path_cache: dict[tuple[str, str], list[str]] = {}

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

    def shortest_path(self, start: Node, end: Node) -> int:
        return 0

    def play(self, start_word: str, steps: int = 10, min_path_length: int = 4):
        if start_word in self.graph.nodes:
            start = self.graph.nodes[start_word]
        else:
            random_word = random.choice(list(self.graph.nodes.keys()))
            start = self.graph.nodes[random_word]

        end, path = self.random_walk(start, steps)
        while len(path) < min_path_length:
            random_word = random.choice(list(self.graph.nodes.keys()))
            start = self.graph.nodes[random_word]
            end, path = self.random_walk(start, steps)

        self.start = start
        self.end = end
        self.path = path

        print(f"Start word: {start.word}, End word: {end.word}")
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

        print(
            f"Congratulations! You reached the end word '{self.end.word}' in {num_actions} actions."
        )


if __name__ == "__main__":
    start_word = (
        input("Enter a starting word (or leave blank for random): ").strip().lower()
    )
    # start_word = "hack"
    game = Game()
    game.play(start_word, steps=10, min_path_length=4)

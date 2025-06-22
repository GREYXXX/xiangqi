import random
from .base_agent import BaseAgent
from logic.game_state import GameState

class RandomAgent(BaseAgent):
    """
    An agent that makes a random legal move using the core game logic.
    """

    def get_move(self, board_state: dict) -> dict:
        """
        Returns a random valid move by calling the rule engine.
        
        :param board_state: The current state of the board.
        :return: A dictionary representing the chosen move, or an empty dict if no moves are available.
        """
        print(f"RandomAgent ({self.color}) is calculating moves...")

        game = GameState(board_state)
        legal_moves = game.get_all_valid_moves()

        if not legal_moves:
            print("No legal moves available.")
            return {} 

        move = random.choice(legal_moves)
        
        print(f"Chosen move: {move}")
        return move 
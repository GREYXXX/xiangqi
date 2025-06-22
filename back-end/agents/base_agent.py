from abc import ABC, abstractmethod

class BaseAgent(ABC):
    """
    Abstract base class for all Xiangqi agents.
    All future agents (random, search-based, ML-based) should inherit from this class.
    """

    def __init__(self, color: str):
        """
        Initializes the agent.
        :param color: The color the agent is playing ('red' or 'black').
        """
        if color not in ['red', 'black']:
            raise ValueError("Color must be either 'red' or 'black'.")
        self.color = color

    @abstractmethod
    def get_move(self, board_state: dict) -> dict:
        """
        Calculates and returns the best move based on the current board state.

        :param board_state: A dictionary representing the current state of the board.
                            The exact structure will depend on the frontend-backend contract.
                            Example: {'pieces': [...], 'turn': 'red'}
        :return: A dictionary representing the move.
                 Example: {'from': {'x': 1, 'y': 2}, 'to': {'x': 1, 'y': 3}}
        """
        pass

    def __repr__(self) -> str:
        return f"{self.__class__.__name__}(color='{self.color}')" 
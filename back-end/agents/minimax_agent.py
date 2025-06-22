import math
import time
from typing import Callable
from .base_agent import BaseAgent
from logic.game_state import GameState, Move

class MinimaxAgent(BaseAgent):
    """
    An agent that uses iterative deepening minimax search with alpha-beta pruning 
    and a transposition table. The evaluation function is injected.
    """
    def __init__(self, color: str, evaluation_fn: Callable[[GameState, str], float], time_limit_secs: int = 5):
        super().__init__(color)
        self.time_limit = time_limit_secs
        self.evaluation_fn = evaluation_fn
        self.transposition_table = {}

    def get_move(self, board_state: dict) -> Move:
        """
        Calculates the best move using iterative deepening minimax search.
        """
        print(f"MinimaxAgent ({self.color}) is thinking for ~{self.time_limit} seconds...")
        self.transposition_table = {}
        start_time = time.time()
        
        initial_game_state = GameState(board_state)
        best_move_overall: Move = {}
        
        for depth in range(1, 10):
            try:
                if time.time() - start_time > self.time_limit:
                    print("Time limit reached, breaking.")
                    break
                print(f"Searching at depth {depth}...")
                best_move_at_depth, best_value = self._search(initial_game_state, depth, start_time)
                if best_move_at_depth:
                    best_move_overall = best_move_at_depth
                if abs(best_value) > 9000:
                    break
            except TimeoutError:
                print(f"Search at depth {depth} timed out.")
                break
        return best_move_overall

    def _search(self, game_state: GameState, depth: int, start_time: float):
        best_move: Move = {}
        best_value = -math.inf
        alpha = -math.inf
        beta = math.inf
        
        legal_moves = game_state.get_all_valid_moves()

        for move in legal_moves:
            if time.time() - start_time > self.time_limit:
                raise TimeoutError()
            temp_game_state = self._get_next_state(game_state, move)
            board_value = self._minimax(temp_game_state, depth - 1, alpha, beta, False, start_time)
            if board_value > best_value:
                best_value = board_value
                best_move = move
            alpha = max(alpha, best_value)
        return best_move, best_value

    def _minimax(self, game_state: GameState, depth: int, alpha: float, beta: float, is_maximizing: bool, start_time: float) -> float:
        board_hash = self._get_board_hash(game_state)
        if board_hash in self.transposition_table and self.transposition_table[board_hash]['depth'] >= depth:
            return self.transposition_table[board_hash]['score']

        if time.time() - start_time > self.time_limit:
            raise TimeoutError()
        
        legal_moves = game_state.get_all_valid_moves()
        if depth == 0 or not legal_moves:
            return self.evaluation_fn(game_state, self.color)

        if is_maximizing:
            max_eval = -math.inf
            for move in legal_moves:
                child_state = self._get_next_state(game_state, move)
                evaluation = self._minimax(child_state, depth - 1, alpha, beta, False, start_time)
                max_eval = max(max_eval, evaluation)
                alpha = max(alpha, evaluation)
                if beta <= alpha: break
            self.transposition_table[board_hash] = {'score': max_eval, 'depth': depth}
            return max_eval
        else: # Minimizing
            min_eval = math.inf
            for move in legal_moves:
                child_state = self._get_next_state(game_state, move)
                evaluation = self._minimax(child_state, depth - 1, alpha, beta, True, start_time)
                min_eval = min(min_eval, evaluation)
                beta = min(beta, evaluation)
                if beta <= alpha: break
            self.transposition_table[board_hash] = {'score': min_eval, 'depth': depth}
            return min_eval
            
    def _get_board_hash(self, game_state: GameState) -> tuple:
        pieces_tuple = tuple(sorted((r, c, p['type'], p['color']) for r, row in enumerate(game_state.board) for c, p in enumerate(row) if p))
        return (pieces_tuple, game_state.turn)

    def _get_next_state(self, game_state: GameState, move: Move) -> GameState:
        """Applies a move and returns a new GameState object."""
        fr, fc = move['from']['y'], move['from']['x']
        tr, tc = move['to']['y'], move['to']['x']
        
        new_board = [row[:] for row in game_state.board]
        piece_to_move = new_board[fr][fc]
        new_board[tr][tc] = piece_to_move
        new_board[fr][fc] = None

        next_turn = 'black' if game_state.turn == 'red' else 'red'
        
        # This is inefficient, a better way would be to update the pieces list
        pieces_list = []
        for r, row in enumerate(new_board):
            for c, piece in enumerate(row):
                if piece:
                    pieces_list.append({'y': r, 'x': c, 'type': piece['type'], 'color': piece['color']})
        
        return GameState({'pieces': pieces_list, 'turn': next_turn}) 
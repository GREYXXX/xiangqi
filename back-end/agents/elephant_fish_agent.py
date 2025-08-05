import math
import time
from typing import Dict, List, Tuple, Optional, NamedTuple
from collections import defaultdict
from .base_agent import BaseAgent
from logic.game_state import GameState, Move
from logic.evaluation import PST_MAP, PIECE_VALUES

# Use the existing piece values but scale them up for better precision
PIECE_VALUES_ELEPHANT = {
    'P': 44,   # Pawn (scaled up from 10)
    'N': 108,  # Horse (scaled up from 40)
    'E': 23,   # Elephant (scaled up from 20)
    'R': 233,  # Rook (scaled up from 90)
    'A': 23,   # Advisor (scaled up from 20)
    'C': 101,  # Cannon (scaled up from 45)
    'K': 2500  # King (scaled up from 10000)
}

# Constants for search
MATE_LOWER = PIECE_VALUES_ELEPHANT['K'] - (2*PIECE_VALUES_ELEPHANT['R'] + 2*PIECE_VALUES_ELEPHANT['N'] + 2*PIECE_VALUES_ELEPHANT['E'] + 2*PIECE_VALUES_ELEPHANT['A'] + 2*PIECE_VALUES_ELEPHANT['C'] + 5*PIECE_VALUES_ELEPHANT['P'])
MATE_UPPER = PIECE_VALUES_ELEPHANT['K'] + (2*PIECE_VALUES_ELEPHANT['R'] + 2*PIECE_VALUES_ELEPHANT['N'] + 2*PIECE_VALUES_ELEPHANT['E'] + 2*PIECE_VALUES_ELEPHANT['A'] + 2*PIECE_VALUES_ELEPHANT['C'] + 5*PIECE_VALUES_ELEPHANT['P'])
QS_LIMIT = 219
EVAL_ROUGHNESS = 13
TABLE_SIZE = 1000000

class Entry(NamedTuple):
    lower: int
    upper: int

class ElephantFishAgent(BaseAgent):
    """
    An agent based on the Elephant Fish Xiangqi engine.
    Implements MTD-bi search with transposition tables and proper evaluation.
    """
    
    def __init__(self, color: str, time_limit_secs: int = 10):
        super().__init__(color)
        self.time_limit = time_limit_secs
        self.tp_score = {}
        self.tp_move = {}
        self.nodes = 0
        self.history = set()

    def get_move(self, board_state: dict) -> Move:
        """
        Calculates the best move using MTD-bi search with iterative deepening.
        """
        print(f"ElephantFishAgent ({self.color}) is thinking for ~{self.time_limit} seconds...")
        
        # Clear transposition tables
        self.tp_score.clear()
        self.tp_move.clear()
        self.nodes = 0
        
        start_time = time.time()
        game_state = GameState(board_state)
        best_move = {}
        
        # Iterative deepening with higher depth limit
        for depth in range(1, 30):
            if time.time() - start_time > self.time_limit:
                break
                
            try:
                print(f"Searching at depth {depth}...")
                move, score = self._search(game_state, depth, start_time)
                if move:
                    best_move = move
                if abs(score) > 9000:  # Mate found
                    break
            except TimeoutError:
                print(f"Search at depth {depth} timed out.")
                break
                
        return best_move

    def _search(self, game_state: GameState, depth: int, start_time: float) -> Tuple[Move, int]:
        """
        MTD-bi search implementation.
        """
        lower, upper = -MATE_UPPER, MATE_UPPER
        
        while lower < upper - EVAL_ROUGHNESS:
            gamma = (lower + upper + 1) // 2
            score = self._bound(game_state, gamma, depth, start_time)
            
            if score >= gamma:
                lower = score
            if score < gamma:
                upper = score
                
        # Final call to ensure we have a move
        self._bound(game_state, lower, depth, start_time)
        
        best_move = self.tp_move.get(self._get_board_hash(game_state))
        best_score = self.tp_score.get((self._get_board_hash(game_state), depth, True), Entry(-MATE_UPPER, MATE_UPPER)).lower
        
        return best_move, best_score

    def _bound(self, game_state: GameState, gamma: int, depth: int, start_time: float, root: bool = True) -> int:
        """
        Returns r where s(pos) <= r < gamma if gamma > s(pos)
        or gamma <= r <= s(pos) if gamma <= s(pos)
        """
        self.nodes += 1
        
        if time.time() - start_time > self.time_limit:
            raise TimeoutError()
            
        depth = max(depth, 0)
        
        # Check for mate
        if self._evaluate(game_state) <= -MATE_LOWER:
            return -MATE_UPPER
            
        # Check for repetition
        board_hash = self._get_board_hash(game_state)
        if not root and board_hash in self.history:
            return 0
            
        # Look in transposition table
        entry = self.tp_score.get((board_hash, depth, root), Entry(-MATE_UPPER, MATE_UPPER))
        if entry.lower >= gamma and (not root or self.tp_move.get(board_hash) is not None):
            return entry.lower
        if entry.upper < gamma:
            return entry.upper
            
        # Generate moves
        legal_moves = game_state.get_all_valid_moves()
        
        if depth == 0:
            return self._evaluate(game_state)
            
        if not legal_moves:
            return 0
            
        # Search moves
        best = -MATE_UPPER
        killer_move = self.tp_move.get(board_hash)
        
        # Try killer move first
        if killer_move and killer_move in legal_moves:
            if depth > 0 or self._move_value(game_state, killer_move) >= QS_LIMIT:
                child_state = self._get_next_state(game_state, killer_move)
                score = -self._bound(child_state, 1-gamma, depth-1, start_time, False)
                best = max(best, score)
                if best >= gamma:
                    if len(self.tp_move) > TABLE_SIZE:
                        self.tp_move.clear()
                    self.tp_move[board_hash] = killer_move
                    return best
                    
        # Search all moves with improved ordering
        for move in sorted(legal_moves, key=lambda m: self._move_value(game_state, m), reverse=True):
            if depth > 0 or self._move_value(game_state, move) >= QS_LIMIT:
                child_state = self._get_next_state(game_state, move)
                score = -self._bound(child_state, 1-gamma, depth-1, start_time, False)
                best = max(best, score)
                if best >= gamma:
                    if len(self.tp_move) > TABLE_SIZE:
                        self.tp_move.clear()
                    self.tp_move[board_hash] = move
                    break
                    
        # Update transposition table
        if len(self.tp_score) > TABLE_SIZE:
            self.tp_score.clear()
            
        if best >= gamma:
            self.tp_score[(board_hash, depth, root)] = Entry(best, entry.upper)
        if best < gamma:
            self.tp_score[(board_hash, depth, root)] = Entry(entry.lower, best)
            
        return best

    def _evaluate(self, game_state: GameState) -> int:
        """
        Evaluates the position using piece values and proper PST tables.
        """
        score = 0
        
        for r in range(10):
            for c in range(9):
                piece = game_state.board[r][c]
                if piece:
                    # Use Elephant Fish piece values
                    value = PIECE_VALUES_ELEPHANT[piece['type']]
                    
                    # Add positional bonus using existing PST tables
                    pst = PST_MAP.get(piece['type'])
                    if pst:
                        # PSTs are defined from Red's perspective, so we flip indices for Black
                        if piece['color'] == 'red':
                            value += pst[r][c]
                        else: 
                            value += pst[9 - r][8 - c]
                    
                    # Additional positional bonuses
                    value += self._get_additional_positional_bonus(piece['type'], r, c, piece['color'])
                    
                    # Adjust for color
                    if piece['color'] == self.color:
                        score += value
                    else:
                        score -= value
                        
        return score

    def _get_additional_positional_bonus(self, piece_type: str, r: int, c: int, color: str) -> int:
        """
        Returns additional positional bonuses for strategic positioning.
        """
        bonus = 0
        
        if piece_type == 'P':  # Pawns
            # Encourage advancement
            if color == 'red':
                bonus += (9 - r) * 3  # Red pawns moving up
            else:
                bonus += r * 3  # Black pawns moving down
            # Encourage center control
            if 3 <= c <= 5:
                bonus += 8
                
        elif piece_type == 'N':  # Horses
            # Encourage central positioning
            if 2 <= r <= 7 and 2 <= c <= 6:
                bonus += 15
            if 3 <= r <= 6 and 3 <= c <= 5:
                bonus += 25
                
        elif piece_type == 'R':  # Rooks
            # Encourage central files and ranks
            if 3 <= c <= 5:
                bonus += 12
            if 3 <= r <= 6:
                bonus += 12
                
        elif piece_type == 'C':  # Cannons
            # Encourage central positioning
            if 2 <= r <= 7 and 2 <= c <= 6:
                bonus += 10
            if 3 <= r <= 6 and 3 <= c <= 5:
                bonus += 20
                
        elif piece_type == 'E':  # Elephants
            # Defensive positioning
            if color == 'red' and r >= 7:
                bonus += 8
            elif color == 'black' and r <= 2:
                bonus += 8
                
        elif piece_type == 'A':  # Advisors
            # Palace positioning
            if 3 <= c <= 5:
                if color == 'red' and 7 <= r <= 9:
                    bonus += 10
                elif color == 'black' and 0 <= r <= 2:
                    bonus += 10
                    
        elif piece_type == 'K':  # Kings
            # Palace positioning
            if 3 <= c <= 5:
                if color == 'red' and 7 <= r <= 9:
                    bonus += 15
                elif color == 'black' and 0 <= r <= 2:
                    bonus += 15
                    
        return bonus

    def _move_value(self, game_state: GameState, move: Move) -> int:
        """
        Quick evaluation of a move's value for move ordering.
        """
        fr, fc = move['from']['y'], move['from']['x']
        tr, tc = move['to']['y'], move['to']['x']
        
        piece = game_state.board[fr][fc]
        dest_piece = game_state.board[tr][tc]
        
        if not piece:
            return 0
            
        # Base piece value
        score = PIECE_VALUES_ELEPHANT[piece['type']]
        
        # Capture bonus (high priority for captures)
        if dest_piece:
            score += PIECE_VALUES_ELEPHANT[dest_piece['type']] * 10
            
        # Positional bonus using PST
        pst = PST_MAP.get(piece['type'])
        if pst:
            # Calculate positional improvement
            if piece['color'] == 'red':
                score += pst[tr][tc] - pst[fr][fc]
            else:
                score += pst[9-tr][8-tc] - pst[9-fr][8-fc]
        
        # Additional positional bonuses
        score += self._get_additional_positional_bonus(piece['type'], tr, tc, piece['color'])
        score -= self._get_additional_positional_bonus(piece['type'], fr, fc, piece['color'])
        
        # Additional bonuses for good moves
        if piece['type'] == 'P' and piece['color'] == 'red' and tr < fr:  # Pawn advancing
            score += 30
        elif piece['type'] == 'P' and piece['color'] == 'black' and tr > fr:  # Pawn advancing
            score += 30
            
        return score

    def _get_board_hash(self, game_state: GameState) -> tuple:
        """
        Creates a hash of the board position for transposition table.
        """
        pieces_tuple = tuple(sorted(
            (r, c, p['type'], p['color']) 
            for r, row in enumerate(game_state.board) 
            for c, p in enumerate(row) 
            if p
        ))
        return (pieces_tuple, game_state.turn)

    def _get_next_state(self, game_state: GameState, move: Move) -> GameState:
        """
        Applies a move and returns a new GameState object.
        """
        fr, fc = move['from']['y'], move['from']['x']
        tr, tc = move['to']['y'], move['to']['x']
        
        new_board = [row[:] for row in game_state.board]
        piece_to_move = new_board[fr][fc]
        new_board[tr][tc] = piece_to_move
        new_board[fr][fc] = None

        next_turn = 'black' if game_state.turn == 'red' else 'red'
        
        # Reconstruct pieces list
        pieces_list = []
        for r, row in enumerate(new_board):
            for c, piece in enumerate(row):
                if piece:
                    pieces_list.append({
                        'y': r, 'x': c, 
                        'type': piece['type'], 
                        'color': piece['color']
                    })
        
        return GameState({'pieces': pieces_list, 'turn': next_turn}) 
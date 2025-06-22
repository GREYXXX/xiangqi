"""
This module provides heuristic evaluation functions for the Xiangqi board state.
The evaluation function is crucial for the Minimax agent to understand board advantage.
"""
from typing import Dict, List
from .game_state import GameState, Board

# Base piece values (scaled by 10 for integer arithmetic)
PIECE_VALUES: Dict[str, int] = {
    'K': 10000, 'R': 90, 'N': 40, 'C': 45, 'E': 20, 'A': 20, 'P': 10
}

# --- Piece-Square Tables (PSTs) ---
# These tables grant bonuses or penalties to pieces based on their position.
# The board is viewed from Red's perspective. Black's values will be flipped.
# fmt: off
P_PST = [
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 3, 4, 3, 0, 0, 0],
    [0, 0, 0, 7, 10, 7, 0, 0, 0],
    [0, 0, 0, 11, 15, 11, 0, 0, 0],
    [10, 10, 8, 12, 16, 12, 8, 10, 10], 
    [20, 20, 15, 20, 25, 20, 15, 20, 20],
    [20, 20, 15, 20, 25, 20, 15, 20, 20],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0]
]

N_PST = [
    [0, 2, 4, 6, 8, 6, 4, 2, 0],
    [2, 4, 6, 8, 10, 8, 6, 4, 2],
    [4, 6, 8, 10, 12, 10, 8, 6, 4],
    [6, 8, 10, 12, 14, 12, 10, 8, 6],
    [4, 10, 12, 14, 15, 14, 12, 10, 4],
    [2, 8, 10, 12, 13, 12, 10, 8, 2],
    [0, 4, 6, 8, 10, 8, 6, 4, 0],
    [0, 2, 4, 6, 8, 6, 4, 2, 0],
    [0, 0, 2, 4, 6, 4, 2, 0, 0],
    [-2, 0, 0, 0, 0, 0, 0, 0, -2]
]

R_PST = [
    [0, 0, 4, 6, 6, 6, 4, 0, 0],
    [2, 4, 6, 8, 8, 8, 6, 4, 2],
    [0, 0, 4, 6, 6, 6, 4, 0, 0],
    [0, 0, 4, 6, 6, 6, 4, 0, 0],
    [0, 0, 4, 6, 6, 6, 4, 0, 0],
    [0, 0, 4, 6, 6, 6, 4, 0, 0],
    [4, 4, 6, 8, 8, 8, 6, 4, 4],
    [4, 6, 8, 10, 10, 10, 8, 6, 4],
    [6, 8, 10, 12, 12, 12, 10, 8, 6],
    [6, 8, 10, 12, 12, 12, 10, 8, 6]
]
C_PST = R_PST
A_PST = [[0] * 9] * 10
E_PST = [[0] * 9] * 10
K_PST = [[0] * 9] * 10
# fmt: on

PST_MAP: Dict[str, List[List[int]]] = {
    'P': P_PST, 'N': N_PST, 'R': R_PST, 'C': C_PST, 
    'A': A_PST, 'E': E_PST, 'K': K_PST
}


def evaluate_board(game_state: GameState, color_to_evaluate: str) -> float:
    """
    Calculates a heuristic score for the board from the perspective of a given color.
    This version includes piece-square tables for positional evaluation.
    """
    score = 0.0
    board = game_state.board # Use the board from the GameState object

    for r in range(10):
        for c in range(9):
            piece = board[r][c]
            if piece:
                # 1. Material Score
                piece_score = PIECE_VALUES.get(piece['type'], 0)
                
                # 2. Positional Score from PST
                pst = PST_MAP.get(piece['type'])
                if pst:
                    # PSTs are defined from Red's perspective, so we flip indices for Black
                    if piece['color'] == 'red':
                        piece_score += pst[r][c]
                    else: 
                        piece_score += pst[9 - r][8 - c]

                # Add to total score
                if piece['color'] == color_to_evaluate:
                    score += piece_score
                else:
                    score -= piece_score
    
    return score 
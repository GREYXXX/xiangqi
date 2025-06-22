"""
This module defines the GameState class, which encapsulates the Xiangqi board
and all the logic related to game rules and move validation.
"""
from typing import List, Tuple, Dict, Optional

# Type definitions
Piece = Dict[str, str]
Board = List[List[Optional[Piece]]]
Move = Dict[str, Dict[str, int]]

class GameState:
    def __init__(self, board_state: dict):
        """
        Initializes the game state from a dictionary representation.
        :param board_state: A dictionary with 'pieces' and 'turn'.
        """
        self.turn: str = board_state.get('turn', 'red')
        self.board: Board = self._reconstruct_board(board_state.get('pieces', []))

    def _reconstruct_board(self, pieces: List[Dict]) -> Board:
        """Converts the list of piece objects into a 2D array."""
        board: Board = [[None for _ in range(9)] for _ in range(10)]
        for piece in pieces:
            if piece:
                y, x = piece['y'], piece['x']
                board[y][x] = {'type': piece['type'], 'color': piece['color']}
        return board

    def find_king_position(self, color: str) -> Optional[Tuple[int, int]]:
        for r, row in enumerate(self.board):
            for c, piece in enumerate(row):
                if piece and piece['type'] == 'K' and piece['color'] == color:
                    return r, c
        return None

    def get_all_valid_moves(self) -> List[Move]:
        valid_moves: List[Move] = []
        for r_from, row in enumerate(self.board):
            for c_from, piece in enumerate(row):
                if piece and piece['color'] == self.turn:
                    for r_to in range(10):
                        for c_to in range(9):
                            if self._is_legal_move_wrapper((r_from, c_from), (r_to, c_to)):
                                valid_moves.append({'from': {'y': r_from, 'x': c_from}, 'to': {'y': r_to, 'x': c_to}})
        return valid_moves
    
    def _is_legal_move_wrapper(self, from_pos: Tuple[int, int], to_pos: Tuple[int, int]) -> bool:
        """A wrapper that checks legality and if the move exposes the king."""
        if not self._is_legal_move_base(self.board, from_pos, to_pos):
            return False
        
        # Check if the move exposes the king to check
        temp_board = [row[:] for row in self.board]
        piece = temp_board[from_pos[0]][from_pos[1]]
        temp_board[to_pos[0]][to_pos[1]] = piece
        temp_board[from_pos[0]][from_pos[1]] = None
        
        if self._is_king_in_check(temp_board, self.turn):
            return False
            
        return True

    def _is_king_in_check(self, board: Board, king_color: str) -> bool:
        king_pos = self.find_king_position(king_color)
        if not king_pos: return True
        
        opponent_color = 'black' if king_color == 'red' else 'red'
        for r, row in enumerate(board):
            for c, piece in enumerate(row):
                if piece and piece['color'] == opponent_color:
                    if self._is_legal_move_base(board, (r, c), king_pos, is_checking_check=True):
                        return True
        return False

    def _is_legal_move_base(self, board: Board, from_pos: Tuple[int, int], to_pos: Tuple[int, int], is_checking_check: bool = False) -> bool:
        fr, fc = from_pos
        tr, tc = to_pos
        piece = board[fr][fc]
        dest_piece = board[tr][tc]

        if not piece: return False
        if dest_piece and dest_piece['color'] == piece['color']: return False
        dr, dc = tr - fr, tc - fc

        # (The rest of the detailed move logic from rules.py goes here)
        # Piece-specific rules
        piece_type = piece['type']
        color = piece['color']

        if piece['type'] == 'K' and not is_checking_check:
            opponent_king_pos = self.find_king_position('black' if color == 'red' else 'red')
            if opponent_king_pos and tc == opponent_king_pos[1]:
                start, end = sorted((tr, opponent_king_pos[0]))
                if all(board[r][tc] is None for r in range(start + 1, end)):
                    return False

        if piece_type == 'R':
            if fr != tr and fc != tc: return False
            path_range = range(min(fc, tc) + 1, max(fc, tc)) if fr == tr else range(min(fr, tr) + 1, max(fr, tr))
            if any(board[fr][c] for c in path_range) if fr == tr else any(board[r][fc] for r in path_range):
                return False
            return True

        elif piece_type == 'N':
            if not ((abs(dr) == 2 and abs(dc) == 1) or (abs(dr) == 1 and abs(dc) == 2)): return False
            leg_r, leg_c = (fr + dr // 2, fc) if abs(dr) == 2 else (fr, fc + dc // 2)
            if board[leg_r][leg_c]: return False
            return True

        elif piece_type == 'E':
            if abs(dr) != 2 or abs(dc) != 2: return False
            if (color == 'red' and tr < 5) or (color == 'black' and tr > 4): return False
            eye_r, eye_c = fr + dr // 2, fc + dc // 2
            if board[eye_r][eye_c]: return False
            return True

        elif piece_type == 'A':
            if abs(dr) != 1 or abs(dc) != 1: return False
            if not (3 <= tc <= 5 and ((color == 'red' and 7 <= tr <= 9) or (color == 'black' and 0 <= tr <= 2))):
                return False
            return True
        
        elif piece_type == 'K':
            if abs(dr) + abs(dc) != 1: return False
            if not (3 <= tc <= 5 and ((color == 'red' and 7 <= tr <= 9) or (color == 'black' and 0 <= tr <= 2))):
                return False
            return True

        elif piece_type == 'C':
            if fr != tr and fc != tc: return False
            path_range = range(min(fc, tc) + 1, max(fc, tc)) if fr == tr else range(min(fr, tr) + 1, max(fr, tr))
            path = [board[fr][c] for c in path_range] if fr == tr else [board[r][fc] for r in path_range]
            screen_count = sum(1 for p in path if p)
            if dest_piece: return screen_count == 1
            else: return screen_count == 0

        elif piece_type == 'P':
            if color == 'red':
                if fr > 4 and (dr != -1 or dc != 0): return False
                if fr <= 4 and not ((dr == -1 and dc == 0) or (dr == 0 and abs(dc) == 1)): return False
            else: # Black
                if fr < 5 and (dr != 1 or dc != 0): return False
                if fr >= 5 and not ((dr == 1 and dc == 0) or (dr == 0 and abs(dc) == 1)): return False
            return True

        return False 
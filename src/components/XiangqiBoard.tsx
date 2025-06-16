import React, { useState } from 'react';
import XiangqiPiece from './XiangqiPiece';
import type { PieceType, PieceColor } from './XiangqiPiece';
import XiangqiSquare from './XiangqiSquare';
import './xiangqi.css';

// Initial board setup
const initialBoard: ({ type: PieceType; color: PieceColor } | null)[][] = [
  [
    { type: 'R', color: 'black' },
    { type: 'N', color: 'black' },
    { type: 'E', color: 'black' },
    { type: 'A', color: 'black' },
    { type: 'K', color: 'black' },
    { type: 'A', color: 'black' },
    { type: 'E', color: 'black' },
    { type: 'N', color: 'black' },
    { type: 'R', color: 'black' },
  ],
  [null, null, null, null, null, null, null, null, null],
  [null, { type: 'C', color: 'black' }, null, null, null, null, null, { type: 'C', color: 'black' }, null],
  [
    { type: 'P', color: 'black' }, null, { type: 'P', color: 'black' }, null, { type: 'P', color: 'black' }, null, { type: 'P', color: 'black' }, null, { type: 'P', color: 'black' },
  ],
  [null, null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null, null],
  [
    { type: 'P', color: 'red' }, null, { type: 'P', color: 'red' }, null, { type: 'P', color: 'red' }, null, { type: 'P', color: 'red' }, null, { type: 'P', color: 'red' },
  ],
  [null, { type: 'C', color: 'red' }, null, null, null, null, null, { type: 'C', color: 'red' }, null],
  [null, null, null, null, null, null, null, null, null],
  [
    { type: 'R', color: 'red' }, { type: 'N', color: 'red' }, { type: 'E', color: 'red' }, { type: 'A', color: 'red' }, { type: 'K', color: 'red' }, { type: 'A', color: 'red' }, { type: 'E', color: 'red' }, { type: 'N', color: 'red' }, { type: 'R', color: 'red' },
  ],
];

function cloneBoard(board: typeof initialBoard) {
  return board.map(row => row.map(cell => cell ? { ...cell } : null));
}

// --- Move validation helpers ---
function isSameColor(a: PieceColor, b: PieceColor) {
  return a === b;
}

// Returns true if move is legal for the piece (basic rules)
function isLegalMove(
  board: typeof initialBoard,
  from: [number, number],
  to: [number, number],
  piece: { type: PieceType; color: PieceColor }
): boolean {
  const [fr, fc] = from;
  const [tr, tc] = to;
  const dr = tr - fr;
  const dc = tc - fc;
  const dest = board[tr][tc];
  if (dest && isSameColor(dest.color, piece.color)) return false;
  // --- Piece rules ---
  switch (piece.type) {
    case 'R': // Rook
      if (fr !== tr && fc !== tc) return false;
      // Check path clear
      if (fr === tr) {
        const min = Math.min(fc, tc) + 1, max = Math.max(fc, tc);
        for (let c = min; c < max; c++) if (board[fr][c]) return false;
      } else {
        const min = Math.min(fr, tr) + 1, max = Math.max(fr, tr);
        for (let r = min; r < max; r++) if (board[r][fc]) return false;
      }
      return true;
    case 'N': // Knight
      if (!((Math.abs(dr) === 2 && Math.abs(dc) === 1) || (Math.abs(dr) === 1 && Math.abs(dc) === 2))) return false;
      // Check "leg"
      if (Math.abs(dr) === 2) {
        if (board[fr + dr / 2][fc]) return false;
      } else {
        if (board[fr][fc + dc / 2]) return false;
      }
      return true;
    case 'E': // Elephant
      if (Math.abs(dr) !== 2 || Math.abs(dc) !== 2) return false;
      // Cannot cross river
      if ((piece.color === 'red' && tr < 5) || (piece.color === 'black' && tr > 4)) return false;
      // Check "eye"
      if (board[fr + dr / 2][fc + dc / 2]) return false;
      return true;
    case 'A': // Advisor
      if (Math.abs(dr) !== 1 || Math.abs(dc) !== 1) return false;
      // Must stay in palace
      if (tc < 3 || tc > 5) return false;
      if (piece.color === 'red' && tr < 7) return false;
      if (piece.color === 'black' && tr > 2) return false;
      return true;
    case 'K': // King
      if (!((Math.abs(dr) === 1 && dc === 0) || (Math.abs(dc) === 1 && dr === 0))) return false;
      // Must stay in palace
      if (tc < 3 || tc > 5) return false;
      if (piece.color === 'red' && tr < 7) return false;
      if (piece.color === 'black' && tr > 2) return false;
      return true;
    case 'C': // Cannon
      if (fr !== tr && fc !== tc) return false;
      let count = 0;
      if (fr === tr) {
        const min = Math.min(fc, tc) + 1, max = Math.max(fc, tc);
        for (let c = min; c < max; c++) if (board[fr][c]) count++;
      } else {
        const min = Math.min(fr, tr) + 1, max = Math.max(fr, tr);
        for (let r = min; r < max; r++) if (board[r][fc]) count++;
      }
      if (!dest) return count === 0; // move
      return count === 1; // capture
    case 'P': // Pawn
      if (piece.color === 'red') {
        if (fr <= 4) {
          // before crossing river
          if (tr !== fr - 1 || fc !== tc) return false;
        } else {
          if (!((tr === fr - 1 && fc === tc) || (fr === tr && Math.abs(tc - fc) === 1))) return false;
        }
      } else {
        if (fr >= 5) {
          // before crossing river
          if (tr !== fr + 1 || fc !== tc) return false;
        } else {
          if (!((tr === fr + 1 && fc === tc) || (fr === tr && Math.abs(tc - fc) === 1))) return false;
        }
      }
      return true;
    default:
      return false;
  }
}

// Find all valid moves for a color
function getAllValidMoves(board: typeof initialBoard, color: PieceColor) {
  const moves: { from: [number, number]; to: [number, number] }[] = [];
  for (let r = 0; r < 10; r++) {
    for (let c = 0; c < 9; c++) {
      const piece = board[r][c];
      if (piece && piece.color === color) {
        for (let tr = 0; tr < 10; tr++) {
          for (let tc = 0; tc < 9; tc++) {
            if (isLegalMove(board, [r, c], [tr, tc], piece)) {
              moves.push({ from: [r, c], to: [tr, tc] });
            }
          }
        }
      }
    }
  }
  return moves;
}

const XiangqiBoard: React.FC = () => {
  const [playerColor, setPlayerColor] = useState<PieceColor | null>(null);
  const [board, setBoard] = useState(initialBoard);
  const [turn, setTurn] = useState<PieceColor>('red');
  const [selected, setSelected] = useState<[number, number] | null>(null);

  // Handle user click
  function handleSquareClick(row: number, col: number) {
    if (!playerColor || turn !== playerColor) return;
    const piece = board[row][col];
    if (selected) {
      // Try move
      const [sr, sc] = selected;
      const selPiece = board[sr][sc];
      if (selPiece && isLegalMove(board, selected, [row, col], selPiece)) {
        const newBoard = cloneBoard(board);
        newBoard[row][col] = selPiece;
        newBoard[sr][sc] = null;
        setBoard(newBoard);
        setSelected(null);
        setTurn(playerColor === 'red' ? 'black' : 'red');
        setTimeout(() => computerMove(newBoard, playerColor === 'red' ? 'black' : 'red'), 500);
        return;
      } else if (piece && piece.color === playerColor) {
        setSelected([row, col]);
      } else {
        setSelected(null);
      }
    } else {
      if (piece && piece.color === playerColor) {
        setSelected([row, col]);
      }
    }
  }

  // Computer random move
  function computerMove(currentBoard: typeof initialBoard, color: PieceColor) {
    const moves = getAllValidMoves(currentBoard, color);
    if (moves.length === 0) return;
    const move = moves[Math.floor(Math.random() * moves.length)];
    const [sr, sc] = move.from;
    const [tr, tc] = move.to;
    const piece = currentBoard[sr][sc];
    if (!piece) return;
    const newBoard = cloneBoard(currentBoard);
    newBoard[tr][tc] = piece;
    newBoard[sr][sc] = null;
    setBoard(newBoard);
    setTurn(playerColor!);
  }

  if (!playerColor) {
    return (
      <div style={{ textAlign: 'center', marginTop: 40 }}>
        <h2>Choose Your Side</h2>
        <button style={{ margin: 12, padding: '12px 32px', fontSize: 20, color: '#b30000', border: '2px solid #b30000', borderRadius: 8 }} onClick={() => setPlayerColor('red')}>Play Red</button>
        <button style={{ margin: 12, padding: '12px 32px', fontSize: 20, color: '#222', border: '2px solid #222', borderRadius: 8 }} onClick={() => setPlayerColor('black')}>Play Black</button>
      </div>
    );
  }

  return (
    <div className="xiangqi-board">
      {/* Render board grid */}
      {Array.from({ length: 10 }).map((_, row) => (
        <div className="xiangqi-row" key={row}>
          {Array.from({ length: 9 }).map((_, col) => {
            const piece = board[row][col];
            const isSelected = selected && selected[0] === row && selected[1] === col;
            return (
              <div onClick={() => handleSquareClick(row, col)} key={col} style={{ cursor: (turn === playerColor && piece && piece.color === playerColor) ? 'pointer' : 'default' }}>
                <XiangqiSquare row={row} col={col} highlight={!!isSelected}>
                  {piece && <XiangqiPiece type={piece.type} color={piece.color} />}
                </XiangqiSquare>
              </div>
            );
          })}
        </div>
      ))}
      {/* River label */}
      <div className="xiangqi-river">Chu River &nbsp;&nbsp;&nbsp;&nbsp; Han Border</div>
      {/* Palace lines and extra decorations handled in CSS */}
    </div>
  );
};

export default XiangqiBoard;

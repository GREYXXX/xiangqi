import React, { useState, useEffect } from 'react';
import XiangqiPiece from './XiangqiPiece';
import type { PieceType, PieceColor } from './XiangqiPiece';
import './xiangqi.css';

// Initial board setup
const initialBoard: ({ type: PieceType; color: PieceColor } | null)[][] = [
  [
    { type: 'R', color: 'black' }, { type: 'N', color: 'black' }, { type: 'E', color: 'black' }, { type: 'A', color: 'black' }, { type: 'K', color: 'black' }, { type: 'A', color: 'black' }, { type: 'E', color: 'black' }, { type: 'N', color: 'black' }, { type: 'R', color: 'black' },
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

// --- CHECK AND CHECKMATE LOGIC ---

function findKingPosition(board: typeof initialBoard, color: PieceColor): [number, number] | null {
  for (let r = 0; r < 10; r++) {
    for (let c = 0; c < 9; c++) {
      const piece = board[r][c];
      if (piece && piece.type === 'K' && piece.color === color) {
        return [r, c];
      }
    }
  }
  return null;
}

function isKingInCheck(board: typeof initialBoard, kingColor: PieceColor): boolean {
  const kingPos = findKingPosition(board, kingColor);
  if (!kingPos) return true; // Should not happen

  const opponentColor = kingColor === 'red' ? 'black' : 'red';
  for (let r = 0; r < 10; r++) {
    for (let c = 0; c < 9; c++) {
      const piece = board[r][c];
      if (piece && piece.color === opponentColor) {
        if (isLegalMove(board, [r, c], kingPos, piece, true)) {
          return true;
        }
      }
    }
  }
  return false;
}

// Returns true if move is legal for the piece (basic rules)
function isLegalMove(
  board: typeof initialBoard,
  from: [number, number],
  to: [number, number],
  piece: { type: PieceType; color: PieceColor },
  isCheckingCheck = false // Prevent infinite recursion
): boolean {
  const [fr, fc] = from;
  const [tr, tc] = to;
  const dr = tr - fr;
  const dc = tc - fc;
  const dest = board[tr][tc];

  if (dest && isSameColor(dest.color, piece.color)) return false;

  // --- Flying General Rule ---
  if (piece.type === 'K' && !isCheckingCheck) {
    const opponentKingPos = findKingPosition(board, piece.color === 'red' ? 'black' : 'red');
    if (opponentKingPos && tc === opponentKingPos[1]) {
      const min = Math.min(tr, opponentKingPos[0]) + 1;
      const max = Math.max(tr, opponentKingPos[0]);
      let clear = true;
      for (let r = min; r < max; r++) {
        if (board[r][tc]) {
          clear = false;
          break;
        }
      }
      if (clear) return false;
    }
  }

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
        if (fr > 4) { // Before river
          if (tr !== fr - 1 || fc !== tc) return false;
        } else { // After river
          if (!((tr === fr - 1 && fc === tc) || (fr === tr && Math.abs(tc - fc) === 1 && tr <= 4))) return false;
        }
      } else {
        if (fr < 5) { // Before river
          if (tr !== fr + 1 || fc !== tc) return false;
        } else { // After river
          if (!((tr === fr + 1 && fc === tc) || (fr === tr && Math.abs(tc - fc) === 1 && tr >=5))) return false;
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
              // Check if move exposes the king
              const tempBoard = cloneBoard(board);
              tempBoard[tr][tc] = piece;
              tempBoard[r][c] = null;
              if (!isKingInCheck(tempBoard, color)) {
                moves.push({ from: [r, c], to: [tr, tc] });
              }
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
  const [availableAgents, setAvailableAgents] = useState<string[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<string>('');
  const [board, setBoard] = useState(initialBoard);
  const [turn, setTurn] = useState<PieceColor>('red');
  const [selected, setSelected] = useState<[number, number] | null>(null);
  const [gameOver, setGameOver] = useState<string | null>(null);

  useEffect(() => {
    // Fetch available agents from the backend when the component mounts
    async function fetchAgents() {
      try {
        const response = await fetch('http://localhost:8000/agents');
        const data = await response.json();
        if (data.agents && data.agents.length > 0) {
          setAvailableAgents(data.agents);
          setSelectedAgent(data.agents[0]); // Default to the first agent
        }
      } catch (error) {
        console.error("Failed to fetch agents:", error);
        // Fallback in case backend is down
        setAvailableAgents(['Random']);
        setSelectedAgent('Random');
      }
    }
    fetchAgents();
  }, []);

  function resetGame() {
    setBoard(cloneBoard(initialBoard));
    setPlayerColor(null);
    setTurn('red');
    setSelected(null);
    setGameOver(null);
  }

  function checkGameState(currentBoard: typeof initialBoard, nextTurn: PieceColor) {
    const validMoves = getAllValidMoves(currentBoard, nextTurn);
    if (validMoves.length === 0) {
      if (isKingInCheck(currentBoard, nextTurn)) {
        setGameOver(`${nextTurn === 'red' ? 'Black' : 'Red'} wins by checkmate!`);
      } else {
        setGameOver("Stalemate! It's a draw.");
      }
    }
  }

  function handleSquareClick(row: number, col: number) {
    if (gameOver || !playerColor || turn !== playerColor) return;

    const piece = board[row][col];
    if (selected) {
      const [sr, sc] = selected;
      const selPiece = board[sr][sc];
      const validMoves = getAllValidMoves(board, playerColor);
      const isMoveInValidList = validMoves.some(m => m.from[0] === sr && m.from[1] === sc && m.to[0] === row && m.to[1] === col);

      if (selPiece && isMoveInValidList) {
        const newBoard = cloneBoard(board);
        newBoard[row][col] = selPiece;
        newBoard[sr][sc] = null;
        setBoard(newBoard);
        setSelected(null);
        const nextTurn = playerColor === 'red' ? 'black' : 'red';
        setTurn(nextTurn);
        checkGameState(newBoard, nextTurn);
        // Delay computer move for UX
        setTimeout(() => computerMove(newBoard, nextTurn), 500);
      } else {
        setSelected(piece && piece.color === playerColor ? [row, col] : null);
      }
    } else if (piece && piece.color === playerColor) {
      setSelected([row, col]);
    }
  }

  async function computerMove(currentBoard: typeof initialBoard, color: PieceColor) {
    if (gameOver) return;

    // 1. Convert the board to the format expected by the backend
    const pieces = [];
    for (let r = 0; r < 10; r++) {
      for (let c = 0; c < 9; c++) {
        const piece = currentBoard[r][c];
        if (piece) {
          pieces.push({ ...piece, y: r, x: c });
        }
      }
    }
    const boardState = { pieces, turn: color };
    const requestBody = { board_state: boardState, agent_name: selectedAgent };

    // 2. Call the backend API
    try {
      const response = await fetch('http://localhost:8000/get_move', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.statusText}`);
      }

      const data = await response.json();
      const move = data.move;

      // 3. Apply the move from the backend
      if (move && move.from && move.to) {
        const { from, to } = move;
        const pieceToMove = currentBoard[from.y][from.x];

        // Basic validation
        if (!pieceToMove || pieceToMove.color !== color) {
          console.error("Agent returned an invalid move:", move);
          return;
        }

        const newBoard = cloneBoard(currentBoard);
        newBoard[to.y][to.x] = pieceToMove;
        newBoard[from.y][from.x] = null;
        
        setBoard(newBoard);
        const nextTurn = color === 'red' ? 'black' : 'red';
        setTurn(nextTurn);
        checkGameState(newBoard, nextTurn);
      } else {
        console.log("Agent returned no move or an invalid format.", data);
        // This could mean stalemate or checkmate as determined by the agent.
      }
    } catch (error) {
      console.error("Failed to get computer move:", error);
      // Optional: Handle error, maybe show a message to the user
    }
  }

  // --- Rendering Logic ---

  const renderGridLines = () => {
    // ... existing code ...
  };

  if (!playerColor) {
    return (
      <div style={{ textAlign: 'center', marginTop: 40, padding: 20, background: 'rgba(40, 30, 20, 0.8)', borderRadius: 12, color: '#f5e2c8' }}>
        <h2 style={{ color: '#e0c28c' }}>Choose Your Opponent</h2>
        <div style={{ margin: '20px 0' }}>
          {availableAgents.map(agent => (
            <button 
              key={agent} 
              onClick={() => setSelectedAgent(agent)}
              style={{ 
                margin: '0 10px', 
                padding: '10px 20px', 
                fontSize: 16, 
                cursor: 'pointer',
                background: selectedAgent === agent ? '#e0c28c' : '#3a2e25',
                color: selectedAgent === agent ? '#3a2e25' : '#e0c28c',
                border: '2px solid #e0c28c',
                borderRadius: 8,
              }}
            >
              {agent}
            </button>
          ))}
        </div>

        <h2 style={{ color: '#e0c28c', marginTop: 30 }}>Choose Your Side</h2>
        <button style={{ margin: 12, padding: '12px 32px', fontSize: 20, cursor: 'pointer', background: '#c84a3d', color: 'white', border: 'none', borderRadius: 8 }} onClick={() => setPlayerColor('red')}>Play Red</button>
        <button style={{ margin: 12, padding: '12px 32px', fontSize: 20, cursor: 'pointer', background: '#333', color: 'white', border: 'none', borderRadius: 8 }} onClick={() => setPlayerColor('black')}>Play Black</button>
      </div>
    );
  }

  return (
    <div className="xiangqi-board">
      {gameOver && (
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', background: 'rgba(255, 255, 255, 0.9)', padding: '20px', borderRadius: '10px', zIndex: 100, textAlign: 'center' }}>
          <h2>Game Over</h2>
          <p>{gameOver}</p>
          <div style={{ marginTop: '20px' }}>
            <button onClick={resetGame} style={{ padding: '10px 20px', fontSize: '16px', cursor: 'pointer', marginRight: '10px' }}>Restart</button>
            <button onClick={resetGame} style={{ padding: '10px 20px', fontSize: '16px', cursor: 'pointer' }}>Exit Game</button>
          </div>
        </div>
      )}
      <div className="board-grid">
        {/* Horizontal Lines */}
        {Array.from({ length: 10 }).map((_, i) => (
          <div className="h-line" style={{ top: `calc(${i} * var(--square-size))` }} key={`h${i}`} />
        ))}
        {/* Vertical Lines */}
        {Array.from({ length: 9 }).map((_, i) => {
          if (i === 0 || i === 8) {
            return <div className="v-line" style={{ left: `calc(${i} * var(--square-size))` }} key={`v${i}`} />;
          }
          return (
            <React.Fragment key={`v${i}`}>
              <div className="v-line top-half" style={{ left: `calc(${i} * var(--square-size))` }} />
              <div className="v-line bottom-half" style={{ left: `calc(${i} * var(--square-size))` }} />
            </React.Fragment>
          );
        })}
        {/* Palaces */}
        {/* Top Palace */}
        <div className="palace-line" style={{ top: '0', left: `calc(3 * var(--square-size))`, transform: 'rotate(45deg)' }} />
        <div className="palace-line" style={{ top: '0', left: `calc(5 * var(--square-size))`, transform: 'rotate(135deg)' }} />
        {/* Bottom Palace */}
        <div className="palace-line" style={{ top: `calc(7 * var(--square-size))`, left: `calc(3 * var(--square-size))`, transform: 'rotate(45deg)' }} />
        <div className="palace-line" style={{ top: `calc(7 * var(--square-size))`, left: `calc(5 * var(--square-size))`, transform: 'rotate(135deg)' }} />
      </div>
      
      <div className="xiangqi-river">
        <span>楚 河</span>
        <span>漢 界</span>
      </div>

      <div className="pieces-container">
        {board.flatMap((row, r) =>
          row.map((piece, c) => {
            const posStyle = {
              top: `calc(${r} * var(--square-size))`,
              left: `calc(${c} * var(--square-size))`,
            };
            if (piece) {
              return (
                <div
                  key={`${r}-${c}`}
                  className={`piece-wrapper ${selected && selected[0] === r && selected[1] === c ? 'selected' : ''}`}
                  style={posStyle}
                  onClick={() => handleSquareClick(r, c)}
                >
                  <XiangqiPiece type={piece.type} color={piece.color} />
                </div>
              );
            }
            // Render clickable targets for empty squares
            return (
              <div
                key={`${r}-${c}-target`}
                className="click-target"
                style={posStyle}
                onClick={() => handleSquareClick(r, c)}
              />
            );
          })
        )}
      </div>
    </div>
  );
};

export default XiangqiBoard;

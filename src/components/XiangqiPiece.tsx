import React from 'react';

export type PieceType = 'R' | 'N' | 'E' | 'A' | 'K' | 'C' | 'P';
export type PieceColor = 'red' | 'black';

interface XiangqiPieceProps {
  type: PieceType;
  color: PieceColor;
}

const pieceNames: Record<PieceType, string> = {
  R: 'Rook',
  N: 'Knight',
  E: 'Elephant',
  A: 'Advisor',
  K: 'King',
  C: 'Cannon',
  P: 'Pawn',
};

const XiangqiPiece: React.FC<XiangqiPieceProps> = ({ type, color }) => {
  return (
    <div
      className={`xiangqi-piece ${color}`}
      title={pieceNames[type]}
      style={{
        width: 48,
        height: 48,
        borderRadius: '50%',
        background: color === 'red' ? 'linear-gradient(145deg, #ffb3b3, #ff6666)' : 'linear-gradient(145deg, #e0e0e0, #333)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        fontWeight: 700,
        fontSize: 24,
        color: color === 'red' ? '#b30000' : '#111',
        border: color === 'red' ? '2px solid #b30000' : '2px solid #111',
        userSelect: 'none',
      }}
    >
      {type}
    </div>
  );
};

export default XiangqiPiece; 
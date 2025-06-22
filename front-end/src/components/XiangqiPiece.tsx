import React from 'react';

// Import all piece images from the new subdirectories
import black_r from '../assets/Black/English-Rook-Black.png';
import black_n from '../assets/Black/English-Horse-Black.png';
import black_e from '../assets/Black/English-Elephant-Black.png';
import black_a from '../assets/Black/English-Advisor-Black.png';
import black_k from '../assets/Black/English-King-Black.png';
import black_c from '../assets/Black/English-Cannon-Black.png';
import black_p from '../assets/Black/English-Pawn-Black.png';

import red_r from '../assets/Red/English-Rook-Red.png';
import red_n from '../assets/Red/English-Horse-Red.png';
import red_e from '../assets/Red/English-Elephant-Red.png';
import red_a from '../assets/Red/English-Advisor-Red.png';
import red_k from '../assets/Red/English-King-Red.png';
import red_c from '../assets/Red/English-Cannon-Red.png';
import red_p from '../assets/Red/English-Pawn-Red.png';

export type PieceType = 'R' | 'N' | 'E' | 'A' | 'K' | 'C' | 'P';
export type PieceColor = 'red' | 'black';

interface XiangqiPieceProps {
  type: PieceType;
  color: PieceColor;
}

const pieceImageMap: Record<PieceColor, Record<PieceType, string>> = {
  black: {
    R: black_r,
    N: black_n,
    E: black_e,
    A: black_a,
    K: black_k,
    C: black_c,
    P: black_p,
  },
  red: {
    R: red_r,
    N: red_n,
    E: red_e,
    A: red_a,
    K: red_k,
    C: red_c,
    P: red_p,
  },
};

const XiangqiPiece: React.FC<XiangqiPieceProps> = ({ type, color }) => {
  // Corrected the key for knight from 'kight' to 'N'
  const pieceKey = type === 'N' ? 'N' : type;
  const imageUrl = pieceImageMap[color][pieceKey];

  return (
    <img
      src={imageUrl}
      alt={`${color} ${type}`}
      style={{ width: '90%', height: '90%', objectFit: 'contain' }}
    />
  );
};

export default XiangqiPiece; 
import React from 'react';

interface XiangqiSquareProps {
  row: number;
  col: number;
  highlight?: boolean;
  children?: React.ReactNode;
}

const XiangqiSquare: React.FC<XiangqiSquareProps> = ({ row, col, highlight, children }) => {
  return (
    <div
      className={`xiangqi-square${highlight ? ' highlight' : ''}`}
      style={{
        width: 56,
        height: 56,
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'transparent',
        border: '1px solid #bfa16c',
        boxSizing: 'border-box',
      }}
      data-row={row}
      data-col={col}
    >
      {children}
    </div>
  );
};

export default XiangqiSquare; 
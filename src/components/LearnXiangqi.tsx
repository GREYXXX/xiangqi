import React from 'react';

const LearnXiangqi: React.FC = () => {
  const containerStyle: React.CSSProperties = {
    maxWidth: '800px',
    margin: 'auto',
    padding: '30px',
    background: 'rgba(40, 30, 20, 0.75)',
    borderRadius: '12px',
    color: '#f5e2c8',
    fontFamily: 'Georgia, serif',
    lineHeight: '1.8',
  };

  const h2Style: React.CSSProperties = {
    color: '#e0c28c',
    borderBottom: '2px solid #bfa16c',
    paddingBottom: '10px',
  };

  const h3Style: React.CSSProperties = {
    color: '#ffdead', // NavahoWhite
  };

  return (
    <div style={containerStyle}>
      <h2 style={h2Style}>How to Play Xiangqi (Chinese Chess)</h2>
      
      <p>
        Xiangqi is a two-player strategy board game in the same family as Western chess. It is one of the most popular board games in China. The game represents a battle between two armies, with the object of capturing the enemy's "general" (king).
      </p>

      <h3 style={h3Style}>The Board</h3>
      <p>
        The game is played on a board that is 9 lines wide and 10 lines long. The pieces are placed on the intersections of the lines, not within the squares. A vertical space in the middle of the board, called the "river," divides the two sides.
      </p>

      <h3 style={h3Style}>The Pieces & Their Moves</h3>
      <ul>
        <li><strong>General (King):</strong> Moves one point orthogonally (not diagonally). It may not leave the "palace," a 3x3 area at the back of each side.</li>
        <li><strong>Advisor (Guard):</strong> Moves one point diagonally and must also stay within the palace.</li>
        <li><strong>Elephant (Minister):</strong> Moves exactly two points diagonally. Elephants may not cross the river. Their path can be blocked by an intervening piece.</li>
        <li><strong>Horse (Knight):</strong> Moves one point orthogonally, then one point diagonally away from its starting position. Its path can be blocked by a piece adjacent to it.</li>
        <li><strong>Chariot (Rook):</strong> Moves any number of points orthogonally, as long as its path is not blocked.</li>
        <li><strong>Cannon:</strong> Moves like a Chariot. To capture, it must jump over exactly one piece (friend or foe) along its line of attack.</li>
        <li><strong>Soldier (Pawn):</strong> Before crossing the river, it moves one point forward. After crossing the river, it can move one point forward or one point sideways. It cannot move backward.</li>
      </ul>

      <h3 style={h3Style}>Basic Rules</h3>
      <ol>
        <li>Red moves first.</li>
        <li>The primary goal is to checkmate the opponent's General. "Check" is when the General is under direct attack. "Checkmate" is when the General is in check and cannot make any legal move to escape.</li>
        <li>The two Generals cannot face each other on the same open file (the "Flying General" rule).</li>
        <li>Stalemate, where a player has no legal moves but is not in check, results in a loss for the stalemated player.</li>
      </ol>
    </div>
  );
};

export default LearnXiangqi; 
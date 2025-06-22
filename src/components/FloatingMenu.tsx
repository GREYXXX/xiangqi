import React from 'react';
import './FloatingMenu.css';
import PlayIcon from './icons/PlayIcon';
import PuzzlesIcon from './icons/PuzzlesIcon';
import LearnIcon from './icons/LearnIcon';
import ChatIcon from './icons/ChatIcon';

// The new View type from App.tsx
type View = 'play' | 'puzzles' | 'learn' | 'chat';

interface FloatingMenuProps {
  onSelectView: (view: View) => void;
}

const FloatingMenu: React.FC<FloatingMenuProps> = ({ onSelectView }) => {
  return (
    <nav className="floating-menu">
      {/* User profile/header can go here */}

      <button className="menu-item" onClick={() => onSelectView('play')}>
        <PlayIcon className="menu-icon" />
        <span className="menu-text">Play</span>
        <span className="menu-arrow">{'>'}</span>
      </button>

      <button className="menu-item" onClick={() => onSelectView('puzzles')}>
        <PuzzlesIcon className="menu-icon" />
        <span className="menu-text">Puzzles</span>
        <span className="menu-arrow">{'>'}</span>
      </button>

      <button className="menu-item" onClick={() => onSelectView('learn')}>
        <LearnIcon className="menu-icon" />
        <span className="menu-text">Learn</span>
        <span className="menu-arrow">{'>'}</span>
      </button>

      <button className="menu-item" onClick={() => onSelectView('chat')}>
        <ChatIcon className="menu-icon" />
        <span className="menu-text">Chat</span>
        <span className="menu-arrow">{'>'}</span>
      </button>
    </nav>
  );
};

export default FloatingMenu; 
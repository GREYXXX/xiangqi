import React, { useState } from 'react';
import XiangqiBoard from './components/XiangqiBoard';
import FloatingMenu from './components/FloatingMenu';
import LearnXiangqi from './components/LearnXiangqi';
import './App.css';

type View = 'play' | 'puzzles' | 'learn' | 'chat';

// Placeholder for Puzzles
const PuzzlesPlaceholder: React.FC = () => (
    <div style={{
        padding: '40px',
        background: 'rgba(40, 30, 20, 0.75)',
        borderRadius: '12px',
        textAlign: 'center',
        color: '#f5e2c8',
        maxWidth: '600px',
    }}>
        <h2 style={{ color: '#e0c28c' }}>Puzzles</h2>
        <p>This feature is coming soon!</p>
    </div>
);

// Placeholder for Chat
const ChatPlaceholder: React.FC = () => (
    <div style={{
        padding: '40px',
        background: 'rgba(40, 30, 20, 0.75)',
        borderRadius: '12px',
        textAlign: 'center',
        color: '#f5e2c8',
        maxWidth: '600px',
    }}>
        <h2 style={{ color: '#e0c28c' }}>Chat</h2>
        <p>This feature is coming soon!</p>
    </div>
);

function App() {
  const [view, setView] = useState<View>('play');

  const renderView = () => {
    switch (view) {
      case 'play':
        return <XiangqiBoard />;
      case 'puzzles':
        return <PuzzlesPlaceholder />;
      case 'learn':
        return <LearnXiangqi />;
      case 'chat':
        return <ChatPlaceholder />;
      default:
        return <XiangqiBoard />;
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <FloatingMenu onSelectView={setView} />
      <main style={{ padding: '20px' }}>
        {renderView()}
      </main>
    </div>
  );
}

export default App;

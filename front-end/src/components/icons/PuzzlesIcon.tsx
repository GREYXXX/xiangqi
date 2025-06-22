import React from 'react';

const PuzzlesIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    {...props}
  >
    <path d="M14 7h-4a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z"/>
    <path d="M10 7V5a2 2 0 0 1 2-2h0a2 2 0 0 1 2 2v2"/>
    <path d="M14 17v2a2 2 0 0 1-2 2h0a2 2 0 0 1-2-2v-2"/>
    <path d="M7 10H5a2 2 0 0 0-2 2v0a2 2 0 0 0 2 2h2"/>
    <path d="M17 14h2a2 2 0 0 0 2-2v0a2 2 0 0 0-2-2h-2"/>
  </svg>
);

export default PuzzlesIcon; 
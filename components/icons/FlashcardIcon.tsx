import React from 'react';

export const FlashcardIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="7" width="18" height="12" rx="2" ry="2" />
    <path d="M6 3h12a2 2 0 0 1 2 2v2H4V5a2 2 0 0 1 2-2z" />
  </svg>
);

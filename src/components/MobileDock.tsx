import React from 'react';
import './MobileDock.css';

interface MobileDockProps {
  onToggleLeft: () => void;
  onToggleRight: () => void;
  onGoHome: () => void;
}

export const MobileDock: React.FC<MobileDockProps> = ({ onToggleLeft, onToggleRight, onGoHome }) => {
  return (
    <div className="mobile-dock-container">
      <div className="mobile-dock glass-dock">
        <button className="dock-btn" onClick={onToggleLeft}>
          <span className="dock-icon">☰</span>
          <span className="dock-label">메뉴</span>
        </button>
        
        <button className="dock-btn main-action" onClick={onGoHome}>
          <span className="dock-icon">🏠</span>
        </button>

        <button className="dock-btn" onClick={onToggleRight}>
          <span className="dock-icon">📅</span>
          <span className="dock-label">일정</span>
        </button>
      </div>
    </div>
  );
};

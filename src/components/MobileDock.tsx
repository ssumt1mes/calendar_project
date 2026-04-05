import React from 'react';
import './MobileDock.css';

interface MobileDockProps {
  onToggleLeft: () => void;
  onToggleRight: () => void;
  onGoHome: () => void;
}

export const MobileDock: React.FC<MobileDockProps> = ({ onToggleLeft, onToggleRight, onGoHome }) => {
  const today = new Date();
  const todayDate = today.getDate();
  const todayLabel = new Intl.DateTimeFormat('ko-KR', { month: 'numeric', day: 'numeric' }).format(today);

  return (
    <div className="mobile-dock-container">
      <div className="mobile-dock glass-dock">
        <button type="button" aria-label="메뉴 열기" className="dock-btn" onClick={onToggleLeft}>
          <span className="dock-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" focusable="false">
              <path d="M4 7h16M4 12h16M4 17h10" />
            </svg>
          </span>
          <span className="dock-label">메뉴</span>
        </button>
        
        <button type="button" aria-label="오늘로 이동" className="dock-btn main-action" onClick={onGoHome}>
          <span className="dock-main-eyebrow">오늘</span>
          <span className="dock-main-date">{todayDate}</span>
          <span className="dock-main-label">{todayLabel}</span>
        </button>

        <button type="button" aria-label="일정 패널 열기" className="dock-btn" onClick={onToggleRight}>
          <span className="dock-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" focusable="false">
              <path d="M7 4v3M17 4v3M5 9h14M6 6h12a1 1 0 0 1 1 1v10a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V7a1 1 0 0 1 1-1Z" />
            </svg>
          </span>
          <span className="dock-label">일정</span>
        </button>
      </div>
    </div>
  );
};

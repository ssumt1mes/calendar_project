import React, { useEffect, useState } from 'react';
import './Layout.css';
import { MobileDock } from './MobileDock';

interface LayoutProps {
  leftSidebar: React.ReactNode;
  children: React.ReactNode; // Center content
  rightSidebar: React.ReactNode;
  onToday: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ leftSidebar, children, rightSidebar, onToday }) => {
  const [showLeft, setShowLeft] = useState(false);
  const [showRight, setShowRight] = useState(false);

  useEffect(() => {
    const isAnyDrawerOpen = showLeft || showRight;
    document.body.style.overflow = isAnyDrawerOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [showLeft, showRight]);

  // Close drawers when clicking outside (backdrop)
  const closeDrawers = () => {
    setShowLeft(false);
    setShowRight(false);
  };
  return (
    <div className="app-layout">
      {/* Backdrop for mobile */}
      {(showLeft || showRight) && <div className="mobile-backdrop" onClick={closeDrawers} />}

      <aside className={`layout-sidebar left ${showLeft ? 'open' : ''}`}>
        {leftSidebar}
      </aside>
      
      <main className="layout-main">
        {children}
      </main>
      
      <aside className={`layout-sidebar right ${showRight ? 'open' : ''}`}>
        {rightSidebar}
      </aside>

      <MobileDock 
        onToggleLeft={() => {
          setShowRight(false);
          setShowLeft(!showLeft);
        }}
        onToggleRight={() => {
          setShowLeft(false);
          setShowRight(!showRight);
        }}
        onGoHome={() => {
          onToday();
          closeDrawers();
        }}
      />
    </div>
  );
};

import React, { useState } from 'react';
import './Layout.css';
import { MobileDock } from './MobileDock';

interface LayoutProps {
  leftSidebar: React.ReactNode;
  children: React.ReactNode; // Center content
  rightSidebar: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ leftSidebar, children, rightSidebar }) => {
  const [showLeft, setShowLeft] = useState(false);
  const [showRight, setShowRight] = useState(false);

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
        onToggleLeft={() => setShowLeft(!showLeft)}
        onToggleRight={() => setShowRight(!showRight)}
        onGoHome={() => window.location.reload()} // Simple reload to "reset" to today or just close drawers
      />
    </div>
  );
};

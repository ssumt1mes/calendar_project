import React from 'react';
import './Layout.css';

interface LayoutProps {
  leftSidebar: React.ReactNode;
  children: React.ReactNode; // Center content
  rightSidebar: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ leftSidebar, children, rightSidebar }) => {
  return (
    <div className="app-layout">
      <aside className="layout-sidebar left">
        {leftSidebar}
      </aside>
      
      <main className="layout-main">
        {children}
      </main>
      
      <aside className="layout-sidebar right">
        {rightSidebar}
      </aside>
    </div>
  );
};

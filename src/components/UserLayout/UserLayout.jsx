import React from 'react';
import UserSidebar from '../UserSidebar/UserSidebar';
import './UserLayout.css';

export default function UserLayout({ children, sidebarOpen, onSidebarClose }) {
  return (
    <div className="user-layout">
      <UserSidebar isOpen={sidebarOpen} onClose={onSidebarClose} />
      <main className={`user-content ${sidebarOpen ? 'user-sidebar-is-open' : ''}`}>
        {children}
      </main>
    </div>
  );
}
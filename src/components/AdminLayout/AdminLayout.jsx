import React from 'react';
import AdminSidebar from '../AdminSidebar/AdminSidebar';
import './AdminLayout.css';

export default function AdminLayout({ children, sidebarOpen, onSidebarClose }) {
  return (
    <div className="admin-layout">
      {/* Pass the function directly */}
      <AdminSidebar isOpen={sidebarOpen} onClose={onSidebarClose} />
      <main className={`admin-content ${sidebarOpen ? 'sidebar-is-open' : ''}`}>
        {children}
      </main>
    </div>
  );
}
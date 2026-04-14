import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../features/auth/authSlice';
import { useToast } from '../../hooks/useToast';
import { ADMIN_PAGES } from './sidebarConfig';
import './AdminSidebar.css';

function groupPages(pages) {
  return pages.reduce((acc, page) => {
    if (!acc[page.group]) acc[page.group] = [];
    acc[page.group].push(page);
    return acc;
  }, {});
}

export default function AdminSidebar({ isOpen, onClose }) {
  const location      = useLocation();
  const navigate      = useNavigate();
  const dispatch      = useDispatch();
  const { showToast } = useToast();
  const { user }      = useSelector((state) => state.auth);
  // Desktop collapse state (independent of mobile open/close)
  const [collapsed, setCollapsed] = useState(false);

  const grouped  = groupPages(ADMIN_PAGES);
  const isActive = (href) => location.pathname === href;

  const handleLogout = () => {
    dispatch(logout());
    showToast('Logged out successfully');
    navigate('/');
    onClose?.();
  };

  const handleNavClick = () => {
    // On mobile, close sidebar after navigation
    onClose?.();
  };

  const initials = user?.fullName
    ? user.fullName.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'A';

  return (
    <aside className={`admin-sidebar ${collapsed ? 'sidebar-collapsed' : ''} ${isOpen ? 'sidebar-mobile-open' : ''}`}>

      {/* ── Header ── */}
      <div className="sidebar-header">
        <div className="sidebar-brand">
          {!collapsed && (
            <div className="sidebar-panel-label">
              <span>Admin Panel</span>
              <small>Manage your platform</small>
            </div>
          )}
          {/* Desktop collapse toggle */}
          <button
            className="sidebar-toggle d-none d-lg-flex"
            onClick={() => setCollapsed(!collapsed)}
            title={collapsed ? 'Expand' : 'Collapse'}
          >
            <i className={`fa-solid ${collapsed ? 'fa-chevron-right' : 'fa-chevron-left'}`}></i>
          </button>
          {/* Mobile close button */}
          <button
            className="sidebar-toggle d-lg-none"
            onClick={onClose}
            title="Close sidebar"
          >
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>
      </div>

      {/* ── Nav ── */}
      <nav className="sidebar-nav">
        {Object.entries(grouped).map(([group, pages]) => (
          <div className="sidebar-group" key={group}>
            {!collapsed && (
              <span className="sidebar-group-label">{group}</span>
            )}
            {pages.map((page) => (
              <Link
                key={page.id}
                to={page.href}
                className={`sidebar-item ${isActive(page.href) ? 'sidebar-item--active' : ''}`}
                title={collapsed ? page.label : undefined}
                onClick={handleNavClick}
              >
                <i className={`fa-solid ${page.icon} sidebar-item-icon`}></i>
                {!collapsed && <span className="sidebar-item-label">{page.label}</span>}
                {isActive(page.href) && <span className="sidebar-active-bar"></span>}
              </Link>
            ))}
          </div>
        ))}
      </nav>

      {/* ── Footer ── */}
      <div className="sidebar-footer">
        {!collapsed && (
          <div className="sidebar-user-mini">
            <div className="sidebar-avatar">{initials}</div>
            <div className="sidebar-user-info">
              <span className="sidebar-user-name">{user?.fullName?.split(' ')[0] || 'Admin'}</span>
              <span className="sidebar-user-role">{user?.role || 'ADMIN'}</span>
            </div>
          </div>
        )}
        <button className="sidebar-logout" onClick={handleLogout} title="Logout">
          <i className="fa-solid fa-right-from-bracket"></i>
          {!collapsed && <span>Logout</span>}
        </button>
      </div>

    </aside>
  );
}
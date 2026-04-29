import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../features/auth/slice/authSlice';
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
  const [collapsed, setCollapsed] = useState(false);

  const grouped  = groupPages(ADMIN_PAGES);
  const isActive = (href) => location.pathname === href;

  const handleLogout = () => {
    dispatch(logout());
    showToast('Logged out successfully');
    navigate('/');
    onClose?.(false);
  };

  const handleNavClick = () => {
    if (window.innerWidth <= 992) onClose?.(false);
  };

  const initials = user?.fullName
    ? user.fullName.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'A';

  return (
    <>
    {/* mobile sidebar puller */}
      {!isOpen && (
        <button 
          className="mobile-pull-handle d-lg-none" 
          onClick={() => onClose(true)} 
          aria-label="Open Sidebar"
        >
          <i className="fa-solid fa-chevron-right"></i>
        </button>
      )}

      <aside className={`admin-sidebar ${collapsed ? 'sidebar-collapsed' : ''} ${isOpen ? 'sidebar-mobile-open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-brand">
            {!collapsed && (
              <div className="sidebar-panel-label">
                <span>Admin Panel</span>
                <small>Manage your platform</small>
              </div>
            )}


            <button
              className="sidebar-toggle d-lg-none"
              onClick={() => onClose(false)}
            >
              <i className="fa-solid fa-chevron-left"></i>
            </button>
          </div>
        </div>

        <nav className="sidebar-nav">
          {Object.entries(grouped).map(([group, pages]) => (
            <div className="sidebar-group" key={group}>
              {!collapsed && <span className="sidebar-group-label">{group}</span>}
              {pages.map((page) => (
                <Link
                  key={page.id}
                  to={page.href}
                  className={`sidebar-item ${isActive(page.href) ? 'sidebar-item--active' : ''}`}
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
          <button className="sidebar-logout" onClick={handleLogout}>
            <i className="fa-solid fa-right-from-bracket"></i>
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
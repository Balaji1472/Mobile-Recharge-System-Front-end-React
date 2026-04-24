import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../features/auth/slice/authSlice';
import { useToast } from '../../hooks/useToast';
import { USER_PAGES } from './userSidebarConfig';
import './UserSidebar.css';

function groupPages(pages) {
  return pages.reduce((acc, page) => {
    if (!acc[page.group]) acc[page.group] = [];
    acc[page.group].push(page);
    return acc;
  }, {});
}

export default function UserSidebar({ isOpen, onClose }) {
  const location      = useLocation();
  const navigate      = useNavigate();
  const dispatch      = useDispatch();
  const { showToast } = useToast();
  const { user }      = useSelector((state) => state.auth);

  const grouped  = groupPages(USER_PAGES);
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
    : 'U';

  return (
    <>
      {/* ── Mobile Pull Handle ── */}
      {!isOpen && (
        <button
          className="user-pull-handle d-lg-none"
          onClick={() => onClose(true)}
          aria-label="Open Sidebar"
        >
          <i className="fa-solid fa-chevron-right"></i>
        </button>
      )}

      <aside className={`user-sidebar ${isOpen ? 'user-sidebar-mobile-open' : ''}`}>

        {/* Header */}
        <div className="user-sidebar-header">
          <div className="user-sidebar-brand">
            <div className="user-sidebar-panel-label">
              <span>My Account</span>
              <small>Manage your profile</small>
            </div>
            <button
              className="user-sidebar-toggle d-lg-none"
              onClick={() => onClose(false)}
            >
              <i className="fa-solid fa-chevron-left"></i>
            </button>
          </div>
        </div>

        {/* Nav */}
        <nav className="user-sidebar-nav">
          {Object.entries(grouped).map(([group, pages]) => (
            <div className="user-sidebar-group" key={group}>
              <span className="user-sidebar-group-label">{group}</span>
              {pages.map((page) => (
                <Link
                  key={page.id}
                  to={page.href}
                  className={`user-sidebar-item ${isActive(page.href) ? 'user-sidebar-item--active' : ''}`}
                  onClick={handleNavClick}
                >
                  <i className={`fa-solid ${page.icon} user-sidebar-item-icon`}></i>
                  <span className="user-sidebar-item-label">{page.label}</span>
                  {isActive(page.href) && <span className="user-sidebar-active-bar"></span>}
                </Link>
              ))}
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="user-sidebar-footer">
          <div className="user-sidebar-user-mini">
            <div className="user-sidebar-avatar">{initials}</div>
            <div className="user-sidebar-user-info">
              <span className="user-sidebar-user-name">
                {user?.fullName?.split(' ')[0] || 'User'}
              </span>
              <span className="user-sidebar-user-role">
                {user?.role || 'USER'}
              </span>
            </div>
          </div>
          <button className="user-sidebar-logout" onClick={handleLogout}>
            <i className="fa-solid fa-right-from-bracket"></i>
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}
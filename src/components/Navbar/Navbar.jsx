import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../features/auth/authSlice';
import { useToast } from '../../hooks/useToast';
import './Navbar.css';

export default function Navbar() {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const { showToast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const isAdmin = user?.role === 'ADMIN';

  const isActive = (path) =>
    location.pathname === path ? 'nav-link header-nav-link active-link' : 'nav-link header-nav-link';

  const handleLogout = () => {
    dispatch(logout());
    showToast('Logged out successfully');
    navigate('/');
    setMenuOpen(false);
    setDropdownOpen(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const initials = user?.fullName
    ? user.fullName.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  return (
    <header className="site-header">
      <nav className="navbar navbar-expand-lg navbar-light bg-white" id="mainNavbar-wrapper">
        <div className="container-fluid px-4 px-lg-5">

          <Link to="/" className="logo-wrap navbar-brand" onClick={() => setMenuOpen(false)}>
            <span style={{ fontSize: '1.7rem', fontWeight: 800, color: '#1a1a1a' }}>
              Re<span style={{ color: '#f05a5a' }}>Up</span>
            </span>
          </Link>

          <button
            className="navbar-toggler border-0 shadow-none"
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle navigation"
          >
            <i className={`fa-solid ${menuOpen ? 'fa-xmark' : 'fa-bars'} nav-toggle-icon`}></i>
          </button>

          <div className={`collapse navbar-collapse ${menuOpen ? 'show' : ''}`} id="mainNavbar">
            <ul className="navbar-nav ms-auto mb-2 mb-lg-0">
              <li className="nav-item">
                <Link to="/" className={isActive('/')} onClick={() => setMenuOpen(false)}>Home</Link>
              </li>
              <li className="nav-item">
                <Link to="/recharge" className={isActive('/recharge')} onClick={() => setMenuOpen(false)}>Recharge</Link>
              </li>
              <li className="nav-item">
                <Link to="/offers" className={isActive('/offers')} onClick={() => setMenuOpen(false)}>Offers</Link>
              </li>
              <li className="nav-item">
                <Link to="/about" className={isActive('/about')} onClick={() => setMenuOpen(false)}>About</Link>
              </li>
              <li className="nav-item">
                <Link to="/contact" className={isActive('/contact')} onClick={() => setMenuOpen(false)}>Contact</Link>
              </li>
            </ul>

            <div className="header-auth d-flex align-items-center gap-2 mt-3 mt-lg-0 ms-lg-3">
              {user ? (
                /* ── Profile dropdown ── */
                <div className="nav-profile-wrap" ref={dropdownRef}>
                  <button
                    className="nav-profile-btn"
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    aria-label="Profile menu"
                  >
                    <div className="user-avatar">
                      <i className="fa-solid fa-user"></i>
                    </div>
                    {isAdmin && (
                      <span className="nav-profile-name d-none d-lg-inline">Admin</span>
                    )}
                    <i className={`fa-solid fa-chevron-down nav-chevron ${dropdownOpen ? 'open' : ''}`}></i>
                  </button>

                  {dropdownOpen && (
                    <div className="nav-dropdown">
                      {isAdmin ? (
                        <Link
                          to="/admin/profile"
                          className="nav-dropdown-item"
                          onClick={() => { setDropdownOpen(false); setMenuOpen(false); }}
                        >
                          <i className="fa-solid fa-user-shield"></i>
                          Admin Panel
                        </Link>
                      ) : (
                        <Link
                          to="/profile"
                          className="nav-dropdown-item"
                          onClick={() => { setDropdownOpen(false); setMenuOpen(false); }}
                        >
                          <i className="fa-solid fa-user"></i>
                          View Profile
                        </Link>
                      )}
                      <button className="nav-dropdown-item nav-dropdown-logout" onClick={handleLogout}>
                        <i className="fa-solid fa-right-from-bracket"></i>
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <Link to="/login" onClick={() => setMenuOpen(false)}>
                    <button className="btn-auth btn-login">Login</button>
                  </Link>
                  <Link to="/register" onClick={() => setMenuOpen(false)}>
                    <button className="btn-auth btn-register">Register</button>
                  </Link>
                </>
              )}
            </div>
          </div>

        </div>
      </nav>
    </header>
  );
}
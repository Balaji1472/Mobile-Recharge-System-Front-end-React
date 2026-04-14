import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../features/auth/authSlice'; 
import { useToast } from '../hooks/useToast';
import './ProfilePage.css';

export default function ProfilePage() {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const initials = user?.fullName
    ? user.fullName.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  const handleLogout = () => {
    dispatch(logout()); 
    showToast('Logged out successfully');
    navigate('/');
  };

  if (!user) {
    navigate('/login');
    return null;
  }

  return (
    <div style={{ background: 'var(--pink-bg)', minHeight: '80vh', paddingTop: '60px', paddingBottom: '60px' }}>
      <div className="container d-flex justify-content-center">
        <div className="profile-card">

          <div className="profile-avatar-lg">{initials}</div>

          <h2 className="profile-name">
            Welcome, {user.fullName?.split(' ')[0]}!
          </h2>
          <p style={{ color: '#999', fontSize: '0.9rem', marginBottom: '8px' }}>
            You are successfully logged in.
          </p>
          <span className="profile-role">
            <i className="fa-solid fa-user me-1"></i>
            {user.role || 'USER'}
          </span>

          <hr className="profile-divider" />

          <div>
            <div className="profile-info-row">
              <span className="profile-info-label">
                <i className="fa-solid fa-user me-2" style={{ color: '#f05a5a' }}></i>
                Full Name
              </span>
              <span className="profile-info-value">{user.fullName || '—'}</span>
            </div>
            <div className="profile-info-row">
              <span className="profile-info-label">
                <i className="fa-solid fa-envelope me-2" style={{ color: '#f05a5a' }}></i>
                Email
              </span>
              <span className="profile-info-value">{user.email || '—'}</span>
            </div>
            <div className="profile-info-row">
              <span className="profile-info-label">
                <i className="fa-solid fa-phone me-2" style={{ color: '#f05a5a' }}></i>
                Phone
              </span>
              <span className="profile-info-value">{user.mobileNumber || '—'}</span>
            </div>
          </div>

          <hr className="profile-divider" style={{ marginTop: '16px' }} />

          <button
            className="btn-submit mt-0"
            onClick={handleLogout}
            style={{ marginTop: '0' }}
          >
            <i className="fa-solid fa-right-from-bracket me-2"></i>
            Logout
          </button>

        </div>
      </div>
    </div>
  );
}
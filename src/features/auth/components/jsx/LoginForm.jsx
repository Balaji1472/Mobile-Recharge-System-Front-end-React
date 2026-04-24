import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { login, fetchProfile } from '../../slice/authSlice';
import AuthOperatorCarousel from './AuthOperatorCarousel';
import ForgotPasswordModal from './ForgotPasswordModal';
import '../css/Auth.css';

function validate(email, password) {
  const errs = {};
  if (!email.trim()) {
    errs.email = 'Email is required';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    errs.email = 'Enter a valid email address';
  }
  if (!password) {
    errs.password = 'Password is required';
  }
  return errs;
}

export default function LoginForm() {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors]     = useState({});
  const [apiError, setApiError] = useState('');
  const [loading, setLoading]   = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);

  const btnRef   = useRef(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const shakeBtn = () => {
    btnRef.current?.classList.add('btn-shake');
    setTimeout(() => btnRef.current?.classList.remove('btn-shake'), 500);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');

    const errs = validate(email, password);
    setErrors(errs);
    if (Object.keys(errs).length > 0) { shakeBtn(); return; }

    setLoading(true);
    try {
      await dispatch(login({ email: email.trim().toLowerCase(), password })).unwrap();
      const profileData = await dispatch(fetchProfile()).unwrap();
      if (profileData?.role === 'ADMIN') {
        navigate('/admin/profile');
      } else {
        navigate('/user/profile');
      }
    } catch (err) {
      setApiError(err?.message || 'Login failed. Please try again.');
      shakeBtn();
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-wrapper">
      <div className="side-promo-tag">Zero Platform Fee</div>

      <div className="container">
        <div className="row align-items-center g-4" style={{ minHeight: '75vh' }}>

          <div className="col-lg-6">
            <AuthOperatorCarousel />
          </div>

          <div className="col-lg-5 offset-lg-1">
            <div className="auth-card">
              <h2 className="card-title">
                Login to Re <span>Up</span>
              </h2>

              <form onSubmit={handleSubmit} noValidate>
                <div className="input-box">
                  <label htmlFor="loginEmail">Email</label>
                  <input
                    id="loginEmail"
                    type="email"
                    className={`form-control-custom ${errors.email ? 'input-error' : ''}`}
                    placeholder="Enter your Email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setErrors((p) => ({ ...p, email: '' }));
                      setApiError('');
                    }}
                  />
                  <small className="field-error">{errors.email || ''}</small>
                </div>

                <div className="input-box">
                  <label htmlFor="loginPassword">Password</label>
                  <input
                    id="loginPassword"
                    type="password"
                    className={`form-control-custom ${errors.password ? 'input-error' : ''}`}
                    placeholder="Enter your Password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setErrors((p) => ({ ...p, password: '' }));
                      setApiError('');
                    }}
                  />
                  <small className="field-error">{errors.password || ''}</small>
                </div>

                {/* Forgot Password trigger */}
                <div className="text-start mb-4">
                  <span
                    className="forgot-link"
                    style={{ cursor: 'pointer' }}
                    onClick={() => setShowForgotModal(true)}
                  >
                    forgot password
                  </span>
                </div>

                {apiError && (
                  <span className="api-error-msg">
                    <i className="fa-solid fa-circle-xmark me-1"></i>
                    {apiError}
                  </span>
                )}

                <button
                  ref={btnRef}
                  type="submit"
                  className="btn-submit"
                  disabled={loading}
                >
                  {loading ? (
                    <><i className="fa-solid fa-spinner fa-spin me-2"></i>Logging in...</>
                  ) : (
                    'Login'
                  )}
                </button>

                <p className="switch-auth">
                  Don't have an account? – <Link to="/register">Register</Link>
                </p>
              </form>
            </div>
          </div>

        </div>
      </div>

      {/* Forgot Password Modal — rendered outside the form to avoid nesting issues */}
      {showForgotModal && (
        <ForgotPasswordModal onClose={() => setShowForgotModal(false)} />
      )}
    </main>
  );
}

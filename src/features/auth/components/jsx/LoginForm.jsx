import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { login, fetchProfile } from '../../slice/authSlice';
import { useToast } from '../../../../hooks/useToast';   // ← for API error toasts
import AuthOperatorCarousel from './AuthOperatorCarousel';
import ForgotPasswordModal from './ForgotPasswordModal';
import '../css/Auth.css';

/* ── Field-level validators (reused for both onBlur and onSubmit) ── */
function validateEmail(email) {
  if (!email.trim()) return 'Email is required';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return 'Enter a valid email address';
  return '';
}

function validatePassword(password) {
  if (!password) return 'Password is required';
  return '';
}

function validateAll(email, password) {
  const errs = {};
  const emailErr    = validateEmail(email);
  const passwordErr = validatePassword(password);
  if (emailErr)    errs.email    = emailErr;
  if (passwordErr) errs.password = passwordErr;
  return errs;
}

export default function LoginForm() {
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [errors,   setErrors]   = useState({});
  const [loading,  setLoading]  = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);

  // apiError state removed — backend messages now go through toast
  const { toast }  = useToast();
  const btnRef     = useRef(null);
  const dispatch   = useDispatch();
  const navigate   = useNavigate();

  const shakeBtn = () => {
    btnRef.current?.classList.add('btn-shake');
    setTimeout(() => btnRef.current?.classList.remove('btn-shake'), 500);
  };

  /* ── onBlur handlers — validate a single field when user leaves it ── */
  const handleEmailBlur = () => {
    const err = validateEmail(email);
    setErrors((prev) => ({ ...prev, email: err }));
  };

  const handlePasswordBlur = () => {
    const err = validatePassword(password);
    setErrors((prev) => ({ ...prev, password: err }));
  };

  /* ── Submit ── */
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Run full validation on submit
    const errs = validateAll(email, password);
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
      // Backend error — show as toast instead of inline message
      toast(err?.message || 'Login failed. Please try again.', 'error');
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

                {/* Email */}
                <div className="input-box">
                  <label htmlFor="loginEmail">
                    Email <span style={{ color: 'red' }}>*</span>
                  </label>
                  <input
                    id="loginEmail"
                    type="email"
                    className={`form-control-custom ${errors.email ? 'input-error' : ''}`}
                    placeholder="Enter your Email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      // Clear error while typing once they start correcting
                      if (errors.email) setErrors((p) => ({ ...p, email: '' }));
                    }}
                    onBlur={handleEmailBlur}   // ← validate immediately on focus-out
                  />
                  <small className="field-error">{errors.email || ''}</small>
                </div>

                {/* Password */}
                <div className="input-box">
                  <label htmlFor="loginPassword">
                    Password <span style={{ color: 'red' }}>*</span>
                  </label>
                  <input
                    id="loginPassword"
                    type="password"
                    className={`form-control-custom ${errors.password ? 'input-error' : ''}`}
                    placeholder="Enter your Password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (errors.password) setErrors((p) => ({ ...p, password: '' }));
                    }}
                    onBlur={handlePasswordBlur}  // ← validate immediately on focus-out
                  />
                  <small className="field-error">{errors.password || ''}</small>
                </div>

                {/* Forgot Password */}
                <div className="text-start mb-4">
                  <span
                    className="forgot-link"
                    style={{ cursor: 'pointer' }}
                    onClick={() => setShowForgotModal(true)}
                  >
                    forgot password
                  </span>
                </div>

                {/* apiError inline block removed — now shows as toast */}

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

      {showForgotModal && (
        <ForgotPasswordModal onClose={() => setShowForgotModal(false)} />
      )}
    </main>
  );
}
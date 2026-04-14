import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { register } from '../../features/auth/authSlice'; 
import AuthOperatorCarousel from './AuthOperatorCarousel';
import './Auth.css';

function validate(fields) {
  const { fullName, mobile, email, gender, password, confirmPassword, terms } = fields;
  const errs = {};

  if (!fullName.trim()) {
    errs.fullName = 'Full name is required';
  } else if (fullName.trim().length < 3) {
    errs.fullName = 'Name must be at least 3 characters';
  }

  if (!mobile.trim()) {
    errs.mobile = 'Mobile number is required';
  } else if (!/^\d{10}$/.test(mobile.trim())) {
    errs.mobile = 'Enter a valid 10-digit mobile number';
  }

  if (!email.trim()) {
    errs.email = 'Email is required';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    errs.email = 'Enter a valid email address';
  }

  if (!gender) {
    errs.gender = 'Please select your gender';
  }

  if (!password) {
    errs.password = 'Password is required';
  } else if (password.length < 8) {
    errs.password = 'Password must be at least 8 characters';
  } else if (!/[A-Z]/.test(password)) {
    errs.password = 'Must contain at least one uppercase letter';
  } else if (!/\d/.test(password)) {
    errs.password = 'Must contain at least one number';
  }

  if (!confirmPassword) {
    errs.confirmPassword = 'Please confirm your password';
  } else if (password !== confirmPassword) {
    errs.confirmPassword = 'Passwords do not match';
  }

  if (!terms) {
    errs.terms = 'You must agree to the Terms & Conditions';
  }

  return errs;
}

export default function RegisterForm() {
  const [fields, setFields] = useState({
    fullName: '',
    mobile: '',
    email: '',
    gender: '',
    password: '',
    confirmPassword: '',
    terms: false,
  });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const btnRef = useRef(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const set = (key) => (e) => {
    const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFields((p) => ({ ...p, [key]: val }));
    setErrors((p) => ({ ...p, [key]: '' }));
    setApiError('');
  };

  const shakeBtn = () => {
    btnRef.current?.classList.add('btn-shake');
    setTimeout(() => btnRef.current?.classList.remove('btn-shake'), 500);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');
    setSuccessMsg('');

    const errs = validate(fields);
    setErrors(errs);

    if (Object.keys(errs).length > 0) {
      shakeBtn();
      return;
    }

    setLoading(true);
    try {
      await dispatch(register({
        fullName: fields.fullName.trim(),
        mobileNumber: fields.mobile.trim(),
        email: fields.email.trim().toLowerCase(),
        gender: fields.gender,
        password: fields.password,
      })).unwrap();

      setSuccessMsg('Registration successful! Redirecting to login...');
      setTimeout(() => navigate('/login'), 1800);
    } catch (err) {
      setApiError(err?.message || 'Registration failed. Please try again.');
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
            <div style={{ marginTop: '-450px' }}></div>
            <AuthOperatorCarousel />
          </div>

          <div className="col-lg-5 offset-lg-1">
            <div className="auth-card">
              <h2 className="card-title">
                Register to Re <span>Up</span>
              </h2>

              <form onSubmit={handleSubmit} noValidate>
                <div className="input-box">
                  <label htmlFor="regName">Full Name</label>
                  <input
                    id="regName"
                    type="text"
                    className={`form-control-custom ${errors.fullName ? 'input-error' : ''}`}
                    placeholder="Enter your Name"
                    value={fields.fullName}
                    onChange={set('fullName')}
                  />
                  <small className="field-error">{errors.fullName || ''}</small>
                </div>

                <div className="input-box">
                  <label htmlFor="regMobile">Mobile Number</label>
                  <input
                    id="regMobile"
                    type="tel"
                    maxLength={10}
                    className={`form-control-custom ${errors.mobile ? 'input-error' : ''}`}
                    placeholder="Enter your Mobile Number"
                    value={fields.mobile}
                    onChange={(e) => {
                      setFields((p) => ({ ...p, mobile: e.target.value.replace(/\D/g, '') }));
                      setErrors((p) => ({ ...p, mobile: '' }));
                    }}
                  />
                  <small className="field-error">{errors.mobile || ''}</small>
                </div>

                <div className="input-box">
                  <label htmlFor="regEmail">Email</label>
                  <input
                    id="regEmail"
                    type="email"
                    className={`form-control-custom ${errors.email ? 'input-error' : ''}`}
                    placeholder="Enter your Email"
                    value={fields.email}
                    onChange={set('email')}
                  />
                  <small className="field-error">{errors.email || ''}</small>
                </div>

                <div className="input-box">
                  <label htmlFor="regGender">Gender</label>
                  <select
                    id="regGender"
                    className={`form-control-custom ${errors.gender ? 'input-error' : ''}`}
                    value={fields.gender}
                    onChange={set('gender')}
                    style={{ cursor: 'pointer' }}
                  >
                    <option value="">Select Gender</option>
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                    <option value="OTHER">Other</option>
                  </select>
                  <small className="field-error">{errors.gender || ''}</small>
                </div>

                <div className="input-box">
                  <label htmlFor="regPass">Password</label>
                  <input
                    id="regPass"
                    type="password"
                    className={`form-control-custom ${errors.password ? 'input-error' : ''}`}
                    placeholder="Enter your Password"
                    value={fields.password}
                    onChange={set('password')}
                  />
                  <small className="field-error">{errors.password || ''}</small>
                </div>

                <div className="input-box">
                  <label htmlFor="regConfirmPass">Confirm Password</label>
                  <input
                    id="regConfirmPass"
                    type="password"
                    className={`form-control-custom ${errors.confirmPassword ? 'input-error' : ''}`}
                    placeholder="Re-enter your Password"
                    value={fields.confirmPassword}
                    onChange={set('confirmPassword')}
                  />
                  <small className="field-error">{errors.confirmPassword || ''}</small>
                </div>

                <div className="mb-3 text-start">
                  <div className="d-flex align-items-center gap-2">
                    <input
                      type="checkbox"
                      id="terms"
                      checked={fields.terms}
                      onChange={set('terms')}
                      style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: '#f05a5a' }}
                    />
                    <label htmlFor="terms" style={{ fontSize: '0.85rem', cursor: 'pointer', marginBottom: 0 }}>
                      I agree to the{' '}
                      <a href="#terms" style={{ color: '#f05a5a', fontWeight: 600 }}>
                        Terms &amp; Conditions
                      </a>
                    </label>
                  </div>
                  <small className="field-error">{errors.terms || ''}</small>
                </div>

                {successMsg && (
                  <span className="success-msg">
                    <i className="fa-solid fa-circle-check me-1"></i>
                    {successMsg}
                  </span>
                )}
                {apiError && (
                  <span className="api-error-msg">
                    <i className="fa-solid fa-circle-xmark me-1"></i>
                    {apiError}
                  </span>
                )}

                <button ref={btnRef} type="submit" className="btn-submit" disabled={loading}>
                  {loading ? (
                    <><i className="fa-solid fa-spinner fa-spin me-2"></i>Registering...</>
                  ) : 'Register'}
                </button>

                <p className="switch-auth">
                  Already have an account? – <Link to="/login">Login</Link>
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux'; 
import { submitPasswordChange, reset } from '../slice/changePasswordSlice';
import { useToast } from '../../../../hooks/useToast';
import '../css/ChangePasswordPage.css';

const EMPTY = { current: '', newPass: '', confirm: '' };

export default function ChangePasswordPage() {
  const { toast } = useToast();
  const dispatch = useDispatch();

  // Pulling state from Redux
  const { isLoading, isSuccess, isError, message } = useSelector(
    (state) => state.changePassword
  );

  const [form, setForm]         = useState(EMPTY);
  const [errors, setErrors]     = useState({});
  const [show, setShow]         = useState({ current: false, newPass: false, confirm: false });

  // Handle Success and Error side effects via Redux state
  useEffect(() => {
    if (isSuccess) {
      toast('Password updated successfully!', 'success');
      setForm(EMPTY);
      setErrors({});
      dispatch(reset()); // Reset state after successful notification
    }
    if (isError && message) {
      toast(message, 'error');
      dispatch(reset()); // Reset state to prevent repeated toasts on re-renders
    }
  }, [isSuccess, isError, message, toast, dispatch]);

  const set = (field) => (e) => {
    setForm((f) => ({ ...f, [field]: e.target.value }));
    setErrors((er) => ({ ...er, [field]: undefined }));
  };

  const toggleShow = (field) =>
    setShow((s) => ({ ...s, [field]: !s[field] }));

  const validate = () => {
    const err = {};
    if (!form.current.trim())
      err.current = 'Current password is required';
    if (!form.newPass || form.newPass.length < 6)
      err.newPass = 'New password must be at least 6 characters';
    if (!form.confirm)
      err.confirm = 'Please confirm your new password';
    else if (form.newPass !== form.confirm)
      err.confirm = 'Passwords do not match';
    if (form.current && form.newPass && form.current === form.newPass)
      err.newPass = 'New password must be different from current password';
    return err;
  };

  const handleSubmit = () => {
    const err = validate();
    if (Object.keys(err).length) { 
      setErrors(err); 
      return; 
    }

    // Dispatching the thunk instead of direct API call
    dispatch(submitPasswordChange({
      currentPassword: form.current,
      newPassword:     form.newPass,
      confirmPassword: form.confirm,
    }));
  };

  return (
    <div className="cp-pw-page">

      <div className="cp-pw-header">
        <h1 className="cp-pw-title">Change Password</h1>
        <p className="cp-pw-subtitle">Update your account password securely</p>
      </div>

      <div className="cp-pw-card">

        {/* Current Password */}
        <div className="cp-pw-field">
          <label className="cp-pw-label">CURRENT PASSWORD</label>
          <div className={`cp-pw-input-wrap ${errors.current ? 'error' : ''}`}>
            <input
              type={show.current ? 'text' : 'password'}
              className="cp-pw-input"
              placeholder="Enter current password"
              value={form.current}
              onChange={set('current')}
            />
            <button
              type="button"
              className="cp-pw-eye"
              onClick={() => toggleShow('current')}
              tabIndex={-1}
            >
              <i className={`fa-solid ${show.current ? 'fa-eye-slash' : 'fa-eye'}`} />
            </button>
          </div>
          {errors.current && <span className="cp-pw-error">{errors.current}</span>}
        </div>

        {/* New Password */}
        <div className="cp-pw-field">
          <label className="cp-pw-label">NEW PASSWORD</label>
          <div className={`cp-pw-input-wrap ${errors.newPass ? 'error' : ''}`}>
            <input
              type={show.newPass ? 'text' : 'password'}
              className="cp-pw-input"
              placeholder="Enter new password (min. 6 chars)"
              value={form.newPass}
              onChange={set('newPass')}
            />
            <button
              type="button"
              className="cp-pw-eye"
              onClick={() => toggleShow('newPass')}
              tabIndex={-1}
            >
              <i className={`fa-solid ${show.newPass ? 'fa-eye-slash' : 'fa-eye'}`} />
            </button>
          </div>
          {errors.newPass && <span className="cp-pw-error">{errors.newPass}</span>}
        </div>

        {/* Confirm Password */}
        <div className="cp-pw-field">
          <label className="cp-pw-label">CONFIRM NEW PASSWORD</label>
          <div className={`cp-pw-input-wrap ${errors.confirm ? 'error' : ''}`}>
            <input
              type={show.confirm ? 'text' : 'password'}
              className="cp-pw-input"
              placeholder="Re-enter new password"
              value={form.confirm}
              onChange={set('confirm')}
            />
            <button
              type="button"
              className="cp-pw-eye"
              onClick={() => toggleShow('confirm')}
              tabIndex={-1}
            >
              <i className={`fa-solid ${show.confirm ? 'fa-eye-slash' : 'fa-eye'}`} />
            </button>
          </div>
          {errors.confirm && <span className="cp-pw-error">{errors.confirm}</span>}
        </div>

        {/* Submit */}
        <button
          className="cp-pw-submit"
          onClick={handleSubmit}
          disabled={isLoading}
        >
          {isLoading
            ? <><i className="fa-solid fa-spinner fa-spin" /> Updating…</>
            : 'Update Password'}
        </button>
      </div>
    </div>
  );
}
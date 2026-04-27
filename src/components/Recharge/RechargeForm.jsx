import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Input } from '../common';
import {
  lookupPlans,
  setMobileNumber,
  selectPlansLoading,
  selectPlansError,
} from '../../features/user/recharge/slice/rechargeSlice';
import './RechargeForm.css';

const MOBILE_REGEX = /^[6-9]\d{9}$/;
 
function validate(mobile) {
  if (!mobile.trim())               return 'Mobile number is required';
  if (!/^\d{10}$/.test(mobile))     return 'Enter a valid 10-digit mobile number';
  if (!MOBILE_REGEX.test(mobile))   return 'Enter a valid Indian mobile number starting with 6-9';
  return '';
}
 
export default function RechargeForm() {
  const dispatch  = useDispatch();
  const loading   = useSelector(selectPlansLoading);
  const apiError  = useSelector(selectPlansError);
 
  const [mobile, setMobile] = useState('');
  const [error, setError]   = useState('');
 
  const isValid = MOBILE_REGEX.test(mobile);
 
  const handleChange = (e) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 10);
    setMobile(val);
    if (error) setError('');
  };
 
  const handleSubmit = (e) => {
    e.preventDefault();
    const err = validate(mobile);
    if (err) { setError(err); return; }
 
    dispatch(setMobileNumber(mobile));
    dispatch(lookupPlans(mobile));
  };
 
  return (
    <section className="recharge-form-area">
      <div className="form-container">
        <h3>Mobile Recharge</h3>
        <p className="sub-text">Recharge your number for validity, talktime or data</p>
 
        <div className="rf-card">
          <form onSubmit={handleSubmit} noValidate>
            <div className="recharge-input-wrap">
              <Input
                id="mobileInput"
                label="Mobile Number"
                type="tel"
                inputMode="numeric"
                placeholder="Enter your 10-digit mobile number"
                value={mobile}
                onChange={handleChange}
                error={error}
                maxLength={10}
                required
              />
            </div>
 
            {/* API error */}
            {apiError && (
              <p className="rf-api-error">
                <i className="bi bi-x-circle-fill" /> {apiError}
              </p>
            )}
 
            {/* Submit button — only enabled when number is valid */}
            <button
              type="submit"
              className="rf-submit-btn"
              disabled={!isValid || loading}
            >
              {loading ? (
                <>
                  <span className="rf-spinner" />
                  Checking...
                </>
              ) : (
                <>
                  Proceed to Recharge
                  <i className="bi bi-arrow-right" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}

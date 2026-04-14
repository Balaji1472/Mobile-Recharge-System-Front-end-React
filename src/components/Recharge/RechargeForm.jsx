import React, { useState } from 'react';
import { Input } from '../common';
import './RechargeForm.css';

function validate(mobile) {
  if (!mobile.trim())           return 'Mobile number is required';
  if (!/^\d{10}$/.test(mobile)) return 'Enter a valid 10-digit mobile number';
  return '';
}

export default function RechargeForm() {
  const [mobile, setMobile] = useState('');
  const [error, setError]   = useState('');

  const handleChange = (e) => {
    const val = e.target.value.replace(/\D/g, '');
    setMobile(val);
    if (error) setError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const err = validate(mobile);
    if (err) { setError(err); return; 
      
    }
  };

  return (
    <section className="recharge-form-area">
      <div className="form-container">
        <h3>Mobile Recharge</h3>
        <p className="sub-text">Recharge your number for validity, talktime or data</p>

        <form onSubmit={handleSubmit} noValidate>
          <div className="recharge-input-wrap">
            <Input
              id="mobileInput"
              label="Mobile Number"
              type="tel"
              placeholder="Enter your 10-digit mobile number"
              value={mobile}
              onChange={handleChange}
              error={error}
              required
            />
          </div>
        </form>
      </div>
    </section>
  );
}


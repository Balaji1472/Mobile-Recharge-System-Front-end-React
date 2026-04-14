import React, { useState, useEffect, useRef } from 'react';
import airtelLogo from '../../assets/operators/airtel-logo.webp';
import jioLogo from '../../assets/operators/jio-logo.webp';
import viLogo from '../../assets/operators/VI-logo.webp';
import bsnlLogo from '../../assets/operators/Bsnl-logo.webp';
import './HeroSection.css';

const OPERATORS = [
  {
    id: 0,
    name: 'Airtel',
    tagline: "India's Most Trusted Network",
    desc: 'Stay connected with blazing-fast 5G speeds and unlimited calling across India.',
    color: '#e41b23',
    logo: airtelLogo,
  },
  {
    id: 1,
    name: 'Jio',
    tagline: 'True 5G, Everywhere',
    desc: "Experience unmatched data speeds and crystal-clear calling with Jio's 5G network.",
    color: '#005eb8',
    logo: jioLogo,
  },
  {
    id: 2,
    name: 'VI',
    tagline: 'Together for Tomorrow',
    desc: 'Vodafone Idea brings you reliable connectivity and exciting add-on benefits.',
    color: '#e2231a',
    logo: viLogo,
  },
  {
    id: 3,
    name: 'BSNL',
    tagline: 'Connecting Bharat',
    desc: 'Government-backed reliability with nationwide coverage even in remote areas.',
    color: '#1d7f3a',
    logo: bsnlLogo,
  },
];

function OperatorCarousel() {
  const [current, setCurrent] = useState(0);
  const intervalRef = useRef(null);

  const startAuto = () => {
    intervalRef.current = setInterval(() => {
      setCurrent((c) => (c + 1) % OPERATORS.length);
    }, 3000);
  };

  useEffect(() => {
    startAuto();
    return () => clearInterval(intervalRef.current);
  }, []);

  const goTo = (idx) => {
    clearInterval(intervalRef.current);
    setCurrent(idx);
    startAuto();
  };

  const prev = () => goTo((current - 1 + OPERATORS.length) % OPERATORS.length);
  const next = () => goTo((current + 1) % OPERATORS.length);

  const op = OPERATORS[current];

  return (
    <div>
      <div className="op-slide">
        <div className="op-content">
          <div className="op-title">{op.tagline}</div>
          <p className="op-desc">{op.desc}</p>
        </div>
        <img
          src={op.logo}
          alt={op.name}
          className="op-img"
          onError={(e) => { e.target.style.display = 'none'; }}
        />
      </div>

      <div className="op-controls">
        <button className="op-btn" onClick={prev} aria-label="Previous">
          <i className="fa-solid fa-chevron-left"></i>
        </button>
        <div className="op-dots-wrap">
          {OPERATORS.map((_, i) => (
            <button
              key={i}
              className={`op-dot ${i === current ? 'active' : ''}`}
              onClick={() => goTo(i)}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
        <button className="op-btn" onClick={next} aria-label="Next">
          <i className="fa-solid fa-chevron-right"></i>
        </button>
      </div>
    </div>
  );
}

function RechargeForm() {
  const [mobile, setMobile] = useState('');
  const [operator, setOperator] = useState('');
  const [errors, setErrors] = useState({});

  const validate = () => {
    const errs = {};
    if (!mobile.trim()) {
      errs.mobile = 'Mobile number is required';
    } else if (!/^\d{10}$/.test(mobile.trim())) {
      errs.mobile = 'Enter a valid 10-digit mobile number';
    }
    if (!operator) {
      errs.operator = 'Please select an operator';
    }
    return errs;
  };

  const handleProceed = () => {
    const errs = validate();
    setErrors(errs);
  };

  return (
    <div className="recharge-card">
      <p className="recharge-label">Quick Recharge</p>

      <div className="recharge-field">
        <input
          type="tel"
          maxLength={10}
          placeholder="Enter Mobile Number"
          value={mobile}
          onChange={(e) => {
            setMobile(e.target.value.replace(/\D/g, ''));
            setErrors((p) => ({ ...p, mobile: '' }));
          }}
        />
        {errors.mobile && <span className="field-error-sm">{errors.mobile}</span>}
      </div>

      <div className="recharge-field">
        <select
          value={operator}
          onChange={(e) => {
            setOperator(e.target.value);
            setErrors((p) => ({ ...p, operator: '' }));
          }}
        >
          <option value="">Select Operator</option>
          <option value="airtel">Airtel</option>
          <option value="jio">Jio</option>
          <option value="vi">VI (Vodafone Idea)</option>
          <option value="bsnl">BSNL</option>
        </select>
        {errors.operator && <span className="field-error-sm">{errors.operator}</span>}
      </div>

      <button className="btn-proceed" onClick={handleProceed}>
        Proceed &nbsp;<i className="fa-solid fa-arrow-right"></i>
      </button>
    </div>
  );
}

export default function HeroSection() {
  return (
    <section className="hero-section">
      <div className="hero-top">
        <div className="container">
          <OperatorCarousel />
        </div>
      </div>
      <div className="hero-bottom">
        <div className="container">
          <RechargeForm />
        </div>
      </div>
    </section>
  );
}

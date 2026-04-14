import React, { useState, useEffect, useRef } from 'react';
import airtelLogo from '../../assets/operators/airtel-logo.webp';
import jioLogo from '../../assets/operators/jio-logo.webp';
import viLogo from '../../assets/operators/VI-logo.webp';
import bsnlLogo from '../../assets/operators/Bsnl-logo.webp';
import './Auth.css';

const OPERATORS = [
  { name: 'Airtel', logo: airtelLogo },
  { name: 'Jio',   logo: jioLogo   },
  { name: 'VI',    logo: viLogo    },
  { name: 'BSNL',  logo: bsnlLogo  },
];

export default function AuthOperatorCarousel() {
  const [current, setCurrent] = useState(0);
  const timerRef = useRef(null);

  const startAuto = () => {
    timerRef.current = setInterval(() => {
      setCurrent((c) => (c + 1) % OPERATORS.length);
    }, 3000);
  };

  useEffect(() => {
    startAuto();
    return () => clearInterval(timerRef.current);
  }, []);

  const goTo = (i) => {
    clearInterval(timerRef.current);
    setCurrent(i);
    startAuto();
  };

  return (
    <div className="text-center">
      <img
        src={OPERATORS[current].logo}
        alt={OPERATORS[current].name}
        className="operator-logo"
        onError={(e) => (e.target.style.display = 'none')}
      />

      <div className="op-controls">
        <button
          className="ctrl-btn"
          onClick={() => goTo((current - 1 + OPERATORS.length) % OPERATORS.length)}
          style={{ background: 'none', border: 'none', fontSize: '2rem', cursor: 'pointer', color: '#444' }}
        >
          <i className="fa-regular fa-circle-left"></i>
        </button>
        <div className="op-indicators" style={{ display: 'flex', gap: '8px' }}>
          {OPERATORS.map((_, i) => (
            <span
              key={i}
              className={`op-dot ${i === current ? 'active' : ''}`}
              onClick={() => goTo(i)}
              style={{ cursor: 'pointer' }}
            />
          ))}
        </div>
        <button
          className="ctrl-btn"
          onClick={() => goTo((current + 1) % OPERATORS.length)}
          style={{ background: 'none', border: 'none', fontSize: '2rem', cursor: 'pointer', color: '#444' }}
        >
          <i className="fa-regular fa-circle-right"></i>
        </button>
      </div>

      <p className="op-caption">Our Prestigious Operators</p>
    </div>
  );
}

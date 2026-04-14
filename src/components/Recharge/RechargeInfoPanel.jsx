import React from 'react';
import './RechargeInfoPanel.css';

const benefits = [
  'Faster Recharges – anywhere, anytime',
  'Safe & Secure Payments – trusted gateways',
  'Instant Confirmation – no hidden charges',
  'Track History – transparency at your fingertips',
];

export default function RechargeInfoPanel() {
  return (
    <div className="sticky-info-panel">
      <div className="info-content">
        <h1>Recharge Online</h1>
        <ul className="benefit-list">
          {benefits.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

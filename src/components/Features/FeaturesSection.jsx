import React from 'react';
import './FeaturesSection.css';

const FEATURES = [
  {
    icon: 'fa-bolt',
    title: 'Instant Recharge',
    desc: 'Recharge processed in seconds. No delays, no waiting — your plan is active the moment you pay.',
  },
  {
    icon: 'fa-shield-halved',
    title: 'Safe & Secure',
    desc: 'Bank-grade encryption protects every transaction. Your money and data are always safe with us.',
  },
  {
    icon: 'fa-tags',
    title: 'Zero Platform Fee',
    desc: 'What you see is what you pay. No hidden charges, no convenience fees added at checkout.',
  },
  {
    icon: 'fa-headset',
    title: '24/7 Support',
    desc: "Round-the-clock customer support to resolve any issue, anytime. We've always got your back.",
  },
  {
    icon: 'fa-sim-card',
    title: 'All Operators',
    desc: 'Airtel, Jio, VI, BSNL — recharge any network from a single platform effortlessly.',
  },
  {
    icon: 'fa-rotate',
    title: 'Easy Refunds',
    desc: 'Failed recharge? Get an automatic refund within 24 hours, no questions asked.',
  },
];

export default function FeaturesSection() {
  return (
    <section className="features-section">
      <div className="container">
        <h2 className="sec-title">Why Choose ReUp?</h2>
        <div className="row g-4">
          {FEATURES.map((f, i) => (
            <div className="col-lg-4 col-md-6" key={i}>
              <div className="feature-card">
                <div className="feature-icon-box">
                  <i className={`fa-solid ${f.icon}`}></i>
                </div>
                <h3 className="feature-title">{f.title}</h3>
                <p className="feature-desc">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

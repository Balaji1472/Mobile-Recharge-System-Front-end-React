import React from 'react';
import './AboutPage.css';

const valueCards = [
  {
    icon: 'fa-bolt-lightning',
    title: 'Instant Speed',
    desc: 'Our direct-to-carrier API ensures your recharge hits your phone in seconds, not minutes.',
  },
  {
    icon: 'fa-shield-heart',
    title: 'Unmatched Trust',
    desc: 'Encrypted transactions and transparent refund policies make us India\'s most trusted partner.',
  },
  {
    icon: 'fa-leaf',
    title: 'Pure Simplicity',
    desc: 'No clutter. No hidden fees. Just a clean interface designed for everyone to use with ease.',
  },
];

const stats = [
  { value: '10M+', label: 'Successful Recharges' },
  { value: '5M+',  label: 'Happy Users' },
  { value: '24/7', label: 'Priority Support' },
];

export default function AboutPage() {
  return (
    <>
      {/* ── HERO ── */}
      <section className="about-hero">
        <div className="container text-center">
          <h1 className="display-4 fw-bold">Empowering Your Connectivity</h1>
          <p className="lead text-white-50">Simplifying mobile recharges for millions across India.</p>
        </div>
      </section>

      {/* ── VALUE CARDS ── */}
      <section className="py-5">
        <div className="container">
          <div className="row g-4 justify-content-center">
            {valueCards.map((card) => (
              <div className="col-md-4" key={card.title}>
                <div className="value-card">
                  <i className={`fa-solid ${card.icon}`}></i>
                  <h3>{card.title}</h3>
                  <p>{card.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section className="about-stats-bar py-5">
        <div className="container">
          <div className="row text-center">
            {stats.map((stat) => (
              <div className="col-md-4" key={stat.label}>
                <div className="stat-item">
                  <h2>{stat.value}</h2>
                  <p>{stat.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
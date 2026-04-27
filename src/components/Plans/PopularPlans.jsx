import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom'; // ← ADD THIS
import { apiGetAllPlans } from '../../services/api';
import './PopularPlans.css';

const OPERATOR_TABS = ['Airtel', 'Jio', 'VI'];

const BORDER_MAP = {
  airtel: 'airtel-border',
  jio: 'jio-border',
  vi: 'vi-border',
  vodafone: 'vi-border',
  bsnl: 'bsnl-border',
};

function getBorderClass(operatorName = '') {
  const key = operatorName.toLowerCase().trim();
  for (const [k, v] of Object.entries(BORDER_MAP)) {
    if (key.includes(k)) return v;
  }
  return '';
}

// ← ONLY THIS COMPONENT CHANGED — added navigate on button click
function PlanCard({ plan }) {
  const navigate = useNavigate(); // ← ADD THIS
  const border = getBorderClass(plan.operatorName);

  return (
    <div className={`plan-card ${border}`}>
      <div className="plan-badge">{plan.operatorName}</div>

      <div className="price-section">
        <p className="plan-price">₹{plan.price}</p>
        <span className="plan-validity">
          {plan.validityDays ? `${plan.validityDays} Days` : 'Unlimited'}
        </span>
      </div>

      <ul className="plan-features">
        {plan.dataBenefits && (
          <li><i className="fa-solid fa-wifi"></i> {plan.dataBenefits}</li>
        )}
        {plan.callBenefits && (
          <li><i className="fa-solid fa-phone"></i> {plan.callBenefits}</li>
        )}
        {plan.smsBenefits && (
          <li><i className="fa-solid fa-message"></i> {plan.smsBenefits}</li>
        )}
        {plan.planName && (
          <li><i className="fa-solid fa-tag"></i> {plan.planName}</li>
        )}
      </ul>

      {/* ← ONLY THIS LINE CHANGED */}
      <button className="btn-plan" onClick={() => navigate('/recharge')}>
        Recharge Now
      </button>
    </div>
  );
}
export default function PopularPlans() {
  const { token } = useSelector((state) => state.auth);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('Airtel');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');

    apiGetAllPlans(token)
      .then((data) => {
        if (!cancelled) {
          setPlans(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err.message || 'Failed to load plans');
          setLoading(false);
        }
      });

    return () => { cancelled = true; };
  }, [token]);

  const filtered = plans.filter((p) => {
    if (!p.isActive) return false;
    return p.operatorName?.toLowerCase().includes(activeTab.toLowerCase());
  });

  const displayed = filtered.slice(0, 3);

  return (
    <section className="popular-plans-section">
      <div className="container">
        <h2 className="sec-title">Popular Plans</h2>

        <div className="op-tabs">
          {OPERATOR_TABS.map((tab) => (
            <button
              key={tab}
              className={`op-tab ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>

        {loading && (
          <div className="plans-loading">
            <div className="plans-spinner"></div>
            <p>Loading plans...</p>
          </div>
        )}

        {!loading && error && (
          <div className="plans-loading">
            <i className="fa-solid fa-circle-exclamation text-danger me-2"></i>
            <span style={{ color: '#e41b23' }}>{error}</span>
          </div>
        )}

        {!loading && !error && displayed.length === 0 && (
          <div className="plans-loading">
            <i className="fa-solid fa-inbox me-2"></i>
            No active plans found for {activeTab}.
          </div>
        )}

        {!loading && !error && displayed.length > 0 && (
          <div className="row g-4">
            {displayed.map((plan) => (
              <div className="col-md-4" key={plan.planId}>
                <PlanCard plan={plan} />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
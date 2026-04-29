import React from 'react';
import { useDispatch } from 'react-redux';
import { setSelectedPlan } from '../../slice/rechargeSlice';
import '../css/PlanCard.css';

export default function PlanCard({ plan, highlight = false, isTrending = false }) {
  const dispatch = useDispatch();

  const handleViewDetails = (e) => {
    e.stopPropagation();
    dispatch(setSelectedPlan(plan));
  };

  // Format validity display
  const validityLabel = plan.validityDays
    ? plan.validityDays === 1
      ? '1 day'
      : `${plan.validityDays} days`
    : null;

  // Show data only if not NA
  const hasData = plan.dataBenefits && plan.dataBenefits !== 'NA';
  const hasCalls = plan.callBenefits && plan.callBenefits !== 'NA';
  const hasSms = plan.smsBenefits && plan.smsBenefits !== 'NA';

  return (
    <div className="plan-card" onClick={handleViewDetails}>
      {/* ── Main row ── */}
      <div className="plan-card__main">
        <div className="plan-card__price">
          <span className="plan-card__rupee">₹</span>
          {plan.price % 1 === 0 ? Math.floor(plan.price) : plan.price}
        </div>

        <div className="plan-card__specs">
          {hasData && (
            <span className="plan-card__spec-chip">
              <i className="bi bi-wifi" />
              {plan.dataBenefits}
            </span>
          )}
          {validityLabel && (
            <span className="plan-card__spec-chip">
              <i className="bi bi-calendar3" />
              {validityLabel}
            </span>
          )}
          {hasCalls && (
            <span className="plan-card__spec-chip plan-card__spec-chip--calls">
              <i className="bi bi-telephone" />
              {plan.callBenefits}
            </span>
          )}
        </div>

        <button
          className="plan-card__view-btn"
          onClick={handleViewDetails}
          aria-label={`View details for ₹${plan.price} plan`}
        >
          View Details
          <i className="bi bi-chevron-right" />
        </button>
      </div>

      {/* ── Description / SMS row ── */}
      {hasSms && (
        <p className="plan-card__desc">
          {hasCalls ? `${plan.callBenefits} calls + ${plan.smsBenefits} SMS/day` : plan.smsBenefits}
        </p>
      )}
    </div>
  );
}
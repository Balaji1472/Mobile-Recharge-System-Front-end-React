import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux'; 
import { loadActivePlans } from '../slice/activePlansSlice';
import { Spinner } from '../../../../components/common';
import { useToast } from '../../../../hooks/useToast';
import '../css/ActivePlansPage.css';

function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
}

function formatAmount(amount) {
  if (amount === null || amount === undefined) return '—';
  return `₹${parseFloat(amount).toLocaleString('en-IN')}`;
}

/* ── Plan Detail Pill ────────────────────────────────── */
function PlanPill({ icon, label, value }) {
  return (
    <div className="ap-pill">
      <div className="ap-pill-icon">
        <i className={`fa-solid ${icon}`} />
      </div>
      <div className="ap-pill-text">
        <span className="ap-pill-label">{label}</span>
        <span className="ap-pill-value">{value || '—'}</span>
      </div>
    </div>
  );
}

export default function ActivePlansPage() {
  const { toast } = useToast();
  const navigate      = useNavigate();
  const dispatch      = useDispatch();

  // Pulling state from Redux instead of local useState
  const { data: overview, isLoading: loading, isError, message: error } = useSelector(
    (state) => state.activePlans
  );

  useEffect(() => {
    dispatch(loadActivePlans());
  }, [dispatch]);

  // Show toast if an error occurs in the Redux state
  useEffect(() => {
    if (isError && error) {
      toast(error, 'error');
    }
  }, [isError, error, toast]);

  return (
    <div className="ap-page">

      <div className="ap-header">
        <h1 className="ap-title">Active Plans</h1>
        <p className="ap-subtitle">Your current active plan details</p>
      </div>

      {loading && (
        <div className="ap-center-state">
          <Spinner size="md" />
          <span>Loading plan details...</span>
        </div>
      )}

      {isError && !loading && (
        <div className="ap-error-row">
          <i className="fa-solid fa-triangle-exclamation" />
          <span>{error}</span>
        </div>
      )}

      {!loading && !isError && (
        <div className="ap-card">

          {overview?.currentPlanName ? (
            <>
              {/* ── Hero banner ── */}
              <div className="ap-hero">
                <div>
                  <p className="ap-hero-label">Current Active Plan</p>
                  <p className="ap-hero-name">{overview.currentPlanName}</p>
                </div>
                <p className="ap-hero-price">{formatAmount(overview.amountPaid)}</p>
              </div>

              {/* ── Detail pills ── */}
              <div className="ap-pills">
                <PlanPill icon="fa-wifi"          label="Data Balance" value={overview.dataRemaining} />
                <PlanPill icon="fa-phone"         label="Calls"        value={overview.callBenefits} />
                <PlanPill icon="fa-comment-sms"  label="SMS"          value={overview.smsBenefits} />
                <PlanPill icon="fa-calendar-days" label="Expiry Date"  value={formatDate(overview.validUntil)} />
                <PlanPill icon="fa-signal"        label="Network"      value={overview.operatorName} />
              </div>

              {/* ── CTA ── */}
              <button
                className="ap-recharge-btn"
                onClick={() => navigate('/recharge')}
              >
                <i className="fa-solid fa-bolt" /> Upgrade / Recharge
              </button>
            </>
          ) : (
            <div className="ap-no-plan">
              <i className="fa-solid fa-sim-card" />
              <p>No active plan found</p>
              <p className="ap-no-plan-sub">Recharge now to activate a plan.</p>
              <button
                className="ap-recharge-btn"
                onClick={() => navigate('/recharge')}
              >
                <i className="fa-solid fa-bolt" /> Recharge Now
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
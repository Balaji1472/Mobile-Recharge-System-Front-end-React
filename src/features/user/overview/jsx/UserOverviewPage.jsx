import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux"; 
import { loadUserOverview } from "../slice/userOverviewSlice";
import { Spinner } from "../../../../components/common";
import { useToast } from "../../../../hooks/useToast";
import AISummaryCard from "../../../summary/jsx/AISummaryCard";
import "../css/UserOverviewPage.css";

function formatDate(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatAmount(amount) {
  if (amount === null || amount === undefined) return "—";
  return `₹${parseFloat(amount).toLocaleString("en-IN")}`;
}

/* ── Stat Card ───────────────────────────────────────── */
function StatCard({ icon, value, label, colorClass }) {
  return (
    <div className={`uo-stat-card ${colorClass}`}>
      <div className="uo-stat-icon">
        <i className={`fa-solid ${icon}`} />
      </div>
      <p className="uo-stat-value">{value ?? "—"}</p>
      <p className="uo-stat-label">{label}</p>
    </div>
  );
}

/* ── Plan Detail Row ─────────────────────────────────── */
function PlanRow({ icon, label, value }) {
  return (
    <div className="uo-plan-row">
      <span className="uo-plan-label">
        <i className={`fa-solid ${icon}`} />
        {label}
      </span>
      <span className="uo-plan-value">{value || "—"}</span>
    </div>
  );
}

/* ── Account Status Badge ────────────────────────────── */
function AccountStatusBadge({ status }) {
  const map = {
    ACTIVE: "uo-status--active",
    BLOCKED: "uo-status--blocked",
    INACTIVE: "uo-status--inactive",
  };
  return (
    <span className={`uo-status-badge ${map[status] || "uo-status--inactive"}`}>
      <i
        className={`fa-solid ${status === "ACTIVE" ? "fa-circle-check" : "fa-circle-xmark"}`}
      />
      {status}
    </span>
  );
}

export default function UserOverviewPage() {
  const dispatch = useDispatch();
  const { toast } = useToast(); 

  const {
    data: overview,
    isLoading: loading,
    isError,
    message: error,
  } = useSelector((state) => state.userOverview);

  useEffect(() => {
    dispatch(loadUserOverview());
  }, [dispatch]);

  useEffect(() => {
    if (isError && error) {
      toast(error, "error");
    }
  }, [isError, error, toast]);

  if (loading) {
    return (
      <div className="uo-page">
        <div className="uo-header">
          <h1 className="uo-title">Overview</h1>
          <p className="uo-subtitle">Your account at a glance</p>
        </div>
        <div className="uo-center-state">
          <Spinner size="md" />
          <span>Loading your overview...</span>
        </div>
      </div>
    );
  }

  if (isError && !overview) {
    return (
      <div className="uo-page">
        <div className="uo-header">
          <h1 className="uo-title">Overview</h1>
          <p className="uo-subtitle">Your account at a glance</p>
        </div>
        <div className="uo-error-row">
          <i className="fa-solid fa-triangle-exclamation" />
          <span>{error}</span>
        </div>
      </div>
    );
  }

  const hasActivePlan = overview?.currentPlanName;

  return (
    <div className="uo-page">
      <div className="uo-header">
        <h1 className="uo-title">Overview</h1>
        <p className="uo-subtitle">Your account at a glance</p>
      </div>

      <div className="uo-stats-row">
        <StatCard
          icon="fa-receipt"
          value={overview?.totalRecharges ?? 0}
          label="Total Recharges"
          colorClass="uo-stat--total"
        />
        <StatCard
          icon="fa-circle-check"
          value={overview?.successfulRecharges ?? 0}
          label="Successful"
          colorClass="uo-stat--success"
        />
        <StatCard
          icon="fa-circle-xmark"
          value={overview?.failedRecharges ?? 0}
          label="Failed"
          colorClass="uo-stat--failed"
        />
        <StatCard
          icon="fa-indian-rupee-sign"
          value={formatAmount(overview?.amountPaid)}
          label="Total Spent for latest recharge"
          colorClass="uo-stat--spent"
        />
      </div>

      <div className="uo-bottom-row">
        <div className="uo-card uo-plan-card">
          <div className="uo-card-heading">
            <i className="fa-solid fa-sim-card" />
            <span>Current Plan</span>
          </div>
          <hr className="uo-card-divider" />

          {hasActivePlan ? (
            <>
              <div className="uo-plan-hero">
                <div className="uo-plan-icon">
                  <i className="fa-solid fa-wifi" />
                </div>
                <div>
                  <p className="uo-plan-name">{overview.currentPlanName}</p>
                  <p className="uo-plan-operator">
                    {overview.operatorName || "—"}
                  </p>
                </div>
              </div>

              <div className="uo-plan-details">
                <PlanRow
                  icon="fa-wifi"
                  label="Data"
                  value={overview.dataRemaining}
                />
                <PlanRow
                  icon="fa-phone"
                  label="Calls"
                  value={overview.callBenefits}
                />
                <PlanRow
                  icon="fa-comment-sms"
                  label="SMS"
                  value={overview.smsBenefits}
                />
                <PlanRow
                  icon="fa-calendar-check"
                  label="Valid Until"
                  value={formatDate(overview.validUntil)}
                />
              </div>
            </>
          ) : (
            <div className="uo-no-plan">
              <i className="fa-solid fa-sim-card" />
              <p>No active plan found.</p>
              <p className="uo-no-plan-sub">Recharge now to activate a plan.</p>
            </div>
          )}
        </div>

        <div className="uo-card uo-account-card">
          <div className="uo-card-heading">
            <i className="fa-solid fa-shield-halved" />
            <span>Account Details</span>
          </div>
          <hr className="uo-card-divider" />

          <div className="uo-account-status-row">
            <AccountStatusBadge status={overview?.accountStatus} />
          </div>

          <div className="uo-account-details">
            <div className="uo-account-row">
              <span className="uo-account-label">
                <i className="fa-solid fa-tower-cell" /> Network Operator
              </span>
              <span className="uo-account-val">
                {overview?.operatorName || "—"}
              </span>
            </div>

            <div className="uo-account-row">
              <span className="uo-account-label">
                <i className="fa-solid fa-user-check" /> Account Level
              </span>
              <span className="uo-account-val">
                {overview?.accountStatus === "ACTIVE"
                  ? "Verified User"
                  : "Limited Access"}
              </span>
            </div>

            <div className="uo-account-row">
              <span className="uo-account-label">
                <i className="fa-solid fa-user-check" /> Trust Score
              </span>
              <span className="uo-account-val">
                {overview?.successfulRecharges > 0 ? "High" : "New Account"}
              </span>
            </div>
          </div>
        </div>
      </div>
       <AISummaryCard role="user" ready={!!overview} />
    </div>
  );
}

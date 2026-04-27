import React from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  selectStep,
  selectMobileNumber,
  selectPlans,
  selectSearchQuery,
  setSearchQuery,
  resetRecharge,
} from "../features/user/recharge/slice/rechargeSlice";
import RechargeInfoPanel from "../components/Recharge/RechargeInfoPanel";
import RechargeForm from "../components/Recharge/RechargeForm";
import RechargeFAQ from "../components/Recharge/RechargeFAQ";
import PlansListStep from "../features/user/recharge/components/jsx/PlansListStep";
import PlanDetailModal from "../features/user/recharge/components/jsx/PlanDetailModal";
import PaymentResultModal from "../features/user/recharge/components/jsx/PaymentResultModal";
import "./RechargePage.css";

/**
 * RechargePage
 *
 * Always renders the two-column split layout (matching the original design).
 *
 * LEFT sidebar (desktop only, sticky):
 *   - step === 'input'  → RechargeInfoPanel  (original red "Recharge Online" panel)
 *   - step === 'plans'  → Mobile number pill + Change button + Search box
 *
 * RIGHT scrollable panel:
 *   - step === 'input'  → RechargeForm + RechargeFAQ  (original layout, untouched)
 *   - step === 'plans'  → PlansListStep
 *
 * Modals (overlay the entire page):
 *   - PlanDetailModal      — plan info + payment method picker + Razorpay trigger
 *   - PaymentResultModal   — success / failure result after Razorpay closes
 */
export default function RechargePage() {
  const step        = useSelector(selectStep);
  const mobileNumber = useSelector(selectMobileNumber);
  const plans       = useSelector(selectPlans);
  const searchQuery = useSelector(selectSearchQuery);
  const dispatch    = useDispatch();

  const formatMobile = (num) =>
    num ? `${num.slice(0, 5)} ${num.slice(5)}` : num;

  return (
    <div className="recharge-split-wrapper">
      <div className="row g-0">

        {/* ── LEFT: Sticky Sidebar (desktop only) ── */}
        <div className="col-lg-4 col-xl-3 d-none d-lg-flex">
          {step === "input" ? (
            /* Original info panel unchanged */
            <RechargeInfoPanel />
          ) : (
            /* Plans step: mobile number + search */
            <div className="rp-plans-sidebar">
              <div className="rp-mob-pill">
                <span className="rp-mob-number">{formatMobile(mobileNumber)}</span>
                <button
                  className="rp-mob-change"
                  onClick={() => dispatch(resetRecharge())}
                >
                  Change
                </button>
              </div>

              <div className="rp-sidebar-section">
                <p className="rp-sidebar-label">FIND A PREFERRED RECHARGE PACK</p>
                <div className="rp-sidebar-search-box">
                  <i className="bi bi-search rp-sidebar-search-icon" />
                  <input
                    className="rp-sidebar-search-input"
                    type="text"
                    placeholder="Search for a pack"
                    value={searchQuery}
                    onChange={(e) => dispatch(setSearchQuery(e.target.value))}
                  />
                  {searchQuery && (
                    <button
                      className="rp-sidebar-search-clear"
                      onClick={() => dispatch(setSearchQuery(""))}
                    >
                      <i className="bi bi-x" />
                    </button>
                  )}
                </div>
              </div>

              {plans.length > 0 && (
                <div className="rp-sidebar-count">
                  <i className="bi bi-grid-3x3-gap" />
                  <span>{plans.length} plans available</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── RIGHT: Scrollable Content ── */}
        <div className="col-12 col-lg-8 col-xl-9">
          <div className="recharge-scroll-panel">
            {step === "input" ? (
              <>
                <RechargeForm />
                <RechargeFAQ />
              </>
            ) : (
              <PlansListStep />
            )}
          </div>
        </div>

      </div>

      {/* ── Modals overlay the entire page ── */}
      <PlanDetailModal />
      <PaymentResultModal />
    </div>
  );
}
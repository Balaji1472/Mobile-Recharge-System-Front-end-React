import React, { useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  clearSelectedPlan,
  selectSelectedPlan,
  selectPaymentMethod,
  selectRechargeLoading,
  selectRechargeError,
  selectRazorpayOrderData,
  setPaymentMethod,
  setPaymentResult,
  clearRechargeStatus,
  submitRecharge,
  confirmPayment,
  cancelRecharge,
} from "../../slice/rechargeSlice";
import "../css/PlanDetailModal.css";

// ─── Razorpay key ─────────────────────────────────────────────────────────────
const RAZORPAY_KEY_ID = "rzp_test_SgZzg3opLMQGqW";

// ─── Payment method options ───────────────────────────────────────────────────
const PAYMENT_METHODS = [
  { value: "UPI", label: "UPI", icon: "bi-phone" },
  { value: "CARD", label: "CARD", icon: "bi-credit-card" },
  { value: "NETBANKING", label: "NET BANKING", icon: "bi-bank" },
];

// ─── Load Razorpay script lazily ──────────────────────────────────────────────
function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (document.getElementById("razorpay-checkout-script")) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.id = "razorpay-checkout-script";
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export default function PlanDetailModal() {
  const dispatch = useDispatch();
  const plan = useSelector(selectSelectedPlan);
  const paymentMethod = useSelector(selectPaymentMethod);
  const rechargeLoading = useSelector(selectRechargeLoading);
  const rechargeError = useSelector(selectRechargeError);
  const orderData = useSelector(selectRazorpayOrderData);

  // ── Keyboard: Escape closes modal ──────────────────────────────────────────
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape") dispatch(clearSelectedPlan());
    };
    if (plan) document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [plan, dispatch]);

  // ── Lock body scroll while open ────────────────────────────────────────────
  useEffect(() => {
    document.body.style.overflow = plan ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [plan]);

  // ── Open Razorpay popup once orderData arrives in Redux ────────────────────
  const openRazorpay = useCallback(
    async (order, currentPlan) => {
      const loaded = await loadRazorpayScript();
      if (!loaded) {
        dispatch(
          setPaymentResult({
            success: false,
            errorMsg: "Could not load payment gateway. Check your connection.",
          }),
        );
        dispatch(clearSelectedPlan());
        return;
      }

      const amountInPaise = Math.round(parseFloat(order.finalAmount) * 100);

      const options = {
        key: RAZORPAY_KEY_ID,
        amount: amountInPaise,
        currency: "INR",
        name: "ReUp — Mobile Recharge",
        description: currentPlan?.planName ?? "Mobile Recharge",
        order_id: order.razorpayOrderId,

        handler(response) {
          // ── Razorpay confirmed payment on their end ────────────────────────
          // NOW call our backend to verify signature + update DB.
          // confirmPayment thunk → POST /payments/verify
          dispatch(clearSelectedPlan());
          dispatch(
            confirmPayment({
              razorpayOrderId: order.razorpayOrderId,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
              // UI display data passed through so PaymentResultModal can show it
              rechargeId: order.rechargeId,
              finalAmount: order.finalAmount,
              planName: currentPlan?.planName,
              validityDays: currentPlan?.validityDays,
            }),
          );
        },

        modal: {
          ondismiss() {
            dispatch(cancelRecharge(order.razorpayOrderId));
            dispatch(clearSelectedPlan());
          },
        },

        theme: { color: "#c8302a" },
      };

      const rzp = new window.Razorpay(options);

      rzp.on("payment.failed", (response) => {
        dispatch(cancelRecharge(order.razorpayOrderId));
        dispatch(
          setPaymentResult({
            success: false,
            errorMsg: response.error?.description ?? "Payment failed.",
          }),
        );
        dispatch(clearSelectedPlan());
      });

      rzp.open();
    },
    [dispatch],
  );

  useEffect(() => {
    if (orderData && plan) {
      openRazorpay(orderData, plan);
    }
  }, [orderData, plan, openRazorpay]);

  if (!plan) return null;

  const handleClose = () => {
    dispatch(clearSelectedPlan());
    dispatch(clearRechargeStatus());
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) handleClose();
  };

  const handleRechargeNow = () => {
    dispatch(
      submitRecharge({
        planId: plan.planId,
        paymentMethod: paymentMethod,
      }),
    );
  };

  const validityLabel = plan.validityDays
    ? plan.validityDays === 1
      ? "1 day"
      : `${plan.validityDays} days`
    : null;

  const hasData = plan.dataBenefits && plan.dataBenefits !== "NA";
  const hasCalls = plan.callBenefits && plan.callBenefits !== "NA";
  const hasSms = plan.smsBenefits && plan.smsBenefits !== "NA";

  const priceDisplay =
    plan.price % 1 === 0 ? Math.floor(plan.price) : plan.price;

  const features = [
    hasCalls && { icon: "bi-telephone-fill", label: plan.callBenefits },
    hasData && { icon: "bi-wifi", label: plan.dataBenefits },
    validityLabel && {
      icon: "bi-calendar3",
      label: `${validityLabel} Validity`,
    },
    hasSms && {
      icon: "bi-envelope-fill",
      label: `${plan.smsBenefits} SMS/Day`,
    },
  ].filter(Boolean);

  return (
    <div
      className="pdm-overlay"
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
    >
      <div className="pdm-sheet">
        {/* ── Close ── */}
        <button className="pdm-close" onClick={handleClose} aria-label="Close">
          &#x2715;
        </button>

        {/* ── Price heading ── */}
        <div className="pdm-price-heading">
          <span className="pdm-rupee">₹</span>
          <span className="pdm-amount">{priceDisplay}</span>
        </div>

        {/* ── Header card ── */}
        <div className="pdm-header-card">
          <div className="pdm-header-icon">
            <i className="bi bi-play-fill" />
          </div>
          <div className="pdm-header-info">
            <p className="pdm-plan-name">{plan.planName}</p>
            {plan.operatorName && (
              <p className="pdm-operator">{plan.operatorName}</p>
            )}
            {validityLabel && (
              <p className="pdm-validity">Validity {validityLabel}</p>
            )}
          </div>
        </div>

        {/* ── Feature specs grid ── */}
        {features.length > 0 && (
          <div className="pdm-specs-grid">
            {features.map((f, i) => (
              <div className="pdm-spec-item" key={i}>
                <i className={`bi ${f.icon} pdm-spec-icon`} />
                <span className="pdm-spec-label">{f.label}</span>
              </div>
            ))}
          </div>
        )}

        {/* ── Category badge ── */}
        {plan.categoryName && (
          <div className="pdm-category-badge">
            <i className="bi bi-tag-fill" />
            <span>{plan.categoryName}</span>
          </div>
        )}

        {/* ── Payment method selector ── */}
        <div className="pdm-pm-section">
          <p className="pdm-pm-label">PAYMENT METHOD</p>
          <div className="pdm-pm-options">
            {PAYMENT_METHODS.map((pm) => (
              <button
                key={pm.value}
                className={`pdm-pm-btn${paymentMethod === pm.value ? " pdm-pm-btn--active" : ""}`}
                onClick={() => dispatch(setPaymentMethod(pm.value))}
                disabled={rechargeLoading}
              >
                <i className={`bi ${pm.icon}`} />
                <span>{pm.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* ── Error from submitRecharge ── */}
        {rechargeError && (
          <div className="pdm-error-row">
            <i className="bi bi-exclamation-triangle-fill" />
            <span>{rechargeError}</span>
          </div>
        )}

        {/* ── Terms & Conditions ── */}
        <div className="pdm-tnc">
          <p className="pdm-tnc-title">TERMS &amp; CONDITIONS</p>
          <p className="pdm-tnc-body">
            This plan is subject to fair usage policy. Speeds may be reduced
            after daily data limit is exhausted. Roaming calls charged at
            standard rates outside home circle. Validity starts from the date of
            recharge. Offer valid for prepaid customers only.
          </p>
        </div>

        {/* ── CTA ── */}
        <button
          className="pdm-cta-btn"
          onClick={handleRechargeNow}
          disabled={rechargeLoading}
        >
          {rechargeLoading ? (
            <>
              <span className="pdm-spinner" />
              PROCESSING...
            </>
          ) : (
            <>
              <i className="bi bi-lock-fill" />
              &nbsp; RECHARGE NOW — ₹{priceDisplay}
            </>
          )}
        </button>
      </div>
    </div>
  );
}

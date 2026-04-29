import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  selectPaymentResult,
  selectVerifying, 
  clearPaymentResult,
  resetRecharge,
} from "../../slice/rechargeSlice";
import "../css/PaymentResultModal.css";

export default function PaymentResultModal() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const result = useSelector(selectPaymentResult);
  const verifying = useSelector(selectVerifying); 

  useEffect(() => {
    const isOpen = verifying || !!result;
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [result, verifying]);

  if (verifying) {
    return (
      <div className="prm-overlay" role="dialog" aria-modal="true">
        <div
          className="prm-sheet"
          style={{ textAlign: "center", padding: "2.5rem 1.5rem" }}
        >
          <div
            className="pdm-spinner"
            style={{ width: 40, height: 40, margin: "0 auto 1.2rem" }}
          />
          <h2 className="prm-title" style={{ fontSize: "1.1rem" }}>
            Confirming Payment…
          </h2>
          <p className="prm-sub">
            Please wait while we verify your payment with the server.
          </p>
        </div>
      </div>
    );
  }

  if (!result) return null;

  const isSuccess = result.success === true;

  const handleViewPlans = () => {
    dispatch(resetRecharge());
    navigate("/user/active-plans");
  };

  const handleTryAgain = () => {
    dispatch(clearPaymentResult());
  };

  const handleClose = () => {
    dispatch(clearPaymentResult());
  };

  const priceDisplay = result.finalAmount
    ? parseFloat(result.finalAmount).toLocaleString("en-IN", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      })
    : null;

  return (
    <div className="prm-overlay" role="dialog" aria-modal="true">
      <div className="prm-sheet">
        {/* ── Close Icon Button ── */}
        <button
          className="prm-close-btn"
          onClick={handleClose}
          aria-label="Close modal"
        >
          <i className="fa-solid fa-xmark" />
        </button>

        {/* ── Icon ── */}
        <div
          className={`prm-icon-circle ${isSuccess ? "prm-icon-circle--success" : "prm-icon-circle--failure"}`}
        >
          <i
            className={`fa-solid ${isSuccess ? "fa-circle-check" : "fa-circle-xmark"}`}
            style={{ color: isSuccess ? "#28a745" : "#dc3545" }}
          />{" "}
        </div>

        {/* ── Title ── */}
        <h2 className="prm-title">
          {isSuccess ? "Recharge Successful!" : "Payment Failed"}
        </h2>

        {/* ── Subtitle ── */}
        <p className="prm-sub">
          {isSuccess
            ? `Your ${result.planName ?? "plan"} has been activated successfully.`
            : (result.errorMsg ??
              "Your payment could not be completed. No amount has been debited.")}
        </p>

        {/* ── Details card (success only) ── */}
        {isSuccess && (
          <div className="prm-details">
            {result.planName && (
              <div className="prm-detail-row">
                <span className="prm-detail-label">Plan</span>
                <span className="prm-detail-value">{result.planName}</span>
              </div>
            )}
            {result.validityDays && (
              <div className="prm-detail-row">
                <span className="prm-detail-label">Validity</span>
                <span className="prm-detail-value">
                  {result.validityDays === 1
                    ? "1 day"
                    : `${result.validityDays} days`}
                </span>
              </div>
            )}
            {priceDisplay && (
              <div className="prm-detail-row">
                <span className="prm-detail-label">Amount Paid</span>
                <span className="prm-detail-value prm-detail-value--price">
                  ₹{priceDisplay}
                </span>
              </div>
            )}
            {result.razorpayPaymentId && (
              <div className="prm-detail-row">
                <span className="prm-detail-label">Payment ID</span>
                <span className="prm-detail-value prm-detail-value--id">
                  {result.razorpayPaymentId}
                </span>
              </div>
            )}
          </div>
        )}

        {/* ── Actions ── */}
        {isSuccess ? (
          <button
            className="prm-btn prm-btn--primary"
            onClick={handleViewPlans}
          >
            <i className="bi bi-sim-fill" />
            View Active Plan
          </button>
        ) : (
          <>
            <button
              className="prm-btn prm-btn--primary"
              onClick={handleTryAgain}
            >
              <i className="bi bi-arrow-clockwise" />
              Try Again
            </button>
            <button className="prm-btn prm-btn--ghost" onClick={handleClose}>
              Go Back
            </button>
          </>
        )}
      </div>
    </div>
  );
}

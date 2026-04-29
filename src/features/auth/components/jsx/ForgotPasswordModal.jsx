import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import {
  forgotPasswordRequest,
  resetPasswordVerify,
} from "../../slice/authSlice";
import { useToast } from "../../../../hooks/useToast";
import "../css/Auth.css";

const TIMER_DURATION = 300;

function validate(step, data) {
  const errs = {};
  if (step === 1) {
    if (!data.email.trim()) {
      errs.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim())) {
      errs.email = "Enter a valid email address";
    }
  }
  if (step === 2) {
    if (!data.otp.trim()) {
      errs.otp = "OTP is required";
    } else if (!/^\d{6}$/.test(data.otp.trim())) {
      errs.otp = "OTP must be exactly 6 digits";
    }
    if (!data.newPassword) {
      errs.newPassword = "New password is required";
    } else if (data.newPassword.length < 6) {
      errs.newPassword = "Password must be at least 6 characters";
    }
    if (!data.confirmPassword) {
      errs.confirmPassword = "Please confirm your password";
    } else if (data.newPassword !== data.confirmPassword) {
      errs.confirmPassword = "Passwords do not match";
    }
  }
  return errs;
}

function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s < 10 ? "0" : ""}${s}`;
}

export default function ForgotPasswordModal({ onClose }) {
  const dispatch = useDispatch();
  const { toast } = useToast();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [timer, setTimer] = useState(TIMER_DURATION);
  const [expired, setExpired] = useState(false);

  const [email, setEmail] = useState("");
  const [formData, setFormData] = useState({
    otp: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    if (step !== 2) return;
    if (timer <= 0) {
      setExpired(true);
      return;
    }
    const id = setInterval(() => {
      setTimer((t) => {
        if (t <= 1) {
          setExpired(true);
          clearInterval(id);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [step]);

  const timerPct = (timer / TIMER_DURATION) * 100;
  const isUrgent = timer <= 60 && timer > 0;

  const handleSendOtp = async (e) => {
    e.preventDefault();
    const errs = validate(1, { email });
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    setErrors({});
    setLoading(true);
    try {
      await dispatch(forgotPasswordRequest(email.trim().toLowerCase())).unwrap();
      toast("OTP sent successfully! Check your email.", "success");
      setStep(2);
      setTimer(TIMER_DURATION);
      setExpired(false);
    } catch (err) {
      toast(err?.message || "Failed to send OTP. Please try again.", "error");
    }
    setLoading(false);
  };

  const handleResend = async () => {
    setLoading(true);
    setErrors({});
    try {
      await dispatch(forgotPasswordRequest(email.trim().toLowerCase())).unwrap();
      toast("OTP resent successfully!", "success");
      setTimer(TIMER_DURATION);
      setExpired(false);
      setFormData({ otp: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      toast(err?.message || "Failed to resend OTP. Please try again.", "error");
    }
    setLoading(false);
  };

  const handleReset = async (e) => {
    e.preventDefault();
    const errs = validate(2, formData);
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    setErrors({});
    setLoading(true);
    try {
      await dispatch(
        resetPasswordVerify({
          email: email.trim().toLowerCase(),
          otp: formData.otp.trim(),
          newPassword: formData.newPassword,
          confirmPassword: formData.confirmPassword,
        })
      ).unwrap();
      toast("Password updated successfully!", "success");
      onClose();
    } catch (err) {
      toast(err?.message || "Failed to reset password. Please try again.", "error");
    }
    setLoading(false);
  };

  const handleChange = (field) => (e) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  return (
    <div className="fp-overlay" onClick={onClose}>
      <div className="fp-modal" onClick={(e) => e.stopPropagation()}>

        <div className="fp-modal-header">
          <div className="fp-modal-title-group">
            <h3 className="fp-modal-title">Reset Password</h3>
            <p className="fp-modal-subtitle">
              {step === 1 ? "Enter your registered email" : `OTP sent to ${email}`}
            </p>
          </div>
          <button className="fp-modal-close" onClick={onClose}>
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        <div className="fp-modal-body">
          <div className="fp-steps">
            <div className={`fp-step ${step === 1 ? "active" : "done"}`}>
              <div className="fp-step-dot">
                {step > 1 ? <i className="fa-solid fa-check"></i> : "1"}
              </div>
              <span>Email</span>
            </div>
            <div className="fp-step-line"></div>
            <div className={`fp-step ${step === 2 ? "active" : ""}`}>
              <div className="fp-step-dot">2</div>
              <span>Verify & Reset</span>
            </div>
          </div>

          {step === 1 && (
            <form onSubmit={handleSendOtp} noValidate>
              <p className="fp-desc">
                We'll send a 6-digit OTP to your email. It's valid for{" "}
                <strong>5 minutes</strong>.
              </p>

              <div className="fp-input-group">
                <label htmlFor="fp-email">
                  Email Address<span style={{ color: "red" }}> *</span>
                </label>
                <input
                  id="fp-email"
                  type="email"
                  className={`fp-input ${errors.email ? "fp-input-err" : ""}`}
                  placeholder="Enter your registered email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setErrors((p) => ({ ...p, email: "" }));
                  }}
                  autoFocus
                />
                <small className="fp-field-error">{errors.email || ""}</small>
              </div>

              <button type="submit" className="fp-btn" disabled={loading}>
                {loading ? (
                  <>
                    <i className="fa-solid fa-spinner fa-spin"></i> Sending OTP...
                  </>
                ) : (
                  <>
                    <i className="fa-solid fa-paper-plane"></i> Send OTP
                  </>
                )}
              </button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleReset} noValidate>
              <p className="fp-desc">
                Enter the OTP sent to <strong>{email}</strong>, then set your new password.
              </p>

              {!expired ? (
                <div className="fp-timer-wrap">
                  <i className="fa-solid fa-clock fp-timer-icon"></i>
                  <div className="fp-timer-text-group">
                    <span className="fp-timer-label">OTP expires in</span>
                    <span className={`fp-timer-value ${isUrgent ? "fp-timer-urgent" : ""}`}>
                      {formatTime(timer)}
                    </span>
                    <div className="fp-timer-bar-track">
                      <div
                        className={`fp-timer-bar-fill ${isUrgent ? "fp-timer-urgent" : ""}`}
                        style={{ width: `${timerPct}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="fp-expired-msg">
                  <i className="fa-solid fa-triangle-exclamation"></i>
                  OTP has expired.
                </div>
              )}

              <div className="fp-resend-row">
                <button
                  type="button"
                  className="fp-resend-btn"
                  onClick={handleResend}
                  disabled={loading}
                >
                  {loading ? "Resending..." : "Resend OTP"}
                </button>
              </div>

              <hr className="fp-divider" />

              <div className="fp-input-group">
                <label htmlFor="fp-otp">
                  6-digit OTP<span style={{ color: "red" }}> *</span>
                </label>
                <input
                  id="fp-otp"
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  className={`fp-input ${errors.otp ? "fp-input-err" : ""}`}
                  placeholder="Enter OTP"
                  value={formData.otp}
                  onChange={handleChange("otp")}
                  autoFocus
                />
                <small className="fp-field-error">{errors.otp || ""}</small>
              </div>

              <div className="fp-input-group">
                <label htmlFor="fp-newpwd">
                  New Password<span style={{ color: "red" }}> *</span>
                </label>
                <input
                  id="fp-newpwd"
                  type="password"
                  className={`fp-input ${errors.newPassword ? "fp-input-err" : ""}`}
                  placeholder="Enter new password"
                  value={formData.newPassword}
                  onChange={handleChange("newPassword")}
                />
                <small className="fp-field-error">{errors.newPassword || ""}</small>
              </div>

              <div className="fp-input-group">
                <label htmlFor="fp-confirmpwd">
                  Confirm Password<span style={{ color: "red" }}> *</span>
                </label>
                <input
                  id="fp-confirmpwd"
                  type="password"
                  className={`fp-input ${errors.confirmPassword ? "fp-input-err" : ""}`}
                  placeholder="Confirm new password"
                  value={formData.confirmPassword}
                  onChange={handleChange("confirmPassword")}
                />
                <small className="fp-field-error">{errors.confirmPassword || ""}</small>
              </div>

              <button
                type="submit"
                className="fp-btn"
                disabled={loading || expired}
              >
                {loading ? (
                  <>
                    <i className="fa-solid fa-spinner fa-spin"></i> Updating...
                  </>
                ) : (
                  <>
                    <i className="fa-solid fa-lock"></i> Update Password
                  </>
                )}
              </button>
            </form>
          )}
        </div>

      </div>
    </div>
  );
}
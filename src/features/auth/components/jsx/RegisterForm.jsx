import React, { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { register } from "../../slice/authSlice";
import { useToast } from "../../../../hooks/useToast"; // ← for API/success toasts
import AuthOperatorCarousel from "./AuthOperatorCarousel";
import "../css/Auth.css";

/* ── Field-level validators (reused for onBlur + onSubmit) ── */
function validateFullName(fullName) {
  if (!fullName.trim()) return "Full name is required";
  if (fullName.trim().length < 3) return "Name must be at least 3 characters";
  return "";
}

function validateMobile(mobile) {
  const value = mobile.trim();
  if (!value) {
    return "Mobile number is required";
  }
  const indianRegex = /^[6-9]\d{9}$/;
  if (!indianRegex.test(value)) {
    return "Enter a valid 10-digit mobile number starting with 6-9";
  }
  return "";
}

function validateEmail(email) {
  if (!email.trim()) return "Email is required";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))
    return "Enter a valid email address";
  return "";
}

function validateGender(gender) {
  if (!gender) return "Please select your gender";
  return "";
}

function validatePassword(password) {
  if (!password) return "Password is required";
  if (password.length < 8) return "Password must be at least 8 characters";
  if (!/[A-Z]/.test(password))
    return "Must contain at least one uppercase letter";
  if (!/\d/.test(password)) return "Must contain at least one number";
  return "";
}

function validateConfirmPassword(password, confirmPassword) {
  if (!confirmPassword) return "Please confirm your password";
  if (password !== confirmPassword) return "Passwords do not match";
  return "";
}

function validateTerms(terms) {
  if (!terms) return "You must agree to the Terms & Conditions";
  return "";
}

function validateAll(fields) {
  const errs = {};
  const checks = {
    fullName: validateFullName(fields.fullName),
    mobile: validateMobile(fields.mobile),
    email: validateEmail(fields.email),
    gender: validateGender(fields.gender),
    password: validatePassword(fields.password),
    confirmPassword: validateConfirmPassword(
      fields.password,
      fields.confirmPassword,
    ),
    terms: validateTerms(fields.terms),
  };
  Object.entries(checks).forEach(([key, msg]) => {
    if (msg) errs[key] = msg;
  });
  return errs;
}

export default function RegisterForm() {
  const [fields, setFields] = useState({
    fullName: "",
    mobile: "",
    email: "",
    gender: "",
    password: "",
    confirmPassword: "",
    terms: false,
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // apiError + successMsg states removed — now go through toast
  const { toast } = useToast();
  const btnRef = useRef(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  /* ── Generic onChange — clears that field's error while typing ── */
  const set = (key) => (e) => {
    const val =
      e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setFields((p) => ({ ...p, [key]: val }));
    if (errors[key]) setErrors((p) => ({ ...p, [key]: "" }));
  };

  const shakeBtn = () => {
    btnRef.current?.classList.add("btn-shake");
    setTimeout(() => btnRef.current?.classList.remove("btn-shake"), 500);
  };

  /* ── onBlur handlers — validate single field on focus-out ── */
  const handleBlur = (key) => () => {
    let err = "";
    switch (key) {
      case "fullName":
        err = validateFullName(fields.fullName);
        break;
      case "mobile":
        err = validateMobile(fields.mobile);
        break;
      case "email":
        err = validateEmail(fields.email);
        break;
      case "gender":
        err = validateGender(fields.gender);
        break;
      case "password":
        err = validatePassword(fields.password);
        break;
      case "confirmPassword":
        err = validateConfirmPassword(fields.password, fields.confirmPassword);
        break;
      case "terms":
        err = validateTerms(fields.terms);
        break;
      default:
        break;
    }
    setErrors((prev) => ({ ...prev, [key]: err }));
  };

  /* ── Submit ── */
  const handleSubmit = async (e) => {
    e.preventDefault();

    const errs = validateAll(fields);
    setErrors(errs);
    if (Object.keys(errs).length > 0) {
      shakeBtn();
      return;
    }

    setLoading(true);
    try {
      await dispatch(
        register({
          fullName: fields.fullName.trim(),
          mobileNumber: fields.mobile.trim(),
          email: fields.email.trim().toLowerCase(),
          gender: fields.gender,
          password: fields.password,
        }),
      ).unwrap();

      // Success — toast instead of inline successMsg
      toast("Registration successful! Redirecting to login...", "success");
      setTimeout(() => navigate("/login"), 1800);
    } catch (err) {
      // Backend error — toast instead of inline apiError
      toast(err?.message || "Registration failed. Please try again.", "error");
      shakeBtn();
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-wrapper">
      <div className="side-promo-tag">Zero Platform Fee</div>

      <div className="container">
        <div
          className="row align-items-center g-4"
          style={{ minHeight: "75vh" }}
        >
          <div className="col-lg-6">
            <div style={{ marginTop: "-450px" }}></div>
            <AuthOperatorCarousel />
          </div>

          <div className="col-lg-5 offset-lg-1">
            <div className="auth-card">
              <h2 className="card-title">
                Register to Re <span>Up</span>
              </h2>

              <form onSubmit={handleSubmit} noValidate>
                {/* Full Name */}
                <div className="input-box">
                  <label htmlFor="regName">Full Name</label>
                  <input
                    id="regName"
                    type="text"
                    className={`form-control-custom ${errors.fullName ? "input-error" : ""}`}
                    placeholder="Enter your Name"
                    value={fields.fullName}
                    onChange={set("fullName")}
                    onBlur={handleBlur("fullName")}
                  />
                  <small className="field-error">{errors.fullName || ""}</small>
                </div>

                {/* Mobile */}
                <div className="input-box">
                  <label htmlFor="regMobile">Mobile Number</label>
                  <input
                    id="regMobile"
                    type="tel"
                    maxLength={10}
                    className={`form-control-custom ${errors.mobile ? "input-error" : ""}`}
                    placeholder="Enter your Mobile Number"
                    value={fields.mobile}
                    onChange={(e) => {
                      setFields((p) => ({
                        ...p,
                        mobile: e.target.value.replace(/\D/g, ""),
                      }));
                      if (errors.mobile)
                        setErrors((p) => ({ ...p, mobile: "" }));
                    }}
                    onBlur={handleBlur("mobile")}
                  />
                  <small className="field-error">{errors.mobile || ""}</small>
                </div>

                {/* Email */}
                <div className="input-box">
                  <label htmlFor="regEmail">Email</label>
                  <input
                    id="regEmail"
                    type="email"
                    className={`form-control-custom ${errors.email ? "input-error" : ""}`}
                    placeholder="Enter your Email"
                    value={fields.email}
                    onChange={set("email")}
                    onBlur={handleBlur("email")}
                  />
                  <small className="field-error">{errors.email || ""}</small>
                </div>

                {/* Gender */}
                <div className="input-box">
                  <label htmlFor="regGender">Gender</label>
                  <select
                    id="regGender"
                    className={`form-control-custom ${errors.gender ? "input-error" : ""}`}
                    value={fields.gender}
                    onChange={set("gender")}
                    onBlur={handleBlur("gender")}
                    style={{ cursor: "pointer" }}
                  >
                    <option value="">Select Gender</option>
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                    <option value="OTHER">Other</option>
                  </select>
                  <small className="field-error">{errors.gender || ""}</small>
                </div>

                {/* Password */}
                <div className="input-box">
                  <label htmlFor="regPass">Password</label>
                  <input
                    id="regPass"
                    type="password"
                    className={`form-control-custom ${errors.password ? "input-error" : ""}`}
                    placeholder="Enter your Password"
                    value={fields.password}
                    onChange={set("password")}
                    onBlur={handleBlur("password")}
                  />
                  <small className="field-error">{errors.password || ""}</small>
                </div>

                {/* Confirm Password */}
                <div className="input-box">
                  <label htmlFor="regConfirmPass">Confirm Password</label>
                  <input
                    id="regConfirmPass"
                    type="password"
                    className={`form-control-custom ${errors.confirmPassword ? "input-error" : ""}`}
                    placeholder="Re-enter your Password"
                    value={fields.confirmPassword}
                    onChange={set("confirmPassword")}
                    onBlur={handleBlur("confirmPassword")}
                  />
                  <small className="field-error">
                    {errors.confirmPassword || ""}
                  </small>
                </div>

                {/* Terms */}
                <div className="mb-3 text-start">
                  <div className="d-flex align-items-center gap-2">
                    <input
                      type="checkbox"
                      id="terms"
                      checked={fields.terms}
                      onChange={set("terms")}
                      onBlur={handleBlur("terms")}
                      style={{
                        width: "16px",
                        height: "16px",
                        cursor: "pointer",
                        accentColor: "#f05a5a",
                      }}
                    />
                    <label
                      htmlFor="terms"
                      style={{
                        fontSize: "0.85rem",
                        cursor: "pointer",
                        marginBottom: 0,
                      }}
                    >
                      I agree to the{" "}
                      <a
                        href="#terms"
                        style={{ color: "#f05a5a", fontWeight: 600 }}
                      >
                        Terms &amp; Conditions
                      </a>
                    </label>
                  </div>
                  <small className="field-error">{errors.terms || ""}</small>
                </div>

                {/* successMsg + apiError inline blocks removed — now show as toast */}

                <button
                  ref={btnRef}
                  type="submit"
                  className="btn-submit"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <i className="fa-solid fa-spinner fa-spin me-2"></i>
                      Registering...
                    </>
                  ) : (
                    "Register"
                  )}
                </button>

                <p className="switch-auth">
                  Already have an account? – <Link to="/login">Login</Link>
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

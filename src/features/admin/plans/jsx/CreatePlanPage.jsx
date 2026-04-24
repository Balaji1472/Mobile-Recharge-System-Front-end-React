import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  loadActiveOperators,
  loadActiveCategories,
  createPlan,
} from "../slice/plansSlice";
import { useToast } from "../../../../hooks/useToast";
import "../css/CreatePlanPage.css";

const EMPTY_FORM = {
  categoryId: "",
  operatorId: "",
  planName: "",
  price: "",
  validityDays: "",
  dataBenefits: "",
  callBenefits: "",
  smsBenefits: "",
};

export default function CreatePlanPage() {
  const dispatch = useDispatch();
  const { toast } = useToast();
  const { operators, categories, metaLoading } = useSelector(
    (state) => state.plans,
  );

  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchMeta = async () => {
      try {
        await Promise.all([
          dispatch(loadActiveOperators()).unwrap(),
          dispatch(loadActiveCategories()).unwrap(),
        ]);
      } catch (err) {
        toast(err || "Failed to load form data", "error");
      }
    };
    fetchMeta();
  }, [dispatch]);

  const set = (field) => (e) => {
    setForm((f) => ({ ...f, [field]: e.target.value }));
    setErrors((er) => ({ ...er, [field]: undefined }));
  };

  const validate = () => {
    const err = {};
    if (!form.categoryId) err.categoryId = "Select a category";
    if (!form.operatorId) err.operatorId = "Select an operator";
    if (!form.planName.trim()) err.planName = "Plan name is required";
    if (!form.price || Number(form.price) <= 0)
      err.price = "Enter a positive price";
    if (!form.validityDays || Number(form.validityDays) <= 0)
      err.validityDays = "Enter valid days";
    if (!form.dataBenefits.trim())
      err.dataBenefits = "Data benefits is required";
    if (!form.callBenefits.trim())
      err.callBenefits = "Call benefits is required";
    if (!form.smsBenefits.trim()) err.smsBenefits = "SMS benefits is required";
    return err;
  };

  const handleSubmit = async () => {
    const err = validate();
    if (Object.keys(err).length) {
      setErrors(err);
      return;
    }

    setSubmitting(true);
    try {
      await dispatch(
        createPlan({
          operatorId: Number(form.operatorId),
          categoryId: Number(form.categoryId),
          planName: form.planName.trim(),
          price: Number(form.price),
          validityDays: Number(form.validityDays),
          dataBenefits: form.dataBenefits,
          callBenefits: form.callBenefits,
          smsBenefits: form.smsBenefits,
        }),
      ).unwrap();
      toast("Plan created successfully!", "success");
      setSuccess(true);
      setForm(EMPTY_FORM);
      setErrors({});
      setTimeout(() => setSuccess(false), 3500);
    } catch (err) {
      toast(err || "Failed to create plan. Please try again.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setForm(EMPTY_FORM);
    setErrors({});
    setSuccess(false);
  };

  return (
    <div>
      <div className="cp-page">
        <div className="cp-header">
          <h1 className="cp-title">Create New Plan</h1>
          <p className="cp-subtitle">Add a new recharge plan to the platform</p>
        </div>

        <div className="cp-card">
          <div className="cp-card-heading">
            <i className="fa-solid fa-plus" />
            <span>Plan Details</span>
          </div>
          <hr className="cp-divider" />

          {success && (
            <div className="cp-success">
              <i className="fa-solid fa-circle-check" />
              Plan created successfully!
            </div>
          )}

          <div className="cp-form-grid">
            <div className="cp-field">
              <label className="cp-label">
                Category <span>*</span>
              </label>
              <select
                className={`cp-select${errors.categoryId ? " error" : ""}`}
                value={form.categoryId}
                onChange={set("categoryId")}
              >
                <option value="" disabled>
                  Select Category
                </option>
                {categories.map((c) => (
                  <option key={c.categoryId} value={c.categoryId}>
                    {c.displayName}
                  </option>
                ))}
              </select>
              {errors.categoryId && (
                <span className="cp-error-text">{errors.categoryId}</span>
              )}
            </div>

            <div className="cp-field">
              <label className="cp-label">
                Operator <span>*</span>
              </label>
              <select
                className={`cp-select${errors.operatorId ? " error" : ""}`}
                value={form.operatorId}
                onChange={set("operatorId")}
              >
                <option value="" disabled>
                  Select Operator
                </option>
                {operators.map((o) => (
                  <option key={o.operatorId} value={o.operatorId}>
                    {o.operatorName}
                  </option>
                ))}
              </select>
              {errors.operatorId && (
                <span className="cp-error-text">{errors.operatorId}</span>
              )}
            </div>

            <div className="cp-field">
              <label className="cp-label">
                Plan Name <span>*</span>
              </label>
              <input
                className={`cp-input${errors.planName ? " error" : ""}`}
                placeholder="Enter Plan Name"
                value={form.planName}
                onChange={set("planName")}
              />
              {errors.planName && (
                <span className="cp-error-text">{errors.planName}</span>
              )}
            </div>

            <div className="cp-field">
              <label className="cp-label">
                Price (₹) <span>*</span>
              </label>
              <input
                className={`cp-input${errors.price ? " error" : ""}`}
                type="number"
                placeholder="Enter Price"
                value={form.price}
                onChange={set("price")}
              />
              {errors.price && (
                <span className="cp-error-text">{errors.price}</span>
              )}
            </div>

            <div className="cp-field">
              <label className="cp-label">
                Validity (Days) <span>*</span>
              </label>
              <input
                className={`cp-input${errors.validityDays ? " error" : ""}`}
                type="number"
                placeholder="Enter Validity"
                value={form.validityDays}
                onChange={set("validityDays")}
              />
              {errors.validityDays && (
                <span className="cp-error-text">{errors.validityDays}</span>
              )}
            </div>

            <div className="cp-field">
              <label className="cp-label">
                Data Benefits <span>*</span>
              </label>
              <input
                className={`cp-input${errors.dataBenefits ? " error" : ""}`}
                placeholder="e.g. 2GB/Day or Unlimited or NA"
                value={form.dataBenefits}
                onChange={set("dataBenefits")}
              />
              {errors.dataBenefits && (
                <span className="cp-error-text">{errors.dataBenefits}</span>
              )}
            </div>

            <div className="cp-field cp-half">
              <label className="cp-label">
                Call Benefits <span>*</span>
              </label>
              <input
                className={`cp-input${errors.callBenefits ? " error" : ""}`}
                placeholder="e.g. Unlimited or 100 Mins/Day or NA"
                value={form.callBenefits}
                onChange={set("callBenefits")}
              />
              {errors.callBenefits && (
                <span className="cp-error-text">{errors.callBenefits}</span>
              )}
            </div>

            <div className="cp-field">
              <label className="cp-label">
                SMS Benefits <span>*</span>
              </label>
              <input
                className={`cp-input${errors.smsBenefits ? " error" : ""}`}
                placeholder="e.g. 100 SMS/Day or NA"
                value={form.smsBenefits}
                onChange={set("smsBenefits")}
              />
              {errors.smsBenefits && (
                <span className="cp-error-text">{errors.smsBenefits}</span>
              )}
            </div>
          </div>

          <div className="cp-form-footer">
            <button
              className="cp-btn-submit"
              onClick={handleSubmit}
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <i className="fa-solid fa-spinner fa-spin" /> Creating…
                </>
              ) : (
                <>
                  <i className="fa-solid fa-circle-check" /> Create Plan
                </>
              )}
            </button>
            <button className="cp-btn-reset" onClick={handleReset}>
              <i className="fa-solid fa-rotate-left" /> Reset
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

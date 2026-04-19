import React, { useEffect, useState } from 'react';
import AdminLayout from '../../components/AdminLayout/AdminLayout';
import api from '../../api/axios';
import { useToast } from '../../hooks/useToast';
import './CreatePlanPage.css';

const EMPTY_FORM = {
  categoryId: '',
  operatorId: '',
  planName: '',
  price: '',
  validityDays: '',
  dataBenefits: '',
  callBenefits: '',
  smsBenefits: '',
};

export default function CreatePlanPage({ sidebarOpen, onSidebarClose }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [operators, setOperators] = useState([]);
  const [categories, setCategories] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const { showToast } = useToast(); // Hook initialized

  useEffect(() => {
    const fetchMeta = async () => {
      try {
        const [opsRes, catsRes] = await Promise.all([
          api.get('/operators/active'),
          api.get('/categories'),
        ]);
        setOperators(opsRes.data);
        setCategories(catsRes.data.filter((c) => c.isActive));

        // Pre-select first options
        setForm((f) => ({
          ...f,
          operatorId: opsRes.data[0]?.operatorId ?? '',
          categoryId: catsRes.data.filter((c) => c.isActive)[0]?.categoryId ?? '',
        }));
      } catch (err) {
        // Correctly handle metadata fetch errors
        const backendMessage = err.response?.data?.message || "Failed to load form data";
        showToast(backendMessage, 'error');
        console.error("Fetch Error:", backendMessage);
      }
    };
    fetchMeta();
  }, []);

  const set = (field) => (e) => {
    setForm((f) => ({ ...f, [field]: e.target.value }));
    setErrors((er) => ({ ...er, [field]: undefined }));
  };

  const validate = () => {
    const err = {};
    if (!form.planName.trim()) err.planName = 'Plan name is required';
    if (!form.price || Number(form.price) <= 0) err.price = 'Enter a positive price';
    if (!form.validityDays || Number(form.validityDays) <= 0) err.validityDays = 'Enter valid days';
    if (!form.operatorId) err.operatorId = 'Select an operator';
    if (!form.categoryId) err.categoryId = 'Select a category';
    return err;
  };

  const handleSubmit = async () => {
    const err = validate();
    if (Object.keys(err).length) { setErrors(err); return; }

    setSubmitting(true);
    try {
      await api.post('/plans', {
        operatorId: Number(form.operatorId),
        categoryId: Number(form.categoryId),
        planName: form.planName.trim(),
        price: Number(form.price),
        validityDays: Number(form.validityDays),
        dataBenefits: form.dataBenefits,
        callBenefits: form.callBenefits,
        smsBenefits: form.smsBenefits,
      });

      // Success Feedback via Toast and Local State
      showToast("Plan created successfully!", "success");
      setSuccess(true);

      setForm((f) => ({
        ...EMPTY_FORM,
        operatorId: f.operatorId,
        categoryId: f.categoryId,
      }));
      setTimeout(() => setSuccess(false), 3500);
    } catch (err) {
      // Extract specific backend error message (e.g., BusinessException messages)
      const backendMessage = err.response?.data?.message || "Failed to create plan. Please try again.";
      showToast(backendMessage, 'error');
      console.error("Submission Error:", backendMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setForm((f) => ({
      ...EMPTY_FORM,
      operatorId: f.operatorId,
      categoryId: f.categoryId,
    }));
    setErrors({});
    setSuccess(false);
  };

  const categoryOptions = categories.map((c) => ({ value: c.categoryId, label: c.displayName }));
  const operatorOptions = operators.map((o) => ({ value: o.operatorId, label: o.operatorName }));

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
              <label className="cp-label">Category</label>
              <select className={`cp-select${errors.categoryId ? ' error' : ''}`} value={form.categoryId} onChange={set('categoryId')}>
                <option value="">Select category</option>
                {categoryOptions.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
              {errors.categoryId && <span className="cp-error-text">{errors.categoryId}</span>}
            </div>

            <div className="cp-field">
              <label className="cp-label">Operator</label>
              <select className={`cp-select${errors.operatorId ? ' error' : ''}`} value={form.operatorId} onChange={set('operatorId')}>
                <option value="">Select operator</option>
                {operatorOptions.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
              {errors.operatorId && <span className="cp-error-text">{errors.operatorId}</span>}
            </div>

            <div className="cp-field">
              <label className="cp-label">Plan Name <span>*</span></label>
              <input
                className={`cp-input${errors.planName ? ' error' : ''}`}
                placeholder="Enter Plan Name"
                value={form.planName}
                onChange={set('planName')}
              />
              {errors.planName && <span className="cp-error-text">{errors.planName}</span>}
            </div>

            <div className="cp-field">
              <label className="cp-label">Price (₹) <span>*</span></label>
              <input
                className={`cp-input${errors.price ? ' error' : ''}`}
                type="number"
                placeholder="Enter Price"
                value={form.price}
                onChange={set('price')}
              />
              {errors.price && <span className="cp-error-text">{errors.price}</span>}
            </div>

            <div className="cp-field">
              <label className="cp-label">Validity (Days) <span>*</span></label>
              <input
                className={`cp-input${errors.validityDays ? ' error' : ''}`}
                type="number"
                placeholder="Enter Validity"
                value={form.validityDays}
                onChange={set('validityDays')}
              />
              {errors.validityDays && <span className="cp-error-text">{errors.validityDays}</span>}
            </div>

            <div className="cp-field">
              <label className="cp-label">Data Benefits</label>
              <input
                className="cp-input"
                placeholder="e.g. 2GB/Day or Unlimited"
                value={form.dataBenefits}
                onChange={set('dataBenefits')}
              />
            </div>

            <div className="cp-field cp-half">
              <label className="cp-label">Call Benefits</label>
              <input
                className="cp-input"
                placeholder="e.g. Unlimited or 100 Mins/Day"
                value={form.callBenefits}
                onChange={set('callBenefits')}
              />
            </div>

            <div className="cp-field">
              <label className="cp-label">SMS Benefits</label>
              <input
                className="cp-input"
                placeholder="e.g. 100 SMS/Day"
                value={form.smsBenefits}
                onChange={set('smsBenefits')}
              />
            </div>
          </div>

          <div className="cp-form-footer">
            <button className="cp-btn-submit" onClick={handleSubmit} disabled={submitting}>
              {submitting
                ? <><i className="fa-solid fa-spinner fa-spin" /> Creating…</>
                : <><i className="fa-solid fa-circle-check" /> Create Plan</>}
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
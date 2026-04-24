import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { createOffer } from '../slice/offersSlice';
import { useToast } from '../../../../hooks/useToast';
import '../css/CreateOfferPage.css';

const EMPTY_FORM = {
  title:         '',
  discountType:  '',
  discountValue: '',
  startDate:     '',
  endDate:       '',
};

export default function CreateOfferPage() {
  const dispatch     = useDispatch();
  const { toast }    = useToast();

  const [form, setForm]             = useState(EMPTY_FORM);
  const [errors, setErrors]         = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess]       = useState(false);

  const set = (field) => (e) => {
    setForm((f) => ({ ...f, [field]: e.target.value }));
    setErrors((er) => ({ ...er, [field]: undefined }));
    if (success) setSuccess(false);
  };

  /* ── client-side validation ── */
  const validate = () => {
    const err = {};
    if (!form.title.trim())
      err.title = 'Offer name is required';
    if (!form.discountType)
      err.discountType = 'Please select a discount type';
    if (!form.discountValue || Number(form.discountValue) <= 0)
      err.discountValue = 'Enter a positive discount value';
    if (!form.startDate)
      err.startDate = 'Start date is required';
    if (!form.endDate)
      err.endDate = 'End date is required';
    if (form.startDate && form.endDate && form.startDate > form.endDate)
      err.endDate = 'End date cannot be before start date';
    return err;
  };

  /* ── submit ── */
  const handleSubmit = async () => {
    const err = validate();
    if (Object.keys(err).length) { setErrors(err); return; }

    setSubmitting(true);
    try {
      await dispatch(createOffer({
        title:         form.title.trim(),
        discountType:  form.discountType,
        discountValue: Number(form.discountValue),
        startDate:     form.startDate,
        endDate:       form.endDate,
      })).unwrap();
      toast('Offer created successfully!', 'success');
      setSuccess(true);
      setForm(EMPTY_FORM);
      setErrors({});
      setTimeout(() => setSuccess(false), 3500);
    } catch (err) {
      toast(err || 'Failed to create offer. Please try again.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  /* ── reset ── */
  const handleReset = () => {
    setForm(EMPTY_FORM);
    setErrors({});
    setSuccess(false);
  };

  return (
    <div>
      <div className="co-page">

        <div className="co-header">
          <h1 className="co-title">Create New Offer</h1>
          <p className="co-subtitle">Set up a new promotional offer</p>
        </div>

        <div className="co-card">

          <div className="co-card-heading">
            <i className="fa-solid fa-circle-plus" />
            <span>Offer Details</span>
          </div>

          <hr className="co-divider" />

          {success && (
            <div className="co-success">
              <i className="fa-solid fa-circle-check" />
              Offer created successfully! You can create another one below.
            </div>
          )}

          <div className="co-form-grid">

            <div className="co-field">
              <label className="co-label">Offer Name <span>*</span></label>
              <input
                className={`co-input${errors.title ? ' error' : ''}`}
                placeholder="Enter Offer Name"
                value={form.title}
                onChange={set('title')}
              />
              {errors.title && <span className="co-error-text">{errors.title}</span>}
            </div>

            <div className="co-field">
              <label className="co-label">Discount Type <span>*</span></label>
              <select
                className={`co-select${errors.discountType ? ' error' : ''}`}
                value={form.discountType}
                onChange={set('discountType')}
              >
                <option value="" disabled>Select Type</option>
                <option value="PERCENTAGE">Percentage</option>
                <option value="FLAT">Flat</option>
              </select>
              {errors.discountType && <span className="co-error-text">{errors.discountType}</span>}
            </div>

            <div className="co-field">
              <label className="co-label">Discount Value <span>*</span></label>
              <input
                className={`co-input${errors.discountValue ? ' error' : ''}`}
                type="number"
                placeholder="Enter Discount Value"
                value={form.discountValue}
                onChange={set('discountValue')}
              />
              {errors.discountValue && <span className="co-error-text">{errors.discountValue}</span>}
            </div>

            <div className="co-field co-half">
              <label className="co-label">Start Date <span>*</span></label>
              <input
                className={`co-input${errors.startDate ? ' error' : ''}`}
                type="date"
                value={form.startDate}
                onChange={set('startDate')}
              />
              {errors.startDate && <span className="co-error-text">{errors.startDate}</span>}
            </div>

            <div className="co-field co-half">
              <label className="co-label">End Date <span>*</span></label>
              <input
                className={`co-input${errors.endDate ? ' error' : ''}`}
                type="date"
                value={form.endDate}
                onChange={set('endDate')}
              />
              {errors.endDate && <span className="co-error-text">{errors.endDate}</span>}
            </div>
          </div>

          <div className="co-form-footer">
            <button className="co-btn-submit" onClick={handleSubmit} disabled={submitting}>
              {submitting
                ? <><i className="fa-solid fa-spinner fa-spin" /> Creating…</>
                : <><i className="fa-solid fa-circle-check" /> Create Offer</>}
            </button>
            <button className="co-btn-reset" onClick={handleReset}>
              <i className="fa-solid fa-rotate-left" /> Reset
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
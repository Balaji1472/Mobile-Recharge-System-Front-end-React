import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { Spinner } from '../../components/common';
import { useToast } from '../../hooks/useToast';
import './AllOffersPage.css';

/* ── helpers ─────────────────────────────────────────── */
function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
}

function formatDiscount(type, value) {
  if (!type || value === null || value === undefined) return '—';
  return type === 'PERCENTAGE' ? `${value}% OFF` : `₹${value} Cashback`;
}

const ITEMS_PER_PAGE = 8;

/* ── Status Badge ────────────────────────────────────── */
function StatusBadge({ active }) {
  return (
    <span className={`ao-badge ${active ? 'ao-badge--active' : 'ao-badge--inactive'}`}>
      {active ? 'Active' : 'Inactive'}
    </span>
  );
}

/* ── Edit Offer Modal ────────────────────────────────── */
function EditOfferModal({ offer, onClose, onSaved }) {
  const { showToast } = useToast();

  const [form, setForm] = useState({
    title:         offer.title,
    discountType:  offer.discountType,
    discountValue: String(offer.discountValue),
    startDate:     offer.startDate,
    endDate:       offer.endDate,
  });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const set = (field) => (e) => {
    setForm((f) => ({ ...f, [field]: e.target.value }));
    setErrors((er) => ({ ...er, [field]: undefined }));
  };

  const validate = () => {
    const err = {};
    if (!form.title.trim())
      err.title = 'Offer name is required';
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

  const handleSave = async () => {
    const err = validate();
    if (Object.keys(err).length) { setErrors(err); return; }
    setSaving(true);
    try {
      const { data } = await api.put(`/offers/${offer.offerId}`, {
        title:         form.title.trim(),
        discountType:  form.discountType,
        discountValue: Number(form.discountValue),
        startDate:     form.startDate,
        endDate:       form.endDate,
      });
      showToast('Offer updated successfully!', 'success');
      onSaved(data);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update offer';
      showToast(msg, 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="ao-overlay" onClick={onClose}>
      <div className="ao-modal" onClick={(e) => e.stopPropagation()}>

        <div className="ao-modal-header">
          <div>
            <p className="ao-modal-title">Edit Offer</p>
            <p className="ao-modal-hint">Update offer details below</p>
          </div>
          <button className="ao-modal-close" onClick={onClose}>
            <i className="fa-solid fa-xmark" />
          </button>
        </div>

        <div className="ao-form-grid">

          <div className="ao-field ao-full">
            <label className="ao-label">Offer Name <span>*</span></label>
            <input
              className={`ao-input${errors.title ? ' error' : ''}`}
              placeholder="Enter offer name"
              value={form.title}
              onChange={set('title')}
            />
            {errors.title && <span className="ao-error-text">{errors.title}</span>}
          </div>

          <div className="ao-field">
            <label className="ao-label">Discount Type</label>
            <select className="ao-select" value={form.discountType} onChange={set('discountType')}>
              <option value="PERCENTAGE">Percentage</option>
              <option value="FLAT">Flat</option>
            </select>
          </div>

          <div className="ao-field">
            <label className="ao-label">Discount Value <span>*</span></label>
            <input
              className={`ao-input${errors.discountValue ? ' error' : ''}`}
              type="number"
              placeholder="Enter value"
              value={form.discountValue}
              onChange={set('discountValue')}
            />
            {errors.discountValue && <span className="ao-error-text">{errors.discountValue}</span>}
          </div>

          <div className="ao-field">
            <label className="ao-label">Start Date <span>*</span></label>
            <input
              className={`ao-input${errors.startDate ? ' error' : ''}`}
              type="date"
              value={form.startDate}
              onChange={set('startDate')}
            />
            {errors.startDate && <span className="ao-error-text">{errors.startDate}</span>}
          </div>

          <div className="ao-field">
            <label className="ao-label">End Date <span>*</span></label>
            <input
              className={`ao-input${errors.endDate ? ' error' : ''}`}
              type="date"
              value={form.endDate}
              onChange={set('endDate')}
            />
            {errors.endDate && <span className="ao-error-text">{errors.endDate}</span>}
          </div>
        </div>

        <div className="ao-modal-footer">
          <button className="ao-btn-cancel" onClick={onClose}>Cancel</button>
          <button className="ao-btn-save" onClick={handleSave} disabled={saving}>
            {saving
              ? <><i className="fa-solid fa-spinner fa-spin" /> Saving…</>
              : <><i className="fa-solid fa-check" /> Save Changes</>}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Confirm End Modal ───────────────────────────────── */
function ConfirmEndModal({ offer, onClose, onConfirm, loading }) {
  return (
    <div className="ao-overlay" onClick={!loading ? onClose : undefined}>
      <div className="ao-confirm-modal" onClick={(e) => e.stopPropagation()}>
        <div className="ao-confirm-icon">
          <i className="fa-solid fa-triangle-exclamation" />
        </div>
        <h3 className="ao-confirm-title">End This Offer?</h3>
        <p className="ao-confirm-msg">
          You're about to end <strong>"{offer.title}"</strong>. This will deactivate
          it immediately.
        </p>
        <div className="ao-confirm-actions">
          <button className="ao-btn-cancel" onClick={onClose} disabled={loading}>
            Cancel
          </button>
          <button className="ao-btn-end-confirm" onClick={onConfirm} disabled={loading}>
            {loading
              ? <><i className="fa-solid fa-spinner fa-spin" /> Ending…</>
              : <><i className="fa-solid fa-stop" /> Yes, End Offer</>}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════════════════ */
export default function AllOffersPage() {
  const { showToast } = useToast();
  const navigate      = useNavigate();

  const [offers, setOffers]           = useState([]);
  const [loading, setLoading]         = useState(true);
  const [search, setSearch]           = useState('');
  const [page, setPage]               = useState(1);
  const [editOffer, setEditOffer]     = useState(null);
  const [endTarget, setEndTarget]     = useState(null);
  const [endingId, setEndingId]       = useState(null);
  const [togglingId, setTogglingId]   = useState(null);

  /* ── fetch ── */
  useEffect(() => {
    const fetchOffers = async () => {
      try {
        const res = await api.get('/offers');
        setOffers(res.data);
      } catch (err) {
        const msg = err.response?.data?.message || 'Failed to load offers';
        showToast(msg, 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchOffers();
  }, []);

  /* ── filter + search ── */
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return offers;
    return offers.filter((o) =>
      o.title?.toLowerCase().includes(q) ||
      o.discountType?.toLowerCase().includes(q)
    );
  }, [offers, search]);

  useEffect(() => { setPage(1); }, [search]);

  /* ── pagination ── */
  const totalPages  = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const currentPage = Math.min(page, totalPages);
  const paginated   = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  /* ── toggle activate / deactivate ── */
  const handleToggle = async (offer) => {
    setTogglingId(offer.offerId);
    const endpoint = offer.active ? 'deactivate' : 'activate';
    try {
      await api.put(`/offers/${offer.offerId}/${endpoint}`);
      const label = offer.active ? 'deactivated' : 'activated';
      showToast(`Offer ${label} successfully!`, 'success');
      setOffers((prev) =>
        prev.map((o) => o.offerId === offer.offerId ? { ...o, active: !o.active } : o)
      );
    } catch (err) {
      const msg = err.response?.data?.message || 'Action failed';
      showToast(msg, 'error');
    } finally {
      setTogglingId(null);
    }
  };

  /* ── end offer ── */
  const handleEnd = async () => {
    if (!endTarget) return;
    setEndingId(endTarget.offerId);
    try {
      await api.put(`/offers/${endTarget.offerId}/end`);
      showToast('Offer ended successfully!', 'success');
      setOffers((prev) =>
        prev.map((o) => o.offerId === endTarget.offerId ? { ...o, active: false } : o)
      );
      setEndTarget(null);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to end offer';
      showToast(msg, 'error');
    } finally {
      setEndingId(null);
    }
  };

  /* ── edit saved ── */
  const handleEditSaved = (updated) => {
    setOffers((prev) => prev.map((o) => o.offerId === updated.offerId ? updated : o));
    setEditOffer(null);
  };

  return (
    <div>
      <div className="ao-page">

        <div className="ao-header">
          <h1 className="ao-title">All Offers</h1>
          <p className="ao-subtitle">Manage promotional offers and deals</p>
        </div>

        <div className="ao-card">

          <div className="ao-card-top">
            <div className="ao-card-heading">
              <i className="fa-solid fa-gift" />
              <span>Current Offers</span>
              {!loading && <span className="ao-count">( {filtered.length} )</span>}
            </div>
            <button className="ao-btn-create" onClick={() => navigate('/admin/create-offer')}>
              <i className="fa-solid fa-plus" /> Create Offer
            </button>
          </div>

          <hr className="ao-card-divider" />

          {/* Search */}
          <div className="ao-search-wrap">
            <i className="fa-solid fa-magnifying-glass ao-search-icon" />
            <input
              className="ao-search"
              placeholder="Search by offer name or discount type..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button className="ao-search-clear" onClick={() => setSearch('')}>
                <i className="fa-solid fa-xmark" />
              </button>
            )}
          </div>

          {/* Loading */}
          {loading && (
            <div className="ao-loading">
              <Spinner size="md" />
              <span>Loading offers...</span>
            </div>
          )}

          {/* Table */}
          {!loading && (
            <>
              {filtered.length === 0 ? (
                <div className="ao-empty">
                  <i className="fa-solid fa-gift" />
                  <p>No offers found{search ? ` for "${search}"` : ''}.</p>
                </div>
              ) : (
                <div className="ao-table-wrap">
                  <table className="ao-table">
                    <thead>
                      <tr>
                        <th>OFFER NAME</th>
                        <th>DISCOUNT</th>
                        <th>VALID UNTIL</th>
                        <th>STATUS</th>
                        <th>ACTIONS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginated.map((offer) => (
                        <tr key={offer.offerId}>
                          <td className="ao-td-name">{offer.title}</td>
                          <td>{formatDiscount(offer.discountType, offer.discountValue)}</td>
                          <td>{formatDate(offer.endDate)}</td>
                          <td><StatusBadge active={offer.active} /></td>
                          <td>
                            <div className="ao-actions">

                              {/* Edit */}
                              <button
                                className="ao-btn-edit"
                                onClick={() => setEditOffer(offer)}
                              >
                                <i className="fa-solid fa-pen" /> Edit
                              </button>

                              {/* Activate / Deactivate */}
                              <button
                                className={`ao-btn-toggle ${offer.active ? 'ao-btn-toggle--deactivate' : 'ao-btn-toggle--activate'}`}
                                onClick={() => handleToggle(offer)}
                                disabled={togglingId === offer.offerId}
                              >
                                {togglingId === offer.offerId
                                  ? <i className="fa-solid fa-spinner fa-spin" />
                                  : <i className={`fa-solid ${offer.active ? 'fa-pause' : 'fa-play'}`} />
                                }
                                {offer.active ? 'Deactivate' : 'Activate'}
                              </button>

                              {/* End — only for active offers */}
                              {offer.active && (
                                <button
                                  className="ao-btn-end"
                                  onClick={() => setEndTarget(offer)}
                                >
                                  <i className="fa-solid fa-stop" /> End
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="ao-pagination">
                  <button
                    className="ao-pg-btn"
                    disabled={currentPage === 1}
                    onClick={() => setPage((p) => p - 1)}
                  >
                    <i className="fa-solid fa-chevron-left" />
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                    <button
                      key={n}
                      className={`ao-pg-btn ${currentPage === n ? 'ao-pg-btn--active' : ''}`}
                      onClick={() => setPage(n)}
                    >
                      {n}
                    </button>
                  ))}

                  <button
                    className="ao-pg-btn"
                    disabled={currentPage === totalPages}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    <i className="fa-solid fa-chevron-right" />
                  </button>

                  <span className="ao-pg-info">
                    {(currentPage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, filtered.length)} of {filtered.length}
                  </span>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      {editOffer && (
        <EditOfferModal
          offer={editOffer}
          onClose={() => setEditOffer(null)}
          onSaved={handleEditSaved}
        />
      )}

      {/* Confirm End Modal */}
      {endTarget && (
        <ConfirmEndModal
          offer={endTarget}
          onClose={() => setEndTarget(null)}
          onConfirm={handleEnd}
          loading={endingId === endTarget.offerId}
        />
      )}
    </div>
  );
}
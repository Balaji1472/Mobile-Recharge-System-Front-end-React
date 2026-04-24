import React, { useEffect, useState, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { loadOffers, loadPlans, loadAllMappings, mapOffer, unmapOffer, reset } from '../slice/offersSlice';
import { Spinner } from '../../../../components/common';
import { useToast } from '../../../../hooks/useToast';
import '../css/OfferMappingPage.css';

/* ── helpers ── */
function formatDiscount(type, value) {
  if (!type || value === null || value === undefined) return '—';
  return type === 'PERCENTAGE' ? `${value}% OFF` : `₹${value} Cashback`;
}

function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
}

const ITEMS_PER_PAGE = 8;

/* ── Confirm Unmap Modal ── */
function ConfirmUnmapModal({ mapping, onClose, onConfirm, loading }) {
  return (
    <div className="om-overlay" onClick={!loading ? onClose : undefined}>
      <div className="om-confirm-modal" onClick={(e) => e.stopPropagation()}>
        <div className="om-confirm-icon">
          <i className="fa-solid fa-link-slash" />
        </div>
        <h3 className="om-confirm-title">Unmap This Offer?</h3>
        <p className="om-confirm-msg">
          Remove <strong>"{mapping.offerTitle}"</strong> from plan{' '}
          <strong>"{mapping.planName}"</strong>? This action cannot be undone.
        </p>
        <div className="om-confirm-actions">
          <button className="om-btn-cancel" onClick={onClose} disabled={loading}>Cancel</button>
          <button className="om-btn-unmap-confirm" onClick={onConfirm} disabled={loading}>
            {loading
              ? <><i className="fa-solid fa-spinner fa-spin" /> Unmapping…</>
              : <><i className="fa-solid fa-link-slash" /> Yes, Unmap</>}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════════════════ */
export default function OfferMappingPage() {
  const dispatch   = useDispatch();
  const { toast }  = useToast();

  const { data: allOffers, plans, mappings, metaLoading, mappingsLoading } = useSelector((state) => state.offers);

  // Only active offers can be mapped
  const activeOffers = allOffers.filter(o => o.active);

  /* ── map form ── */
  const [form, setForm]           = useState({ planId: '', offerId: '', priority: '' });
  const [errors, setErrors]       = useState({});
  const [mapping, setMappingBusy] = useState(false);

  /* ── unmap confirm ── */
  const [unmapTarget, setUnmapTarget] = useState(null);
  const [unmappingId, setUnmappingId] = useState(null);

  /* ── table search + pagination ── */
  const [search, setSearch] = useState('');
  const [page, setPage]     = useState(1);

  /* ── fetch on mount ── */
  useEffect(() => {
    dispatch(loadPlans());
    dispatch(loadOffers());
    dispatch(loadAllMappings());
    return () => { dispatch(reset()); };
  }, [dispatch]);

  /* ── form helpers ── */
  const setField = (field) => (e) => {
    setForm((f) => ({ ...f, [field]: e.target.value }));
    setErrors((er) => ({ ...er, [field]: undefined }));
  };

  /* ── validate map form ── */
  const validate = () => {
    const err = {};
    if (!form.planId)  err.planId  = 'Please select a plan';
    if (!form.offerId) err.offerId = 'Please select an offer';
    if (!form.priority || Number(form.priority) < 1 || Number(form.priority) > 4)
      err.priority = 'Priority must be between 1 and 4';
    return err;
  };

  /* ── submit map ── */
  const handleMap = async () => {
    const err = validate();
    if (Object.keys(err).length) { setErrors(err); return; }

    setMappingBusy(true);
    try {
      await dispatch(mapOffer({
        planId:  form.planId,
        payload: { offerId: Number(form.offerId), priority: Number(form.priority) },
      })).unwrap();
      toast('Offer mapped to plan successfully!', 'success');
      setForm({ planId: '', offerId: '', priority: '' });
      setErrors({});
    } catch (err) {
      toast(err || 'Failed to map offer', 'error');
    } finally {
      setMappingBusy(false);
    }
  };

  /* ── unmap ── */
  const handleUnmap = async () => {
    if (!unmapTarget) return;
    setUnmappingId(unmapTarget.planOfferId);
    try {
      await dispatch(unmapOffer({
        planId:      unmapTarget.planId,
        offerId:     unmapTarget.offerId,
        planOfferId: unmapTarget.planOfferId,
      })).unwrap();
      toast('Offer unmapped from plan successfully!', 'success');
      setUnmapTarget(null);
    } catch (err) {
      toast(err || 'Failed to unmap offer', 'error');
    } finally {
      setUnmappingId(null);
    }
  };

  /* ── filter current mappings table ── */
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return mappings;
    return mappings.filter((m) =>
      m.planName?.toLowerCase().includes(q) ||
      m.offerTitle?.toLowerCase().includes(q)
    );
  }, [mappings, search]);

  useEffect(() => { setPage(1); }, [search]);

  const totalPages  = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const currentPage = Math.min(page, totalPages);
  const paginated   = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  return (
    <div>
      <div className="om-page">

        <div className="om-header">
          <h1 className="om-title">Plan-Offer Mapping</h1>
          <p className="om-subtitle">Link promotional offers to specific recharge plans</p>
        </div>

        {/* ── Section 1: Map Form ── */}
        <div className="om-card">

          <div className="om-card-heading">
            <i className="fa-solid fa-code-branch" />
            <span>Map an Offer to a Plan</span>
          </div>

          <hr className="om-card-divider" />

          {metaLoading ? (
            <div className="om-loading">
              <Spinner size="md" />
              <span>Loading plans and offers...</span>
            </div>
          ) : (
            <>
              <div className="om-map-grid">

                <div className="om-field">
                  <label className="om-label">Select Plan <span>*</span></label>
                  <select
                    className={`om-select${errors.planId ? ' error' : ''}`}
                    value={form.planId}
                    onChange={setField('planId')}
                  >
                    <option value="">-- Choose Plan --</option>
                    {plans.map((p) => (
                      <option key={p.planId} value={p.planId}>{p.planName}</option>
                    ))}
                  </select>
                  {errors.planId && <span className="om-error-text">{errors.planId}</span>}
                </div>

                <div className="om-field">
                  <label className="om-label">Select Offer <span>*</span></label>
                  <select
                    className={`om-select${errors.offerId ? ' error' : ''}`}
                    value={form.offerId}
                    onChange={setField('offerId')}
                  >
                    <option value="">-- Choose Offer --</option>
                    {activeOffers.map((o) => (
                      <option key={o.offerId} value={o.offerId}>
                        {o.title} — {formatDiscount(o.discountType, o.discountValue)}
                      </option>
                    ))}
                  </select>
                  {errors.offerId && <span className="om-error-text">{errors.offerId}</span>}
                </div>

                <div className="om-field om-field--priority">
                  <label className="om-label">Priority (1–4) <span>*</span></label>
                  <input
                    className={`om-input${errors.priority ? ' error' : ''}`}
                    type="number"
                    min="1"
                    max="4"
                    placeholder="e.g. 1"
                    value={form.priority}
                    onChange={setField('priority')}
                  />
                  {errors.priority && <span className="om-error-text">{errors.priority}</span>}
                </div>
              </div>

              <div className="om-map-footer">
                <button className="om-btn-map" onClick={handleMap} disabled={mapping}>
                  {mapping
                    ? <><i className="fa-solid fa-spinner fa-spin" /> Mapping…</>
                    : <><i className="fa-solid fa-link" /> Map Offer</>}
                </button>
              </div>
            </>
          )}
        </div>

        {/* ── Section 2: Current Mappings table ── */}
        <div className="om-card">

          <div className="om-card-heading">
            <i className="fa-solid fa-list" />
            <span>Current Mappings</span>
            {!mappingsLoading && <span className="om-count">( {filtered.length} )</span>}
          </div>

          <hr className="om-card-divider" />

          <div className="om-search-wrap">
            <i className="fa-solid fa-magnifying-glass om-search-icon" />
            <input
              className="om-search"
              placeholder="Search by plan or offer name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button className="om-search-clear" onClick={() => setSearch('')}>
                <i className="fa-solid fa-xmark" />
              </button>
            )}
          </div>

          {mappingsLoading && (
            <div className="om-loading">
              <Spinner size="md" />
              <span>Loading mappings...</span>
            </div>
          )}

          {!mappingsLoading && (
            <>
              {filtered.length === 0 ? (
                <div className="om-empty">
                  <i className="fa-solid fa-link-slash" />
                  <p>
                    {search
                      ? `No mappings found for "${search}".`
                      : 'No offer mappings exist yet. Map an offer above to get started.'}
                  </p>
                </div>
              ) : (
                <div className="om-table-wrap">
                  <table className="om-table">
                    <thead>
                      <tr>
                        <th>PLAN</th>
                        <th>LINKED OFFER</th>
                        <th>DISCOUNT</th>
                        <th>VALID UNTIL</th>
                        <th>PRIORITY</th>
                        <th>STATUS</th>
                        <th>ACTIONS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginated.map((m) => (
                        <tr key={m.planOfferId}>
                          <td className="om-td-plan">{m.planName}</td>
                          <td className="om-td-offer">{m.offerTitle}</td>
                          <td>{formatDiscount(m.discountType, m.discountValue)}</td>
                          <td className="om-td-date">{formatDate(m.endDate)}</td>
                          <td><span className="om-priority-badge">P{m.priority}</span></td>
                          <td>
                            <span className={`om-status-badge ${m.offerIsActive ? 'om-status--active' : 'om-status--inactive'}`}>
                              {m.offerIsActive ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td>
                            <button
                              className="om-btn-unmap"
                              onClick={() => setUnmapTarget(m)}
                              disabled={unmappingId === m.planOfferId}
                            >
                              {unmappingId === m.planOfferId
                                ? <i className="fa-solid fa-spinner fa-spin" />
                                : <i className="fa-solid fa-link-slash" />}
                              Unmap
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {totalPages > 1 && (
                <div className="om-pagination">
                  <button className="om-pg-btn" disabled={currentPage === 1} onClick={() => setPage((p) => p - 1)}>
                    <i className="fa-solid fa-chevron-left" />
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                    <button key={n} className={`om-pg-btn ${currentPage === n ? 'om-pg-btn--active' : ''}`} onClick={() => setPage(n)}>
                      {n}
                    </button>
                  ))}
                  <button className="om-pg-btn" disabled={currentPage === totalPages} onClick={() => setPage((p) => p + 1)}>
                    <i className="fa-solid fa-chevron-right" />
                  </button>
                  <span className="om-pg-info">
                    {(currentPage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, filtered.length)} of {filtered.length}
                  </span>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {unmapTarget && (
        <ConfirmUnmapModal
          mapping={unmapTarget}
          onClose={() => setUnmapTarget(null)}
          onConfirm={handleUnmap}
          loading={unmappingId === unmapTarget.planOfferId}
        />
      )}
    </div>
  );
}
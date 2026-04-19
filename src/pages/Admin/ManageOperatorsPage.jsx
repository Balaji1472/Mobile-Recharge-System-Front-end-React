import React, { useEffect, useState } from 'react';
import AdminLayout from '../../components/AdminLayout/AdminLayout';
import { Spinner } from '../../components/common';
import api from '../../api/axios';
import { useToast } from '../../hooks/useToast'; // Import useToast
import './ManageOperatorsPage.css';

/* ── Operator logo map (local assets) ── */
import airtelLogo from '../../assets/operators/airtel-logo.webp';
import jioLogo     from '../../assets/operators/Jio-logo.webp';
import viLogo      from '../../assets/operators/VI-logo.webp';
import bsnlLogo    from '../../assets/operators/Bsnl-logo.webp';

const LOGO_MAP = {
  AIRTEL: airtelLogo,
  JIO:     jioLogo,
  VI:      viLogo,
  BSNL:    bsnlLogo,
};

const ITEMS_PER_PAGE = 8;

/* ── Helpers ── */
function getLogo(name) {
  return LOGO_MAP[(name || '').toUpperCase()] ?? null;
}

function OperatorLogo({ name, className, fallbackClass }) {
  const src = getLogo(name);
  if (src) return <img src={src} alt={name} className={className} />;
  return (
    <div className={fallbackClass}>
      {(name || '?').slice(0, 2).toUpperCase()}
    </div>
  );
}

function StatusBadge({ status }) {
  const active = status === 'ACTIVE';
  return (
    <span className={`mo-badge ${active ? 'mo-badge--active' : 'mo-badge--inactive'}`}>
      {active ? 'Active' : 'Inactive'}
    </span>
  );
}

/* ══════════════════════════════════════════════════════
   ADD OPERATOR MODAL
══════════════════════════════════════════════════════ */
function AddOperatorModal({ onClose, onSaved }) {
  const { showToast } = useToast(); // Initialize toast
  const [name, setName]       = useState('');
  const [nameErr, setNameErr] = useState('');
  const [saving, setSaving]   = useState(false);

  const handleSave = async () => {
    if (!name.trim()) { setNameErr('Operator name is required'); return; }
    setSaving(true);
    try {
      const { data } = await api.post('/operators', {
        operatorName: name.trim(),
        status: 'ACTIVE',
      });
      showToast("Operator added successfully!", "success"); // Success Toast
      onSaved(data);
    } catch (err) {
      const backendMessage = err.response?.data?.message || "Error adding operator";
      showToast(backendMessage, 'error'); // Error Toast
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mo-overlay" onClick={onClose}>
      <div className="mo-modal" onClick={(e) => e.stopPropagation()}>
        <div className="mo-modal-header">
          <div>
            <p className="mo-modal-title">Add Operator</p>
            <p className="mo-modal-hint">Register a new network operator</p>
          </div>
          <button className="mo-modal-close" onClick={onClose}>
            <i className="fa-solid fa-xmark" />
          </button>
        </div>

        <div className="mo-modal-body">
          <div className="mo-field">
            <label className="mo-label">
              Operator Name <span>*</span>
            </label>
            <input
              className={`mo-input${nameErr ? ' error' : ''}`}
              placeholder="e.g. Airtel, Jio, Vi, BSNL"
              value={name}
              onChange={(e) => { setName(e.target.value); setNameErr(''); }}
            />
            {nameErr && <span className="mo-error-text">{nameErr}</span>}
          </div>
        </div>

        <div className="mo-modal-footer">
          <button className="mo-btn-cancel" onClick={onClose}>Cancel</button>
          <button className="mo-btn-save" onClick={handleSave} disabled={saving}>
            {saving
              ? <><i className="fa-solid fa-spinner fa-spin" /> Saving…</>
              : <><i className="fa-solid fa-check" /> Add Operator</>}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   EDIT OPERATOR MODAL
══════════════════════════════════════════════════════ */
function EditOperatorModal({ operator, onClose, onSaved }) {
  const { showToast } = useToast(); // Initialize toast
  const [name, setName]       = useState(operator.operatorName);
  const [nameErr, setNameErr] = useState('');
  const [saving, setSaving]   = useState(false);
  const [toggling, setToggling] = useState(false);

  const isActive = operator.status === 'ACTIVE';

  const handleSave = async () => {
    if (!name.trim()) { setNameErr('Operator name is required'); return; }
    setSaving(true);
    try {
      const { data } = await api.put(`/operators/${operator.operatorId}`, {
        operatorName: name.trim(),
        status: operator.status,
      });
      showToast("Operator updated successfully!", "success"); // Success Toast
      onSaved(data);
    } catch (err) {
      const backendMessage = err.response?.data?.message || "Failed to update operator";
      showToast(backendMessage, 'error'); // Error Toast
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async () => {
    setToggling(true);
    try {
      const endpoint = isActive ? 'deactivate' : 'activate';
      await api.put(`/operators/${operator.operatorId}/${endpoint}`);
      showToast(`Operator ${isActive ? 'deactivated' : 'activated'} successfully!`, "success"); // Success Toast
      onSaved({ ...operator, operatorName: name.trim(), status: isActive ? 'INACTIVE' : 'ACTIVE' });
    } catch (err) {
      const backendMessage = err.response?.data?.message || "Failed to change status";
      showToast(backendMessage, 'error'); // Error Toast
      console.error(err);
    } finally {
      setToggling(false);
    }
  };

  return (
    <div className="mo-overlay" onClick={onClose}>
      <div className="mo-modal" onClick={(e) => e.stopPropagation()}>
        <div className="mo-modal-header">
          <div>
            <p className="mo-modal-title">Edit Operator</p>
            <p className="mo-modal-hint">Update operator details and status</p>
          </div>
          <button className="mo-modal-close" onClick={onClose}>
            <i className="fa-solid fa-xmark" />
          </button>
        </div>

        <div className="mo-modal-body">
          <div className="mo-op-preview">
            <OperatorLogo
              name={operator.operatorName}
              className="mo-op-preview-logo"
              fallbackClass="mo-op-preview-fallback"
            />
            <div>
              <p className="mo-op-preview-name">{operator.operatorName}</p>
              <p className="mo-op-preview-id">ID: #{operator.operatorId}</p>
            </div>
          </div>

          <div className="mo-field">
            <label className="mo-label">
              Operator Name <span>*</span>
            </label>
            <input
              className={`mo-input${nameErr ? ' error' : ''}`}
              value={name}
              onChange={(e) => { setName(e.target.value); setNameErr(''); }}
            />
            {nameErr && <span className="mo-error-text">{nameErr}</span>}
          </div>

          <div className="mo-toggle-row">
            <div>
              <p className="mo-toggle-label">Status</p>
              <p className="mo-toggle-hint">
                {isActive
                  ? 'Deactivating will block new plan creation'
                  : 'Activate to allow plan assignment'}
              </p>
            </div>
            <button
              className={`mo-btn-activate ${isActive ? 'mo-btn-activate--on' : 'mo-btn-activate--off'}`}
              onClick={handleToggleStatus}
              disabled={toggling}
            >
              {toggling
                ? <i className="fa-solid fa-spinner fa-spin" />
                : isActive ? 'Active' : 'Inactive'}
            </button>
          </div>
        </div>

        <div className="mo-modal-footer">
          <button className="mo-btn-cancel" onClick={onClose}>Cancel</button>
          <button className="mo-btn-save" onClick={handleSave} disabled={saving}>
            {saving
              ? <><i className="fa-solid fa-spinner fa-spin" /> Saving…</>
              : <><i className="fa-solid fa-check" /> Save Changes</>}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════════════════ */
export default function ManageOperatorsPage({ sidebarOpen, onSidebarClose }) {
  const { showToast } = useToast(); // Initialize toast
  const [operators, setOperators] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [page, setPage]           = useState(1);
  const [modal, setModal]         = useState(null); // null | 'add' | operatorObj

  useEffect(() => {
    const fetchOperators = async () => {
      try {
        const { data } = await api.get('/operators');
        setOperators(data);
      } catch (err) {
        const backendMessage = err.response?.data?.message || "Error fetching operators";
        showToast(backendMessage, 'error'); // Error Toast
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchOperators();
  }, []);

  const totalPages  = Math.max(1, Math.ceil(operators.length / ITEMS_PER_PAGE));
  const currentPage = Math.min(page, totalPages);
  const paginated   = operators.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

  const handleSaved = (saved, isNew) => {
    setOperators((prev) =>
      isNew
        ? [...prev, saved]
        : prev.map((op) => (op.operatorId === saved.operatorId ? saved : op))
    );
    setModal(null);
  };

  const handleAddSaved  = (saved) => handleSaved(saved, true);
  const handleEditSaved = (saved) => handleSaved(saved, false);

  return (
    <div>
      <div className="mo-page">
        <div className="mo-header">
          <h1 className="mo-title">Manage Operators</h1>
          <p className="mo-subtitle">Add, edit or remove network operators from the platform</p>
        </div>

        <div className="mo-card">
          <div className="mo-card-top">
            <div className="mo-card-heading">
              <i className="fa-solid fa-tower-broadcast" />
              <span>Network Operators</span>
            </div>
            <button className="mo-btn-add" onClick={() => setModal('add')}>
              <i className="fa-solid fa-plus" /> Add Operator
            </button>
          </div>
          <hr className="mo-card-divider" />

          {loading ? (
            <div className="mo-loading"><Spinner /></div>
          ) : (
            <>
              <div className="mo-table-wrap">
                <table className="mo-table">
                  <thead>
                    <tr>
                      <th>Logo</th>
                      <th>Operator Name</th>
                      <th>Total Plans</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginated.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="mo-empty">No operators found</td>
                      </tr>
                    ) : (
                      paginated.map((op) => (
                        <tr key={op.operatorId}>
                          <td>
                            <OperatorLogo
                              name={op.operatorName}
                              className="mo-logo"
                              fallbackClass="mo-logo-fallback"
                            />
                          </td>
                          <td className="mo-op-name">{op.operatorName}</td>
                          <td>{op.totalPlans ?? '—'}</td>
                          <td><StatusBadge status={op.status} /></td>
                          <td>
                            <button className="mo-btn-edit" onClick={() => setModal(op)}>
                              <i className="fa-solid fa-pen" /> Edit
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {totalPages > 1 && (
                <div className="mo-pagination">
                  <button
                    className="mo-pg-btn"
                    onClick={() => setPage((p) => p - 1)}
                    disabled={currentPage === 1}
                  >
                    <i className="fa-solid fa-chevron-left" />
                  </button>
                  {pageNumbers.map((n) => (
                    <button
                      key={n}
                      className={`mo-pg-btn${currentPage === n ? ' mo-pg-btn--active' : ''}`}
                      onClick={() => setPage(n)}
                    >
                      {n}
                    </button>
                  ))}
                  <button
                    className="mo-pg-btn"
                    onClick={() => setPage((p) => p + 1)}
                    disabled={currentPage === totalPages}
                  >
                    <i className="fa-solid fa-chevron-right" />
                  </button>
                  <span className="mo-pg-info">
                    {(currentPage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, operators.length)} of {operators.length}
                  </span>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {modal === 'add' && (
        <AddOperatorModal onClose={() => setModal(null)} onSaved={handleAddSaved} />
      )}
      {modal && modal !== 'add' && (
        <EditOperatorModal
          operator={modal}
          onClose={() => setModal(null)}
          onSaved={handleEditSaved}
        />
      )}
    </div>
  );
}
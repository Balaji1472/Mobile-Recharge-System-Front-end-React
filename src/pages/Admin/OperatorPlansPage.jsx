import React, { useEffect, useState } from 'react';
import AdminLayout from '../../components/AdminLayout/AdminLayout';
import { Spinner } from '../../components/common';
import api from '../../api/axios';
import { useToast } from '../../hooks/useToast'; // Import useToast
import './OperatorPlansPage.css';

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

/* Updated row limit to 8 */
const ITEMS_PER_PAGE = 8;

/* ── Operator Logo Cell ── */
function OperatorLogo({ name }) {
  const key = (name || '').toUpperCase();
  const src = LOGO_MAP[key];
  if (src) return <img src={src} alt={name} className="op-logo" />;
  return (
    <div className="op-logo-fallback">
      {(name || '?').slice(0, 2).toUpperCase()}
    </div>
  );
}

/* ── Status Badge ── */
function StatusBadge({ active }) {
  return (
    <span className={`op-badge ${active ? 'op-badge--active' : 'op-badge--inactive'}`}>
      {active ? 'Active' : 'Inactive'}
    </span>
  );
}

/* ══════════════════════════════════════════════════════
    MAIN PAGE
══════════════════════════════════════════════════════ */
export default function OperatorPlansPage({ sidebarOpen, onSidebarClose }) {
  const { showToast } = useToast(); // Initialize toast
  const [allPlans, setAllPlans]       = useState([]);
  const [operators, setOperators]     = useState([]);
  const [loading, setLoading]         = useState(true);
  const [selectedOp, setSelectedOp]   = useState('all');
  const [page, setPage]               = useState(1);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [plansRes, opsRes] = await Promise.all([
          api.get('/plans'),
          api.get('/operators'),
        ]);
        setAllPlans(plansRes.data);
        setOperators(opsRes.data);
      } catch (err) {
        // Show backend error message
        const backendMessage = err.response?.data?.message || "Error fetching data";
        showToast(backendMessage, 'error');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  /* When operator filter changes, re-fetch from dedicated endpoint for accuracy */
  const handleOperatorChange = async (e) => {
    const val = e.target.value;
    setSelectedOp(val);
    setPage(1);

    if (val === 'all') {
      setLoading(true);
      try {
        const { data } = await api.get('/plans');
        setAllPlans(data);
      } catch (err) {
        const backendMessage = err.response?.data?.message || "Error fetching plans";
        showToast(backendMessage, 'error');
        console.error(err);
      } finally {
        setLoading(false);
      }
      return;
    }

    setLoading(true);
    try {
      const { data } = await api.get(`/plans/operator/${val}`);
      setAllPlans(data);
    } catch (err) {
      const backendMessage = err.response?.data?.message || "Error fetching plans for operator";
      showToast(backendMessage, 'error');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const totalPages  = Math.max(1, Math.ceil(allPlans.length / ITEMS_PER_PAGE));
  const currentPage = Math.min(page, totalPages);
  const paginated   = allPlans.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div>
      <div className="op-page">
        {/* Header */}
        <div className="op-header">
          <h1 className="op-title">Operator Plans</h1>
          <p className="op-subtitle">View plans linked to each network operator</p>
        </div>

        {/* Card */}
        <div className="op-card">
          <div className="op-card-top">
            <div className="op-card-heading">
              <i className="fa-solid fa-link" />
              <span>Plans by Operator</span>
            </div>

            {/* Operator filter */}
            <select
              className="op-filter-select"
              value={selectedOp}
              onChange={handleOperatorChange}
            >
              <option value="all">All Operators</option>
              {operators.map((op) => (
                <option key={op.operatorId} value={op.operatorId}>
                  {op.operatorName}
                </option>
              ))}
            </select>
          </div>
          <hr className="op-card-divider" />

          {loading ? (
            <div className="op-loading"><Spinner /></div>
          ) : (
            <>
              <div className="op-table-wrap">
                <table className="op-table">
                  <thead>
                    <tr>
                      <th>Operator</th>
                      <th>Plan Name</th>
                      <th>Price</th>
                      <th>Validity</th>
                      <th>Data</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginated.length === 0 ? (
                      <tr>
                        <td colSpan={6}>
                          <p className="op-empty">No plans found for this operator</p>
                        </td>
                      </tr>
                    ) : (
                      paginated.map((plan) => (
                        <tr key={plan.planId}>
                          <td>
                            <div className="op-cell">
                              <OperatorLogo name={plan.operatorName} />
                              <span className="op-name">{plan.operatorName}</span>
                            </div>
                          </td>
                          <td className="op-plan-name">{plan.planName}</td>
                          <td className="op-price">₹{plan.price}</td>
                          <td>{plan.validityDays ? `${plan.validityDays} Days` : '—'}</td>
                          <td>{plan.dataBenefits || '—'}</td>
                          <td><StatusBadge active={plan.isActive} /></td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="op-pagination">
                  <button
                    className="op-pg-btn"
                    onClick={() => setPage((p) => p - 1)}
                    disabled={currentPage === 1}
                  >
                    <i className="fa-solid fa-chevron-left" />
                  </button>
                  {pageNumbers.map((n) => (
                    <button
                      key={n}
                      className={`op-pg-btn${currentPage === n ? ' op-pg-btn--active' : ''}`}
                      onClick={() => setPage(n)}
                    >
                      {n}
                    </button>
                  ))}
                  <button
                    className="op-pg-btn"
                    onClick={() => setPage((p) => p + 1)}
                    disabled={currentPage === totalPages}
                  >
                    <i className="fa-solid fa-chevron-right" />
                  </button>
                  <span className="op-pg-info">
                    {(currentPage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, allPlans.length)} of {allPlans.length}
                  </span>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import AdminLayout from '../../../../components/AdminLayout/AdminLayout';
import { Spinner } from '../../../../components/common';
import { useToast } from '../../../../hooks/useToast';
import { loadPlans, loadPlansByOperator } from '../../plans/slice/plansSlice';
import { loadOperators } from '../slice/operatorsSlice';
import '../css/OperatorPlansPage.css';

/* ── Operator logo map (local assets) ── */
import airtelLogo from '../../../../assets/operators/airtel-logo.webp';
import jioLogo     from '../../../../assets/operators/Jio-logo.webp';
import viLogo      from '../../../../assets/operators/VI-logo.webp';
import bsnlLogo    from '../../../../assets/operators/Bsnl-logo.webp';

const LOGO_MAP = {
  AIRTEL: airtelLogo,
  JIO:    jioLogo,
  VI:     viLogo,
  BSNL:   bsnlLogo,
};

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

export default function OperatorPlansPage({ sidebarOpen, onSidebarClose }) {
  const dispatch    = useDispatch();
  const { toast }   = useToast();

  // plans lives in plansSlice → state.plans.plans
  const { plans = [], isLoading: plansLoading } = useSelector((state) => state.plans);
  // operators dropdown — safe fallback handles undefined state or wrong key
  const operators = useSelector(
    (state) => state.operators?.operators ?? state.operators?.data ?? []
  );

  const [selectedOp, setSelectedOp] = useState('all');
  const [page, setPage]             = useState(1);

  /* Initial load — fetch all plans + operators for the dropdown in parallel */
  useEffect(() => {
    const init = async () => {
      const [plansResult, opsResult] = await Promise.all([
        dispatch(loadPlans()),
        dispatch(loadOperators()),
      ]);

      if (loadPlans.rejected.match(plansResult)) {
        toast(plansResult.payload || 'Error fetching plans', 'error');
      }
      if (loadOperators.rejected.match(opsResult)) {
        toast(opsResult.payload || 'Error fetching operators', 'error');
      }
    };
    init();
  }, [dispatch]);

  /* Operator filter change */
  const handleOperatorChange = async (e) => {
    const val = e.target.value;
    setSelectedOp(val);
    setPage(1);

    if (val === 'all') {
      const result = await dispatch(loadPlans());
      if (loadPlans.rejected.match(result)) {
        toast(result.payload || 'Error fetching plans', 'error');
      }
    } else {
      const result = await dispatch(loadPlansByOperator(val));
      if (loadPlansByOperator.rejected.match(result)) {
        toast(result.payload || 'Error fetching plans for operator', 'error');
      }
    }
  };

  const totalPages  = Math.max(1, Math.ceil(plans.length / ITEMS_PER_PAGE));
  const currentPage = Math.min(page, totalPages);
  const paginated   = plans.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );
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

          {plansLoading ? (
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
                    {(currentPage - 1) * ITEMS_PER_PAGE + 1}–
                    {Math.min(currentPage * ITEMS_PER_PAGE, plans.length)} of {plans.length}
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
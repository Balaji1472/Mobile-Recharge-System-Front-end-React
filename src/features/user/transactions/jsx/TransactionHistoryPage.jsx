import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux'; 
import { loadMyTransactions, reset } from '../slice/userTransactionsSlice'; 
import { Spinner } from '../../../../components/common';
import { useToast } from '../../../../hooks/useToast';
import '../css/TransactionHistoryPage.css';

/* ── helpers ─────────────────────────────────────────── */
function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
}

function formatAmount(amount) {
  if (amount === null || amount === undefined) return '—';
  return `₹${parseFloat(amount).toLocaleString('en-IN')}`;
}

const ITEMS_PER_PAGE = 8;

/* ── Status Badge ────────────────────────────────────── */
function StatusBadge({ status }) {
  const map = {
    SUCCESS:   'th-badge--success',
    PENDING:   'th-badge--pending',
    FAILED:    'th-badge--failed',
    REFUNDED:  'th-badge--refunded',
  };
  return (
    <span className={`th-badge ${map[status] || 'th-badge--pending'}`}>
      {status ? status.charAt(0) + status.slice(1).toLowerCase() : '—'}
    </span>
  );
}

/* ── Detail Modal ────────────────────────────────────── */
function DetailModal({ txn, onClose }) {
  if (!txn) return null;

  return (
    <div className="th-overlay" onClick={onClose}>
      <div className="th-modal" onClick={(e) => e.stopPropagation()}>

        <div className="th-modal-header">
          <div>
            <p className="th-modal-title">Transaction Details</p>
            <p className="th-modal-hint">Full breakdown of this recharge</p>
          </div>
          <button className="th-modal-close" onClick={onClose}>
            <i className="fa-solid fa-xmark" />
          </button>
        </div>

        <div className="th-modal-body">
          <div className="th-modal-id-row">
            <div className="th-modal-icon">
              <i className="fa-solid fa-receipt" />
            </div>
            <div>
              <p className="th-modal-ref">{txn.transactionReference || '—'}</p>
              <StatusBadge status={txn.rechargeStatus} />
            </div>
          </div>

          <hr className="th-modal-divider" />

          <p className="th-modal-section">Recharge Info</p>
          <div className="th-detail-grid">
            <DetailRow icon="fa-mobile"               label="Mobile"       value={txn.mobileNumber} />
            <DetailRow icon="fa-layer-group"         label="Plan"         value={txn.planName} />
            <DetailRow icon="fa-indian-rupee-sign"   label="Amount"       value={formatAmount(txn.finalAmount)} />
            <DetailRow icon="fa-calendar"            label="Initiated"    value={formatDate(txn.initiatedAt)} />
            <DetailRow icon="fa-calendar-check"      label="Completed"    value={formatDate(txn.completedAt)} />
          </div>

          <hr className="th-modal-divider" />

          <p className="th-modal-section">Payment Info</p>
          <div className="th-detail-grid">
            <DetailRow icon="fa-credit-card"  label="Method"         value={txn.paymentMethod} />
            <DetailRow icon="fa-circle-check" label="Payment Status" value={txn.paymentStatus} />
            <DetailRow icon="fa-rotate"       label="Attempt #"      value={txn.attemptNumber} />
            {txn.failureReason && (
              <DetailRow icon="fa-triangle-exclamation" label="Failure Reason" value={txn.failureReason} />
            )}
          </div>

          <div className="th-modal-actions">
            <button className="th-btn-close" onClick={onClose}>Close</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function DetailRow({ icon, label, value }) {
  return (
    <div className="th-detail-row">
      <span className="th-detail-label">
        <i className={`fa-solid ${icon}`} />
        {label}
      </span>
      <span className="th-detail-value">{value ?? '—'}</span>
    </div>
  );
}

export default function TransactionHistoryPage() {
  const dispatch = useDispatch();
  const { toast } = useToast(); // Renamed to match your hook definition

  // Selector for Redux state
  const { data: transactions, isLoading: loading, isError, message: error } = useSelector(
    (state) => state.userTransactions
  );

  const [search, setSearch]             = useState('');
  const [page, setPage]                 = useState(1);
  const [selectedTxn, setSelectedTxn]   = useState(null);

  /* ── fetch via Redux ── */
  useEffect(() => {
    dispatch(loadMyTransactions());
  }, [dispatch]);

  /* ── error toast side effect ── */
  useEffect(() => {
    if (isError && error) {
      toast(error, 'error');
      dispatch(reset());
    }
  }, [isError, error, toast, dispatch]);

  /* ── filter ── */
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return transactions;
    return transactions.filter((t) =>
      t.transactionReference?.toLowerCase().includes(q) ||
      t.planName?.toLowerCase().includes(q) ||
      String(t.finalAmount).includes(q)
    );
  }, [transactions, search]);

  useEffect(() => { setPage(1); }, [search]);

  /* ── pagination ── */
  const totalPages  = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const currentPage = Math.min(page, totalPages);
  const paginated   = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  return (
    <div className="th-page">

      <div className="th-header">
        <h1 className="th-title">Transaction History</h1>
        <p className="th-subtitle">All your past recharge transactions</p>
      </div>

      {/* Loading */}
      {loading && (
        <div className="th-center-state">
          <Spinner size="md" />
          <span>Loading transactions...</span>
        </div>
      )}

      {/* Error */}
      {isError && !loading && (
        <div className="th-error-row">
          <i className="fa-solid fa-triangle-exclamation" />
          <span>{error}</span>
        </div>
      )}

      {/* Table card */}
      {!loading && !isError && (
        <div className="th-card">

          {/* Search */}
          <div className="th-search-wrap">
            <i className="fa-solid fa-magnifying-glass th-search-icon" />
            <input
              className="th-search"
              placeholder="Search by transaction ref, plan or amount..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button className="th-search-clear" onClick={() => setSearch('')}>
                <i className="fa-solid fa-xmark" />
              </button>
            )}
          </div>

          {filtered.length === 0 ? (
            <div className="th-empty">
              <i className="fa-solid fa-receipt" />
              <p>{search ? `No results for "${search}"` : 'No transactions found yet.'}</p>
            </div>
          ) : (
            <>
              <div className="th-table-wrap">
                <table className="th-table">
                  <thead>
                    <tr>
                      <th>TRANSACTION ID</th>
                      <th>PLAN NAME</th>
                      <th>AMOUNT</th>
                      <th>DATE</th>
                      <th>STATUS</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginated.map((txn) => (
                      <tr key={txn.rechargeId}>
                        <td className="th-td-ref">
                          {txn.transactionReference || `#TXN${String(txn.rechargeId).padStart(7, '0')}`}
                        </td>
                        <td className="th-td-plan">{txn.planName || '—'}</td>
                        <td className="th-td-amount">{formatAmount(txn.finalAmount)}</td>
                        <td className="th-td-date">{formatDate(txn.initiatedAt)}</td>
                        <td><StatusBadge status={txn.rechargeStatus} /></td>
                        <td>
                          <button
                            className="th-btn-view"
                            onClick={() => setSelectedTxn(txn)}
                          >
                            <i className="fa-solid fa-eye" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="th-pagination">
                  <button
                    className="th-pg-btn"
                    disabled={currentPage === 1}
                    onClick={() => setPage((p) => p - 1)}
                  >
                    <i className="fa-solid fa-chevron-left" />
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                    <button
                      key={n}
                      className={`th-pg-btn ${currentPage === n ? 'th-pg-btn--active' : ''}`}
                      onClick={() => setPage(n)}
                    >
                      {n}
                    </button>
                  ))}

                  <button
                    className="th-pg-btn"
                    disabled={currentPage === totalPages}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    <i className="fa-solid fa-chevron-right" />
                  </button>

                  <span className="th-pg-info">
                    {(currentPage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, filtered.length)} of {filtered.length}
                  </span>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Detail Modal */}
      {selectedTxn && (
        <DetailModal txn={selectedTxn} onClose={() => setSelectedTxn(null)} />
      )}
    </div>
  );
}
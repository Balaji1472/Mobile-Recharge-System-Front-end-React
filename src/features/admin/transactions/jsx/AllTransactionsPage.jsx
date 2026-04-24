import React, { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Spinner } from "../../../../components/common";
import { useToast } from "../../../../hooks/useToast";
import { loadTransactions } from "../slice/transactionsSlice";
import "../css/AllTransactionsPage.css";

/* ── helpers ─────────────────────────────────────────── */
function formatDate(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatAmount(amount) {
  if (amount === null || amount === undefined) return "—";
  return `₹${parseFloat(amount).toLocaleString("en-IN")}`;
}

const ITEMS_PER_PAGE = 8;

/* ── Status Badge ────────────────────────────────────── */
function StatusBadge({ status }) {
  const map = {
    SUCCESS: "txn-badge--success",
    PENDING: "txn-badge--pending",
    FAILED: "txn-badge--failed",
    REFUNDED: "txn-badge--refunded",
  };
  return (
    <span className={`txn-badge ${map[status] || "txn-badge--pending"}`}>
      {status}
    </span>
  );
}

/* ── Payment Method Badge ────────────────────────────── */
function MethodBadge({ method }) {
  return <span className="txn-method-badge">{method || "—"}</span>;
}

/* ── Detail Row (modal) ──────────────────────────────── */
function DetailRow({ icon, label, value, children }) {
  return (
    <div className="txn-detail-row">
      <span className="txn-detail-label">
        <i className={`fa-solid ${icon}`}></i>
        {label}
      </span>
      <span className="txn-detail-value">{children ?? value ?? "—"}</span>
    </div>
  );
}

/* ── View Modal ──────────────────────────────────────── */
function ViewTransactionModal({ txn, onClose }) {
  if (!txn) return null;
  return (
    <div className="txn-overlay" onClick={onClose}>
      <div className="txn-modal" onClick={(e) => e.stopPropagation()}>
        <div className="txn-modal-header">
          <div className="txn-modal-title-group">
            <h3 className="txn-modal-title">Transaction Details</h3>
            <p className="txn-modal-hint">Read-only transaction information</p>
          </div>
          <button className="txn-modal-close" onClick={onClose}>
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        <div className="txn-modal-body">
          <div className="txn-modal-id-row">
            <div className="txn-modal-icon">
              <i className="fa-solid fa-receipt"></i>
            </div>
            <div>
              <p className="txn-modal-txnid">
                {txn.transactionReference || "—"}
              </p>
              <StatusBadge status={txn.rechargeStatus} />
            </div>
          </div>

          <hr className="txn-modal-divider" />

          <p className="txn-modal-section-label">Recharge Info</p>
          <div className="txn-detail-grid">
            <DetailRow
              icon="fa-user"
              label="User"
              value={txn.fullName || "—"}
            />
            <DetailRow
              icon="fa-mobile"
              label="Mobile"
              value={txn.mobileNumber}
            />
            <DetailRow
              icon="fa-layer-group"
              label="Plan"
              value={txn.planName}
            />
            <DetailRow
              icon="fa-indian-rupee-sign"
              label="Amount"
              value={formatAmount(txn.finalAmount)}
            />
            <DetailRow
              icon="fa-calendar"
              label="Initiated"
              value={formatDate(txn.initiatedAt)}
            />
            <DetailRow
              icon="fa-calendar-check"
              label="Completed"
              value={formatDate(txn.completedAt)}
            />
          </div>

          <hr className="txn-modal-divider" />

          <p className="txn-modal-section-label">Payment Info</p>
          <div className="txn-detail-grid">
            <DetailRow
              icon="fa-credit-card"
              label="Method"
              value={txn.paymentMethod}
            />
            <DetailRow icon="fa-circle-check" label="Payment Status">
              <StatusBadge status={txn.paymentStatus} />
            </DetailRow>
            <DetailRow
              icon="fa-fingerprint"
              label="Ref No."
              value={txn.transactionReference || "—"}
            />
            <DetailRow
              icon="fa-rotate"
              label="Attempt #"
              value={txn.attemptNumber}
            />
            {txn.failureReason && (
              <DetailRow
                icon="fa-triangle-exclamation"
                label="Failure Reason"
                value={txn.failureReason}
              />
            )}
          </div>

          <hr className="txn-modal-divider" />

          <div className="txn-modal-actions">
            <button className="txn-btn-cancel" onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Stat Card ───────────────────────────────────────── */
function StatCard({ icon, count, label, colorClass }) {
  return (
    <div className={`txn-stat-card ${colorClass}`}>
      <div className="txn-stat-icon">
        <i className={`fa-solid ${icon}`}></i>
      </div>
      <p className="txn-stat-count">{count}</p>
      <p className="txn-stat-label">{label}</p>
    </div>
  );
}

/* ── Export CSV helper ───────────────────────────────── */
function exportCSV(data) {
  const headers = [
    "Transaction Ref",
    "User",
    "Mobile",
    "Plan",
    "Amount",
    "Payment Method",
    "Recharge Status",
    "Payment Status",
    "Date",
  ];
  const rows = data.map((t) => [
    t.transactionReference || "—",
    t.fullName || "—",
    t.mobileNumber,
    t.planName,
    t.finalAmount,
    t.paymentMethod,
    t.rechargeStatus,
    t.paymentStatus,
    formatDate(t.initiatedAt),
  ]);
  const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "transactions.csv";
  a.click();
  URL.revokeObjectURL(url);
}

/* ══════════════════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════════════════ */
export default function AllTransactionsPage() {
  const dispatch = useDispatch();
  const { toast } = useToast();

  const {
    transactions = [],
    isLoading,
    isError,
    message,
  } = useSelector((state) => state.transactions);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [page, setPage] = useState(1);
  const [selectedTxn, setSelectedTxn] = useState(null);

  /* ── fetch ── */
  useEffect(() => {
    const fetch = async () => {
      const result = await dispatch(loadTransactions());
      if (loadTransactions.rejected.match(result)) {
        toast(result.payload || "Failed to load transactions", "error");
      }
    };
    fetch();
  }, [dispatch]);

  /* ── stat counts ── */
  const stats = useMemo(
    () => ({
      success: transactions.filter((t) => t.rechargeStatus === "SUCCESS")
        .length,
      pending: transactions.filter((t) => t.rechargeStatus === "PENDING")
        .length,
      failed: transactions.filter((t) => t.rechargeStatus === "FAILED").length,
      refunded: transactions.filter((t) => t.rechargeStatus === "REFUNDED")
        .length,
    }),
    [transactions],
  );

  /* ── filter + search ── */
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return transactions.filter((t) => {
      const matchStatus =
        statusFilter === "ALL" || t.rechargeStatus === statusFilter;
      const matchSearch =
        !q ||
        [
          t.transactionReference,
          t.fullName,
          t.mobileNumber,
          String(t.finalAmount),
        ].some((val) => (val || "").toLowerCase().includes(q));
      return matchStatus && matchSearch;
    });
  }, [transactions, search, statusFilter]);

  /* Reset to page 1 when filter/search changes */
  useEffect(() => {
    setPage(1);
  }, [search, statusFilter]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE,
  );

  /* ── export ── */
  const handleExport = () => {
    if (filtered.length === 0) {
      toast("No transactions to export", "error");
      return;
    }
    exportCSV(filtered);
    toast("CSV exported successfully", "success");
  };

  const STATUS_FILTERS = ["ALL", "SUCCESS", "PENDING", "FAILED", "REFUNDED"];

  return (
    <div>
      <div className="txn-page">
        {/* Page Header */}
        <div className="txn-header">
          <h1 className="txn-title">All Transactions</h1>
          <p className="txn-subtitle">
            View and manage all platform transactions
          </p>
        </div>

        {/* Stat Cards */}
        {!isLoading && !isError && (
          <div className="txn-stats-row">
            <StatCard
              icon="fa-circle-check"
              count={stats.success}
              label="Successful"
              colorClass="txn-stat--success"
            />
            <StatCard
              icon="fa-hourglass-half"
              count={stats.pending}
              label="Pending"
              colorClass="txn-stat--pending"
            />
            <StatCard
              icon="fa-circle-xmark"
              count={stats.failed}
              label="Failed"
              colorClass="txn-stat--failed"
            />
            <StatCard
              icon="fa-rotate-left"
              count={stats.refunded}
              label="Refunded"
              colorClass="txn-stat--refunded"
            />
          </div>
        )}

        {/* Main Card */}
        <div className="txn-card">
          {/* Card top row */}
          <div className="txn-card-top">
            <div className="txn-card-heading">
              <i className="fa-solid fa-receipt"></i>
              <span>Transaction History</span>
              {!isLoading && (
                <span className="txn-count">( {filtered.length} )</span>
              )}
            </div>
            <button
              className="txn-export-btn"
              onClick={handleExport}
              disabled={isLoading}
            >
              <i className="fa-solid fa-file-csv"></i>
              Export CSV
            </button>
          </div>

          <hr className="txn-card-divider" />

          {/* Search + Status Filter row */}
          <div className="txn-toolbar">
            <div className="txn-search-wrap">
              <i className="fa-solid fa-magnifying-glass txn-search-icon"></i>
              <input
                className="txn-search"
                type="text"
                placeholder="Search by Transaction Ref, User name, Mobile or Amount..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {search && (
                <button
                  className="txn-search-clear"
                  onClick={() => setSearch("")}
                >
                  <i className="fa-solid fa-xmark"></i>
                </button>
              )}
            </div>

            <div className="txn-filter-tabs">
              {STATUS_FILTERS.map((s) => (
                <button
                  key={s}
                  className={`txn-filter-tab ${statusFilter === s ? "txn-filter-tab--active" : ""}`}
                  onClick={() => setStatusFilter(s)}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Loading */}
          {isLoading && (
            <div className="txn-state-row">
              <Spinner size="md" />
              <span>Loading transactions...</span>
            </div>
          )}

          {/* Error */}
          {isError && !isLoading && (
            <div className="txn-error-row">
              <i className="fa-solid fa-triangle-exclamation"></i>
              <span>{message}</span>
            </div>
          )}

          {/* Table */}
          {!isLoading && !isError && (
            <>
              {filtered.length === 0 ? (
                <div className="txn-empty">
                  <i className="fa-solid fa-receipt"></i>
                  <p>
                    No transactions found{search ? ` for "${search}"` : ""}.
                  </p>
                </div>
              ) : (
                <div className="txn-table-wrap">
                  <table className="txn-table">
                    <thead>
                      <tr>
                        <th>TRANSACTION REF</th>
                        <th>USER</th>
                        <th>PLAN</th>
                        <th>AMOUNT</th>
                        <th>PAYMENT METHOD</th>
                        <th>STATUS</th>
                        <th>DATE</th>
                        <th>ACTIONS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginated.map((txn) => (
                        <tr key={txn.rechargeId}>
                          <td className="txn-td-id">
                            {txn.transactionReference || "—"}
                          </td>
                          <td>
                            <div className="txn-td-user">
                              <div className="txn-user-avatar">
                                {txn.fullName
                                  ? txn.fullName
                                      .split(" ")
                                      .map((n) => n[0])
                                      .join("")
                                      .toUpperCase()
                                      .slice(0, 2)
                                  : "?"}
                              </div>
                              <div>
                                <p className="txn-user-id">
                                  {txn.fullName || "—"}
                                </p>
                                <p className="txn-user-mobile">
                                  {txn.mobileNumber}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="txn-td-plan">{txn.planName || "—"}</td>
                          <td className="txn-td-amount">
                            {formatAmount(txn.finalAmount)}
                          </td>
                          <td>
                            <MethodBadge method={txn.paymentMethod} />
                          </td>
                          <td>
                            <StatusBadge status={txn.rechargeStatus} />
                          </td>
                          <td className="txn-td-date">
                            {formatDate(txn.initiatedAt)}
                          </td>
                          <td>
                            <button
                              className="txn-btn-view"
                              onClick={() => setSelectedTxn(txn)}
                            >
                              <i className="fa-solid fa-eye"></i>
                              View
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="txn-pagination">
                  <button
                    className="txn-pg-btn"
                    disabled={page === 1}
                    onClick={() => setPage((p) => p - 1)}
                  >
                    <i className="fa-solid fa-chevron-left"></i>
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (p) => (
                      <button
                        key={p}
                        className={`txn-pg-btn ${page === p ? "txn-pg-btn--active" : ""}`}
                        onClick={() => setPage(p)}
                      >
                        {p}
                      </button>
                    ),
                  )}

                  <button
                    className="txn-pg-btn"
                    disabled={page === totalPages}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    <i className="fa-solid fa-chevron-right"></i>
                  </button>

                  <span className="txn-pg-info">
                    Showing {(page - 1) * ITEMS_PER_PAGE + 1}–
                    {Math.min(page * ITEMS_PER_PAGE, filtered.length)} of{" "}
                    {filtered.length}
                  </span>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* View Modal */}
      {selectedTxn && (
        <ViewTransactionModal
          txn={selectedTxn}
          onClose={() => setSelectedTxn(null)}
        />
      )}
    </div>
  );
}

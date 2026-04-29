import React, { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Spinner } from "../../../../components/common";
import { useToast } from "../../../../hooks/useToast";
import { loadRefunds } from "../slice/transactionsSlice";
import "../css/RefundsPage.css";

function formatDate(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatDateTime(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
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
    PROCESSED: "rfd-badge--processed",
    PENDING: "rfd-badge--pending",
    FAILED: "rfd-badge--failed",
  };
  return (
    <span className={`rfd-badge ${map[status] || "rfd-badge--pending"}`}>
      {status}
    </span>
  );
}

/* ── Detail Row (modal) ──────────────────────────────── */
function DetailRow({ icon, label, value, children }) {
  return (
    <div className="rfd-detail-row">
      <span className="rfd-detail-label">
        <i className={`fa-solid ${icon}`}></i>
        {label}
      </span>
      <span className="rfd-detail-value">{children ?? value ?? "—"}</span>
    </div>
  );
}

/* ── View Modal ──────────────────────────────────────── */
function ViewRefundModal({ refund, onClose }) {
  if (!refund) return null;
  return (
    <div className="rfd-overlay" onClick={onClose}>
      <div className="rfd-modal" onClick={(e) => e.stopPropagation()}>
        <div className="rfd-modal-header">
          <div className="rfd-modal-title-group">
            <h3 className="rfd-modal-title">Refund Details</h3>
            <p className="rfd-modal-hint">Auto-generated refund information</p>
          </div>
          <button className="rfd-modal-close" onClick={onClose}>
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        <div className="rfd-modal-body">
          <div className="rfd-modal-id-row">
            <div className="rfd-modal-icon">
              <i className="fa-solid fa-rotate-left"></i>
            </div>
            <div>
              <p className="rfd-modal-refundid">
                #RFD{String(refund.refundId).padStart(5, "0")}
              </p>
              <StatusBadge status={refund.status} />
            </div>
          </div>

          <hr className="rfd-modal-divider" />

          <p className="rfd-modal-section-label">Refund Info</p>
          <div className="rfd-detail-grid">
            <DetailRow
              icon="fa-user"
              label="User"
              value={refund.fullName || "—"}
            />
            <DetailRow
              icon="fa-mobile"
              label="Mobile"
              value={refund.mobileNumber}
            />
            <DetailRow
              icon="fa-layer-group"
              label="Plan"
              value={refund.planName}
            />
            <DetailRow
              icon="fa-indian-rupee-sign"
              label="Amount"
              value={formatAmount(refund.amount)}
            />
            <DetailRow
              icon="fa-calendar-check"
              label="Processed At"
              value={formatDateTime(refund.processedAt)}
            />
          </div>

          <hr className="rfd-modal-divider" />

          <p className="rfd-modal-section-label">Payment Info</p>
          <div className="rfd-detail-grid">
            <DetailRow
              icon="fa-credit-card"
              label="Payment ID"
              value={`#PAY${String(refund.paymentId).padStart(5, "0")}`}
            />
            <DetailRow
              icon="fa-receipt"
              label="Recharge ID"
              value={`#RCH${String(refund.rechargeId).padStart(5, "0")}`}
            />
            <DetailRow
              icon="fa-wallet"
              label="Method"
              value={refund.paymentMethod}
            />
          </div>

          <hr className="rfd-modal-divider" />

          <div className="rfd-auto-note">
            <i className="fa-solid fa-circle-info"></i>
            <p>
              This refund was <strong>auto-triggered</strong> by the system
              because the payment was successful but the recharge failed.
            </p>
          </div>

          <div className="rfd-modal-actions">
            <button className="rfd-btn-cancel" onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Stat Card ───────────────────────────────────────── */
function StatCard({ icon, count, label, colorClass, sub }) {
  return (
    <div className={`rfd-stat-card ${colorClass}`}>
      <div className="rfd-stat-icon">
        <i className={`fa-solid ${icon}`}></i>
      </div>
      <p className="rfd-stat-count">{count}</p>
      <p className="rfd-stat-label">{label}</p>
      {sub && <p className="rfd-stat-sub">{sub}</p>}
    </div>
  );
}

/* ── Export CSV helper ───────────────────────────────── */
function exportCSV(data) {
  const headers = [
    "Refund ID",
    "Payment ID",
    "Recharge ID",
    "User",
    "Mobile",
    "Plan",
    "Payment Method",
    "Amount",
    "Status",
    "Processed At",
  ];
  const rows = data.map((r) => [
    `#RFD${String(r.refundId).padStart(5, "0")}`,
    r.paymentId,
    r.rechargeId,
    r.fullName || "—",
    r.mobileNumber,
    r.planName,
    r.paymentMethod,
    r.amount,
    r.status,
    formatDate(r.processedAt),
  ]);
  const csv = [headers, ...rows].map((row) => row.join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "refunds.csv";
  a.click();
  URL.revokeObjectURL(url);
}

/* ══════════════════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════════════════ */
export default function RefundsPage() {
  const dispatch = useDispatch();
  const { toast } = useToast();

  const {
    refunds = [],
    isLoading,
    isError,
    message,
  } = useSelector((state) => state.transactions);

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [selectedRefund, setSelectedRefund] = useState(null);

  /* ── fetch ── */
  useEffect(() => {
    const fetch = async () => {
      const result = await dispatch(loadRefunds());
      if (loadRefunds.rejected.match(result)) {
        toast(result.payload || "Failed to load refunds", "error");
      }
    };
    fetch();
  }, [dispatch]);

  /* ── stats ── */
  const stats = useMemo(() => {
    const totalAmount = refunds.reduce(
      (sum, r) => sum + parseFloat(r.amount || 0),
      0,
    );
    return {
      total: refunds.length,
      processed: refunds.filter((r) => r.status === "PROCESSED").length,
      pending: refunds.filter((r) => r.status === "PENDING").length,
      totalAmount,
    };
  }, [refunds]);

  /* ── filtered ── */
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return refunds;
    return refunds.filter((r) =>
      [
        `#RFD${String(r.refundId).padStart(5, "0")}`,
        r.fullName,
        r.mobileNumber,
        String(r.amount),
      ].some((val) => (val || "").toLowerCase().includes(q)),
    );
  }, [refunds, search]);

  /* Reset to page 1 when search changes */
  useEffect(() => {
    setPage(1);
  }, [search]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE,
  );

  /* ── export ── */
  const handleExport = () => {
    if (filtered.length === 0) {
      toast("No refunds to export", "error");
      return;
    }
    exportCSV(filtered);
    toast("Refunds CSV exported successfully", "success");
  };

  return (
    <div>
      <div className="rfd-page">
        {/* Page Header */}
        <div className="rfd-header">
          <h1 className="rfd-title">Refunds</h1>
          <p className="rfd-subtitle">
            All auto-generated refunds from failed recharge transactions
          </p>
        </div>

        {/* Stat Cards */}
        {!isLoading && !isError && (
          <div className="rfd-stats-row">
            <StatCard
              icon="fa-rotate-left"
              count={stats.total}
              label="Total Refunds"
              colorClass="rfd-stat--total"
            />
            <StatCard
              icon="fa-circle-check"
              count={stats.processed}
              label="Processed"
              colorClass="rfd-stat--processed"
            />
            <StatCard
              icon="fa-hourglass-half"
              count={stats.pending}
              label="Pending"
              colorClass="rfd-stat--pending"
            />
            <StatCard
              icon="fa-indian-rupee-sign"
              count={`₹${stats.totalAmount.toLocaleString("en-IN")}`}
              label="Total Refunded"
              colorClass="rfd-stat--amount"
            />
          </div>
        )}

        {/* Info Banner */}
        {!isLoading && !isError && (
          <div className="rfd-info-banner">
            <i className="fa-solid fa-circle-info"></i>
            <span>
              Refunds are <strong>automatically triggered</strong> by the system
              when a payment is successful but the recharge fails. No manual
              action is needed.
            </span>
          </div>
        )}

        {/* Main Card */}
        <div className="rfd-card">
          {/* Card top row */}
          <div className="rfd-card-top">
            <div className="rfd-card-heading">
              <i className="fa-solid fa-rotate-left"></i>
              <span>Refund History</span>
              {!isLoading && (
                <span className="rfd-count">( {filtered.length} )</span>
              )}
            </div>
            <button
              className="rfd-export-btn"
              onClick={handleExport}
              disabled={isLoading}
            >
              <i className="fa-solid fa-file-csv"></i>
              Export CSV
            </button>
          </div>

          <hr className="rfd-card-divider" />

          {/* Search */}
          <div className="rfd-search-wrap">
            <i className="fa-solid fa-magnifying-glass rfd-search-icon"></i>
            <input
              className="rfd-search"
              type="text"
              placeholder="Search by Refund ID, User name, Mobile or Amount..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button
                className="rfd-search-clear"
                onClick={() => setSearch("")}
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            )}
          </div>

          {/* Loading */}
          {isLoading && (
            <div className="rfd-state-row">
              <Spinner size="md" />
              <span>Loading refunds...</span>
            </div>
          )}

          {/* Error */}
          {isError && !isLoading && (
            <div className="rfd-error-row">
              <i className="fa-solid fa-triangle-exclamation"></i>
              <span>{message}</span>
            </div>
          )}

          {/* Table */}
          {!isLoading && !isError && (
            <>
              {filtered.length === 0 ? (
                <div className="rfd-empty">
                  <i className="fa-solid fa-rotate-left"></i>
                  <p>No refunds found{search ? ` for "${search}"` : ""}.</p>
                </div>
              ) : (
                <div className="rfd-table-wrap">
                  <table className="rfd-table">
                    <thead>
                      <tr>
                        <th>REFUND ID</th>
                        <th>USER</th>
                        <th>PLAN</th>
                        <th>AMOUNT</th>
                        <th>PAYMENT METHOD</th>
                        <th>STATUS</th>
                        <th>PROCESSED AT</th>
                        <th>ACTIONS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginated.map((refund) => (
                        <tr key={refund.refundId}>
                          <td className="rfd-td-id">
                            #RFD{String(refund.refundId).padStart(5, "0")}
                          </td>
                          <td>
                            <div className="rfd-td-user">
                              <div className="rfd-user-avatar">
                                {refund.fullName
                                  ? refund.fullName
                                      .split(" ")
                                      .map((n) => n[0])
                                      .join("")
                                      .toUpperCase()
                                      .slice(0, 2)
                                  : "?"}
                              </div>
                              <div>
                                <p className="rfd-user-id">
                                  {refund.fullName || "—"}
                                </p>
                                <p className="rfd-user-mobile">
                                  {refund.mobileNumber}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="rfd-td-plan">
                            {refund.planName || "—"}
                          </td>
                          <td className="rfd-td-amount">
                            {formatAmount(refund.amount)}
                          </td>
                          <td>
                            <span className="rfd-method-badge">
                              {refund.paymentMethod || "—"}
                            </span>
                          </td>
                          <td>
                            <StatusBadge status={refund.status} />
                          </td>
                          <td className="rfd-td-date">
                            {formatDate(refund.processedAt)}
                          </td>
                          <td>
                            <button
                              className="rfd-btn-view"
                              onClick={() => setSelectedRefund(refund)}
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
                <div className="rfd-pagination">
                  <button
                    className="rfd-pg-btn"
                    disabled={page === 1}
                    onClick={() => setPage((p) => p - 1)}
                  >
                    <i className="fa-solid fa-chevron-left"></i>
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (p) => (
                      <button
                        key={p}
                        className={`rfd-pg-btn ${page === p ? "rfd-pg-btn--active" : ""}`}
                        onClick={() => setPage(p)}
                      >
                        {p}
                      </button>
                    ),
                  )}

                  <button
                    className="rfd-pg-btn"
                    disabled={page === totalPages}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    <i className="fa-solid fa-chevron-right"></i>
                  </button>

                  <span className="rfd-pg-info">
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
      {selectedRefund && (
        <ViewRefundModal
          refund={selectedRefund}
          onClose={() => setSelectedRefund(null)}
        />
      )}
    </div>
  );
}

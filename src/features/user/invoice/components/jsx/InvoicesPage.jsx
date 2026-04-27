import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  loadMyInvoices,
  setSelectedInvoice,
  clearSelectedInvoice,
  selectInvoices,
  selectInvoicesLoading,
  selectInvoicesError,
  selectSelectedInvoice,
} from '../../slice/invoiceSlice';
import InvoiceCard from './InvoiceCard';
import InvoiceDetailModal from './InvoiceDetailModal';
import '../css/InvoicesPage.css';

// ── Skeleton loader ───────────────────────────────────────────────────────────
function SkeletonGrid() {
  return (
    <div className="inv-page__skeleton-grid">
      {[1, 2, 3, 4, 5, 6].map((n) => (
        <div className="inv-skeleton-card" key={n}>
          <div className="inv-skeleton-line inv-skeleton-line--short" />
          <div className="inv-skeleton-line inv-skeleton-line--tall inv-skeleton-line--med" />
          <div className="inv-skeleton-line inv-skeleton-line--med" />
          <div className="inv-skeleton-line inv-skeleton-line--short" />
        </div>
      ))}
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function InvoicesPage() {
  const dispatch        = useDispatch();
  const invoices        = useSelector(selectInvoices);
  const loading         = useSelector(selectInvoicesLoading);
  const error           = useSelector(selectInvoicesError);
  const selectedInvoice = useSelector(selectSelectedInvoice);

  useEffect(() => {
    dispatch(loadMyInvoices());
  }, [dispatch]);

  const handleView  = (inv) => dispatch(setSelectedInvoice(inv));
  const handleClose = ()    => dispatch(clearSelectedInvoice());

  // Summary values
  const totalSpent = invoices.reduce((sum, inv) => sum + parseFloat(inv.amountPaid || 0), 0);
  const totalSpentFormatted = totalSpent.toLocaleString('en-IN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });

  return (
    <div className="inv-page">

      {/* ── Page header ── */}
      <div className="inv-page__header">
        <div className="inv-page__header-icon">
          <i className="fa-solid fa-file-invoice" />
        </div>
        <h1 className="inv-page__title">Invoices</h1>
      </div>
      <p className="inv-page__subtitle">All your recharge invoices in one place</p>

      {/* ── Summary chips — only when data is loaded ── */}
      {!loading && !error && invoices.length > 0 && (
        <div className="inv-page__summary">
          <div className="inv-summary-chip">
            <i className="fa-solid fa-receipt" />
            <span><strong>{invoices.length}</strong> Invoice{invoices.length !== 1 ? 's' : ''}</span>
          </div>
          <div className="inv-summary-chip">
            <i className="fa-solid fa-indian-rupee-sign" />
            <span>Total <strong>₹{totalSpentFormatted}</strong> spent</span>
          </div>
        </div>
      )}

      {/* ── States ── */}
      {loading && <SkeletonGrid />}

      {!loading && error && (
        <div className="inv-page__error">
          <i className="fa-solid fa-circle-exclamation" />
          <span>{error}</span>
        </div>
      )}

      {!loading && !error && invoices.length === 0 && (
        <div className="inv-page__empty">
          <i className="fa-solid fa-file-circle-xmark" />
          <p>No invoices found. Your invoices will appear here after a successful recharge.</p>
        </div>
      )}

      {!loading && !error && invoices.length > 0 && (
        <div className="inv-page__grid">
          {invoices.map((inv) => (
            <InvoiceCard key={inv.invoiceId} invoice={inv} onView={handleView} />
          ))}
        </div>
      )}

      {/* ── Detail modal ── */}
      {selectedInvoice && (
        <InvoiceDetailModal invoice={selectedInvoice} onClose={handleClose} />
      )}

    </div>
  );
}
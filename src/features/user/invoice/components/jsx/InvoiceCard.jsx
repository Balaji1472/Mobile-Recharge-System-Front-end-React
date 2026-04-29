import React from 'react';
import '../css/InvoiceCard.css';


export default function InvoiceCard({ invoice, onView }) {

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day:   '2-digit',
      month: 'short',
      year:  'numeric',
    });
  };

  const formatAmount = (amount) => {
    if (amount == null) return '—';
    return parseFloat(amount).toLocaleString('en-IN', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    });
  };

  return (
    <div className="inv-card" onClick={() => onView(invoice)} role="button" tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onView(invoice)}>

      {/* Top: invoice number + date */}
      <div className="inv-card__top">
        <span className="inv-card__invoice-num">INV-{String(invoice.invoiceId).padStart(4, '0')}</span>
        <span className="inv-card__date">
          <i className="fa-regular fa-calendar" style={{ marginRight: 4 }} />
          {formatDate(invoice.generatedAt)}
        </span>
      </div>

      {/* Plan name */}
      <p className="inv-card__plan">{invoice.planName ?? 'Plan'}</p>

      {/* Operator + Mobile */}
      <div className="inv-card__meta">
        {invoice.operatorName && (
          <span className="inv-card__meta-badge">
            <i className="fa-solid fa-tower-broadcast" />
            {invoice.operatorName}
          </span>
        )}
        {invoice.rechargedMobileNumber && (
          <>
            <span className="inv-card__dot" />
            <span className="inv-card__meta-badge">
              <i className="fa-solid fa-mobile-screen" />
              {invoice.rechargedMobileNumber}
            </span>
          </>
        )}
      </div>

      {/* Bottom: amount + view button */}
      <div className="inv-card__bottom">
        <div className="inv-card__amount">
          ₹{formatAmount(invoice.amountPaid)}
          <span>paid</span>
        </div>
        <button
          className="inv-card__view-btn"
          onClick={(e) => { e.stopPropagation(); onView(invoice); }}
        >
          <i className="fa-solid fa-eye" />
          View
        </button>
      </div>

    </div>
  );
}
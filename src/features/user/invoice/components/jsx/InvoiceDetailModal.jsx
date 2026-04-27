import React, { useEffect, useRef } from 'react';
import '../css/InvoiceDetailModal.css';

/**
 * InvoiceDetailModal
 * Full invoice detail popup. Handles PDF download via browser print.
 */
export default function InvoiceDetailModal({ invoice, onClose }) {
  const sheetRef = useRef(null);

  // Escape key closes modal
  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  if (!invoice) return null;

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: '2-digit', month: 'long', year: 'numeric',
    });
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleTimeString('en-IN', {
      hour: '2-digit', minute: '2-digit', hour12: true,
    });
  };

  const formatAmount = (amount) => {
    if (amount == null) return '—';
    return parseFloat(amount).toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const handleDownloadPDF = () => {
    // Build a self-contained printable HTML string and open in a new window
    const content = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8" />
        <title>Invoice INV-${String(invoice.invoiceId).padStart(4, '0')}</title>
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body { font-family: 'Segoe UI', Arial, sans-serif; color: #1a1a1a; background: #fff; padding: 40px; }
          .pdf-header { background: #e41b23; color: #fff; border-radius: 12px; padding: 28px 32px; margin-bottom: 28px; }
          .pdf-header h1 { font-size: 22px; font-weight: 800; margin-bottom: 4px; }
          .pdf-header .sub { font-size: 12px; opacity: 0.75; }
          .pdf-header .amount { font-size: 36px; font-weight: 900; margin-top: 12px; }
          .pdf-section { margin-bottom: 22px; }
          .pdf-section h2 { font-size: 10px; font-weight: 700; color: #e41b23; letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 10px; }
          .pdf-table { width: 100%; border-collapse: collapse; }
          .pdf-table td { font-size: 12px; padding: 7px 10px; border-bottom: 1px solid #f0e8e8; }
          .pdf-table td:first-child { color: #888; width: 42%; }
          .pdf-table td:last-child { font-weight: 600; text-align: right; }
          .pdf-total { background: #f9eded; border-radius: 10px; padding: 14px 16px; display: flex; justify-content: space-between; align-items: center; margin-top: 10px; }
          .pdf-total .label { font-size: 13px; font-weight: 600; color: #666; }
          .pdf-total .value { font-size: 24px; font-weight: 800; }
          .pdf-footer { margin-top: 32px; text-align: center; font-size: 10px; color: #aaa; }
        </style>
      </head>
      <body>
        <div class="pdf-header">
          <div class="sub">INVOICE</div>
          <h1>INV-${String(invoice.invoiceId).padStart(4, '0')}</h1>
          <div class="sub">Generated: ${formatDate(invoice.generatedAt)} ${formatTime(invoice.generatedAt)}</div>
          <div class="amount">₹${formatAmount(invoice.amountPaid)}</div>
        </div>

        <div class="pdf-section">
          <h2>Customer Details</h2>
          <table class="pdf-table">
            <tr><td>Name</td><td>${invoice.userName ?? '—'}</td></tr>
            <tr><td>Email</td><td>${invoice.userEmail ?? '—'}</td></tr>
            <tr><td>Registered Mobile</td><td>${invoice.userMobile ?? '—'}</td></tr>
          </table>
        </div>

        <div class="pdf-section">
          <h2>Recharge Details</h2>
          <table class="pdf-table">
            <tr><td>Recharge ID</td><td>#${invoice.rechargeId}</td></tr>
            <tr><td>Recharged Number</td><td>${invoice.rechargedMobileNumber ?? '—'}</td></tr>
            <tr><td>Operator</td><td>${invoice.operatorName ?? '—'}</td></tr>
            <tr><td>Circle</td><td>${invoice.circle ?? '—'}</td></tr>
            <tr><td>Initiated</td><td>${formatDate(invoice.initiatedAt)} ${formatTime(invoice.initiatedAt)}</td></tr>
            <tr><td>Completed</td><td>${formatDate(invoice.completedAt)} ${formatTime(invoice.completedAt)}</td></tr>
          </table>
        </div>

        <div class="pdf-section">
          <h2>Plan Details</h2>
          <table class="pdf-table">
            <tr><td>Plan Name</td><td>${invoice.planName ?? '—'}</td></tr>
            <tr><td>Validity</td><td>${invoice.validityDays ? invoice.validityDays + ' days' : '—'}</td></tr>
            <tr><td>Data</td><td>${invoice.dataBenefits ?? '—'}</td></tr>
            <tr><td>Calls</td><td>${invoice.callBenefits ?? '—'}</td></tr>
            <tr><td>SMS</td><td>${invoice.smsBenefits ?? '—'}</td></tr>
          </table>
        </div>

        <div class="pdf-section">
          <h2>Payment Details</h2>
          <table class="pdf-table">
            <tr><td>Payment Method</td><td>${invoice.paymentMethod ?? '—'}</td></tr>
            <tr><td>Transaction Ref</td><td>${invoice.transactionReference ?? '—'}</td></tr>
          </table>
        </div>

        <div class="pdf-total">
          <span class="label">Total Amount Paid</span>
          <span class="value">₹${formatAmount(invoice.amountPaid)}</span>
        </div>

        <div class="pdf-footer">
          This is a system-generated invoice. No signature required. &nbsp;|&nbsp; ReUp Mobile Recharge
        </div>
      </body>
      </html>
    `;

    const printWin = window.open('', '_blank', 'width=700,height=900');
    if (!printWin) return;
    printWin.document.write(content);
    printWin.document.close();
    printWin.focus();
    setTimeout(() => {
      printWin.print();
      printWin.close();
    }, 400);
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div className="idm-overlay" onClick={handleOverlayClick} role="dialog" aria-modal="true">
      <div className="idm-sheet" ref={sheetRef}>

        {/* ── Red header band ── */}
        <div className="idm-header">
          <button className="idm-close" onClick={onClose} aria-label="Close">&#x2715;</button>

          <div className="idm-header-top">
            <div className="idm-header-icon">
              <i className="fa-solid fa-file-invoice" />
            </div>
            <div>
              <div className="idm-header-label">Invoice</div>
              <p className="idm-invoice-num">INV-{String(invoice.invoiceId).padStart(4, '0')}</p>
            </div>
          </div>

          <p className="idm-header-amount">
            <sup>₹</sup>{formatAmount(invoice.amountPaid)}
          </p>
          <p className="idm-header-date">
            Generated on {formatDate(invoice.generatedAt)} at {formatTime(invoice.generatedAt)}
          </p>
        </div>

        {/* ── Body ── */}
        <div className="idm-body">

          {/* Customer */}
          <div>
            <p className="idm-section-title">Customer Details</p>
            <div className="idm-section">
              <div className="idm-row">
                <span className="idm-row__label">Name</span>
                <span className="idm-row__value">{invoice.userName ?? '—'}</span>
              </div>
              <div className="idm-row">
                <span className="idm-row__label">Email</span>
                <span className="idm-row__value">{invoice.userEmail ?? '—'}</span>
              </div>
              <div className="idm-row">
                <span className="idm-row__label">Registered Mobile</span>
                <span className="idm-row__value">{invoice.userMobile ?? '—'}</span>
              </div>
            </div>
          </div>

          {/* Recharge */}
          <div>
            <p className="idm-section-title">Recharge Details</p>
            <div className="idm-section">
              <div className="idm-row">
                <span className="idm-row__label">Recharge ID</span>
                <span className="idm-row__value idm-row__value--highlight">#{invoice.rechargeId}</span>
              </div>
              <div className="idm-row">
                <span className="idm-row__label">Recharged Number</span>
                <span className="idm-row__value">{invoice.rechargedMobileNumber ?? '—'}</span>
              </div>
              <div className="idm-row">
                <span className="idm-row__label">Operator</span>
                <span className="idm-row__value">{invoice.operatorName ?? '—'}</span>
              </div>
              {invoice.circle && (
                <div className="idm-row">
                  <span className="idm-row__label">Circle</span>
                  <span className="idm-row__value">{invoice.circle}</span>
                </div>
              )}
              <div className="idm-row">
                <span className="idm-row__label">Initiated</span>
                <span className="idm-row__value">{formatDate(invoice.initiatedAt)} {formatTime(invoice.initiatedAt)}</span>
              </div>
              <div className="idm-row">
                <span className="idm-row__label">Completed</span>
                <span className="idm-row__value">{formatDate(invoice.completedAt)} {formatTime(invoice.completedAt)}</span>
              </div>
            </div>
          </div>

          {/* Plan */}
          <div>
            <p className="idm-section-title">Plan Details</p>
            <div className="idm-section">
              <div className="idm-row">
                <span className="idm-row__label">Plan</span>
                <span className="idm-row__value">
                  <span className="idm-plan-badge">
                    <i className="fa-solid fa-sim-card" />
                    {invoice.planName ?? '—'}
                  </span>
                </span>
              </div>
              <div className="idm-row">
                <span className="idm-row__label">Validity</span>
                <span className="idm-row__value">
                  {invoice.validityDays ? `${invoice.validityDays} days` : '—'}
                </span>
              </div>
              {invoice.dataBenefits && invoice.dataBenefits !== 'NA' && (
                <div className="idm-row">
                  <span className="idm-row__label">Data</span>
                  <span className="idm-row__value">{invoice.dataBenefits}</span>
                </div>
              )}
              {invoice.callBenefits && invoice.callBenefits !== 'NA' && (
                <div className="idm-row">
                  <span className="idm-row__label">Calls</span>
                  <span className="idm-row__value">{invoice.callBenefits}</span>
                </div>
              )}
              {invoice.smsBenefits && invoice.smsBenefits !== 'NA' && (
                <div className="idm-row">
                  <span className="idm-row__label">SMS</span>
                  <span className="idm-row__value">{invoice.smsBenefits}</span>
                </div>
              )}
            </div>
          </div>

          {/* Payment */}
          <div>
            <p className="idm-section-title">Payment Details</p>
            <div className="idm-section">
              <div className="idm-row">
                <span className="idm-row__label">Payment Method</span>
                <span className="idm-row__value">{invoice.paymentMethod ?? '—'}</span>
              </div>
              <div className="idm-row">
                <span className="idm-row__label">Transaction Ref</span>
                <span className="idm-row__value idm-row__value--mono">
                  {invoice.transactionReference ?? '—'}
                </span>
              </div>
            </div>
          </div>

          {/* Total */}
          <div className="idm-amount-row">
            <span className="idm-amount-row__label">Total Amount Paid</span>
            <span className="idm-amount-row__value">
              <sup>₹</sup>{formatAmount(invoice.amountPaid)}
            </span>
          </div>

          {/* Actions */}
          <div className="idm-actions">
            <button className="idm-btn idm-btn--primary" onClick={handleDownloadPDF}>
              <i className="fa-solid fa-download" />
              Download PDF
            </button>
            <button className="idm-btn idm-btn--ghost" onClick={onClose}>
              <i className="fa-solid fa-xmark" />
              Close
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
import React, { useState } from 'react';
import './OfferCard.css';

/* Banner accent colours cycling per card index */
const BANNER_COLORS = ['#f05a5a'];

export default function OfferCard({ offer, index = 0 }) {
  const [sharing, setSharing] = useState(false);

  const {
    title,
    discountType,
    discountValue,
    startDate,
    endDate,
  } = offer;

  /* Format discount label */
  const discountLabel =
    discountType === 'PERCENTAGE'
      ? `${discountValue}% OFF`
      : `₹${discountValue} OFF`;

  /* Format dates */
  const fmt = (iso) =>
    new Date(iso).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });

  const bannerColor = BANNER_COLORS[index % BANNER_COLORS.length];

  /* Share handler */
  const handleShare = async () => {
    const shareText = `🎉 ${title} — Get ${discountLabel}! Valid till ${fmt(endDate)}.`;
    if (navigator.share) {
      try {
        setSharing(true);
        await navigator.share({
          title: `ReUp — ${title}`,
          text: shareText,
          url: window.location.href,
        });
      } catch {
        /* user cancelled */
      } finally {
        setSharing(false);
      }
    } else {
      await navigator.clipboard.writeText(`${shareText}\n${window.location.href}`);
    }
  };

  return (
    <div className="offer-card">
      {/* ── Coloured banner ── */}
      <div className="offer-banner" style={{ backgroundColor: bannerColor }}>
        <span className="offer-banner__discount">{discountLabel}</span>
        <h3 className="offer-banner__title">{title}</h3>
      </div>

      {/* ── Card body ── */}
      <div className="offer-body">
        {/* Discount type badge */}
        <span className={`offer-type-badge offer-type-badge--${discountType.toLowerCase()}`}>
          {discountType === 'PERCENTAGE' ? '% Percentage' : '₹ Flat Discount'}
        </span>

        {/* Validity */}
        <div className="offer-validity">
          <div className="offer-validity__item">
            <span className="offer-validity__label">From</span>
            <span className="offer-validity__value">{fmt(startDate)}</span>
          </div>
          <div className="offer-validity__divider" />
          <div className="offer-validity__item">
            <span className="offer-validity__label">Until</span>
            <span className="offer-validity__value">{fmt(endDate)}</span>
          </div>
        </div>

        {/* Active pill + share */}
        <div className="offer-footer">
          <span className="offer-active-pill">
            <i className="fa-solid fa-circle-check" />
            Active
          </span>
          <button
            className={`share-btn ${sharing ? 'share-btn--sharing' : ''}`}
            onClick={handleShare}
            title="Share Offer"
          >
            <i className="fa-solid fa-share-nodes" />
          </button>
        </div>
      </div>
    </div>
  );
}
import React, { useState } from 'react';
import { useToast } from '../../hooks/useToast';
import './OfferCard.css';

export default function OfferCard({ image, altText, description, couponCode }) {
  const { showToast } = useToast();
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(couponCode);
      setCopied(true);
      showToast(`Code "${couponCode}" copied to clipboard!`, 'success');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      showToast('Failed to copy code.', 'error');
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: 'ReUp Exclusive Offer',
      text: `Use code ${couponCode} — ${description}`,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {
        // user cancelled share — do nothing
      }
    } else {
      // Fallback: copy sharable text to clipboard
      await navigator.clipboard.writeText(
        `${shareData.text}\n${shareData.url}`
      );
      showToast('Offer link copied to clipboard!', 'success');
    }
  };

  return (
    <div className="offer-card">
      <img src={image} alt={altText} className="offer-img" />
      <div className="offer-body">
        <p>{description}</p>
        <div className="coupon-wrapper">
          <button
            className={`coupon-pill ${copied ? 'copied' : ''}`}
            onClick={handleCopy}
            title="Click to copy code"
          >
            <i className={`fa-solid ${copied ? 'fa-check' : 'fa-copy'}`}></i>
            <span>{copied ? 'Copied!' : couponCode}</span>
          </button>
          <button
            className="share-btn"
            onClick={handleShare}
            title="Share Offer"
          >
            <i className="fa-solid fa-share-nodes"></i>
          </button>
        </div>
      </div>
    </div>
  );
}
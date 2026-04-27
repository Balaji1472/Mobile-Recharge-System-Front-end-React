import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { loadOffers } from '../features/admin/offers/slice/offersSlice';
import OfferCard from '../components/Offers/OfferCard';       
import './OffersPage.css';

export default function OffersPage() {
  const dispatch = useDispatch();

  const { data, isLoading, isError, message } = useSelector((state) => state.offers);

  /* Fetch on mount */
  useEffect(() => {
    dispatch(loadOffers());
  }, [dispatch]);

  /* Only show active offers */
  const activeOffers = (data || []).filter((o) => o.active);

  /* ── Render helpers ── */
  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="offers-state-wrapper">
          <div className="offers-spinner" />
          <p className="offers-state-text">Loading offers…</p>
        </div>
      );
    }

    if (isError) {
      return (
        <div className="offers-state-wrapper">
          <i className="fa-solid fa-circle-exclamation offers-state-icon offers-state-icon--error" />
          <p className="offers-state-text">{message}</p>
        </div>
      );
    }

    if (!activeOffers.length) {
      return (
        <div className="offers-state-wrapper">
          <i className="fa-solid fa-tag offers-state-icon" />
          <p className="offers-state-text">No active offers at the moment. Check back soon!</p>
        </div>
      );
    }

    return (
      <div className="row g-4">
        {activeOffers.map((offer, index) => (
          <div className="col-lg-4 col-md-6" key={offer.offerId}>
            <OfferCard offer={offer} index={index} />
          </div>
        ))}
      </div>
    );
  };

  return (
    <>
      {/* ── HERO BANNER ── */}
      <section className="offers-hero-banner">
        <div className="container">
          <h1>Exclusive Offers</h1>
          <p className="text-white-50">Save more on every recharge with ReUp deals</p>
        </div>
      </section>

      {/* ── OFFER CARDS GRID ── */}
      <section className="offers-grid-section">
        <div className="container">
          {renderContent()}
        </div>
      </section>
    </>
  );
}
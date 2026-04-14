import React from 'react';
import OfferCard from '../components/Offers/OfferCard';

// ── Offer images ──────────────────────────────────────────
import offer1       from '../assets/offers/Offer1.png';
import offer2       from '../assets/offers/Offer2.png';
import offer3       from '../assets/offers/Offer 3.png';
import valentineDay from '../assets/offers/Valentine Day.jpg';
import hdfcBank     from '../assets/offers/Hdfc bank.webp';
import axisBank     from '../assets/offers/Axis bank image.png';

import './OffersPage.css';

const offers = [
  {
    image:      offer1,
    altText:    'Festive Offer',
    description:'Get double data and 10% cashback on all unlimited plans for a limited time.',
    couponCode: 'FEST10',
  },
  {
    image:      offer2,
    altText:    'Weekend Special',
    description:'Boost your balance with 20% extra talktime on all recharges above ₹199 this weekend.',
    couponCode: 'WEEK20',
  },
  {
    image:      offer3,
    altText:    'New User Offer',
    description:'Welcome aboard! Enjoy your first recharge for free with a maximum benefit of ₹50.',
    couponCode: 'FREE50',
  },
  {
    image:      valentineDay,
    altText:    'Valentine Offer',
    description:'Stay connected with unlimited calling and 2x data for 48 hours this Valentine\'s weekend.',
    couponCode: 'LOVE2X',
  },
  {
    image:      hdfcBank,
    altText:    'HDFC Bank Offer',
    description:'Celebrate love with a flat 14% cashback on all prepaid recharges made via HDFC Bank.',
    couponCode: 'VALHDFC14',
  },
  {
    image:      axisBank,
    altText:    'Axis Bank Offer',
    description:'Gift your Valentine extra 10GB data on any unlimited plan recharge of ₹299 or above.',
    couponCode: 'AXISLOVE',
  },
];

export default function OffersPage() {
  return (
    <>
      {/* ── HERO BANNER ── */}
      <section className="offers-hero-banner">
        <div className="container">
          <h1>Exclusive Offers</h1>
          <p className="text-white-50">Save more on every recharge with ReUp coupons</p>
        </div>
      </section>

      {/* ── OFFER CARDS GRID ── */}
      <section className="offers-grid-section">
        <div className="container">
          <div className="row g-4">
            {offers.map((offer) => (
              <div className="col-lg-4 col-md-6" key={offer.couponCode}>
                <OfferCard {...offer} />
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
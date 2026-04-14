import React, { useState } from 'react';
import './RechargeFAQ.css';

const RECHARGE_FAQS = [
  {
    q: 'How do I recharge my mobile using ReUp?',
    a: 'Enter your mobile number, select your operator and circle, then click <strong>Proceed to Recharge</strong>.',
  },
  {
    q: 'Is my payment safe on ReUp?',
    a: 'Yes. All transactions are secured with <strong>industry-standard payment gateway encryption</strong>.',
  },
  {
    q: 'What if my recharge fails?',
    a: 'If a recharge fails, the deducted amount is <strong>automatically refunded</strong> to your original payment method within 2–3 business days.',
  },
  {
    q: 'Can I view my past transactions?',
    a: 'Yes. You can access your complete recharge history anytime from the <strong>"My Transactions"</strong> section in your ReUp account dashboard.',
  },
  {
    q: 'Does ReUp support multiple operators?',
    a: 'Absolutely. ReUp supports <strong>all major telecom operators</strong> across India, ensuring seamless prepaid recharge for any circle or plan.',
  },
];

export default function RechargeFAQ() {
  const [openIdx, setOpenIdx] = useState(null);

  const toggle = (i) => setOpenIdx(openIdx === i ? null : i);

  return (
    <section className="recharge-faq-section">
      <h2 className="recharge-faq-title">FAQ</h2>

      <div className="recharge-faq-wrap">
        {RECHARGE_FAQS.map((faq, i) => (
          <div className={`recharge-faq-item ${openIdx === i ? 'open' : ''}`} key={i}>
            <button
              className="recharge-faq-btn"
              onClick={() => toggle(i)}
              aria-expanded={openIdx === i}
            >
              {faq.q}
              <i className="fa-solid fa-chevron-down recharge-faq-icon"></i>
            </button>
            <div className={`recharge-faq-body ${openIdx === i ? 'open' : ''}`}>
              <div
                className="recharge-faq-content"
                dangerouslySetInnerHTML={{ __html: faq.a }}
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

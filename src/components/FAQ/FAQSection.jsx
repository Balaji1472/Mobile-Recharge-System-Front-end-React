import React, { useState } from 'react';
import './FAQSection.css';

const FAQS = [
  {
    q: 'How quickly will my recharge be processed?',
    a: 'Recharges are processed <strong>instantly</strong> in most cases. In rare situations it may take up to 5 minutes. If it takes longer, our support team will assist you.',
  },
  {
    q: 'Does ReUp charge any extra convenience fee?',
    a: 'Absolutely not. ReUp charges <strong>zero platform fees</strong>. You pay exactly the plan price — nothing more, nothing less.',
  },
  {
    q: 'Which operators are supported?',
    a: 'We support all major Indian operators — <strong>Airtel, Jio, VI (Vodafone Idea), and BSNL</strong>. More operators may be added in the future.',
  },
  {
    q: 'What happens if my recharge fails?',
    a: 'If a recharge fails after payment, an <strong>automatic refund</strong> is initiated within 24 hours back to your original payment method.',
  },
  {
    q: 'Is it safe to use ReUp for payments?',
    a: 'Yes. We use <strong>bank-grade SSL encryption</strong> for all transactions. Your payment and personal data are fully protected at every step.',
  },
  {
    q: 'Do I need to create an account to recharge?',
    a: 'You can browse plans freely, but <strong>creating an account</strong> lets you save numbers, view history, and access exclusive offers.',
  },
];

export default function FAQSection() {
  const [openIdx, setOpenIdx] = useState(null);

  const toggle = (i) => setOpenIdx(openIdx === i ? null : i);

  return (
    <section className="faq-section">
      <div className="container">
        <h2 className="sec-title">Frequently Asked Questions</h2>

        <div className="faq-container">
          {FAQS.map((faq, i) => (
            <div className={`faq-card ${openIdx === i ? 'open' : ''}`} key={i}>
              <button
                className="faq-trigger"
                onClick={() => toggle(i)}
                aria-expanded={openIdx === i}
              >
                {faq.q}
                <i className="fa-solid fa-chevron-down faq-icon"></i>
              </button>
              <div className={`faq-body ${openIdx === i ? 'open' : ''}`}>
                <div
                  className="faq-content"
                  dangerouslySetInnerHTML={{ __html: faq.a }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

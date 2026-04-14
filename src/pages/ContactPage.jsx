import React, { useState, useRef } from 'react';
import { useToast } from '../hooks/useToast';
import './ContactPage.css';

const infoItems = [
  { icon: 'fa-envelope', title: 'Email Us',  detail: 'support@recharge.com' },
  { icon: 'fa-phone',    title: 'Call Us',   detail: '+91 1800-REUP-01' },
  { icon: 'fa-location-dot', title: 'Visit Us', detail: 'Tech Park, Bangalore, India' },
];

function validate({ name, email, subject, message }) {
  const errs = {};
  if (!name.trim())        errs.name    = 'Name is required';
  if (!email.trim())       errs.email   = 'Email is required';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))
                           errs.email   = 'Enter a valid email address';
  if (!subject.trim())     errs.subject = 'Subject is required';
  if (!message.trim())     errs.message = 'Message is required';
  return errs;
}

export default function ContactPage() {
  const [fields, setFields]   = useState({ name: '', email: '', subject: '', message: '' });
  const [errors, setErrors]   = useState({});
  const [loading, setLoading] = useState(false);
  const btnRef                = useRef(null);
  const { showToast }         = useToast();

  const set = (key) => (e) => {
    setFields((p) => ({ ...p, [key]: e.target.value }));
    setErrors((p) => ({ ...p, [key]: '' }));
  };

  const shakeBtn = () => {
    btnRef.current?.classList.add('btn-shake');
    setTimeout(() => btnRef.current?.classList.remove('btn-shake'), 500);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate(fields);
    setErrors(errs);
    if (Object.keys(errs).length > 0) { shakeBtn(); return; }

    setLoading(true);
    // Simulate a brief async delay, then show success toast
    await new Promise((r) => setTimeout(r, 800));
    showToast('Message sent! We\'ll get back to you shortly.', 'success');
    setFields({ name: '', email: '', subject: '', message: '' });
    setLoading(false);
  };

  return (
    <main className="contact-main">
      <div className="container py-5">
        <div className="row align-items-stretch">

          {/* ── INFO PANEL ── */}
          <div className="col-lg-4 mb-4 mb-lg-0">
            <div className="contact-info-panel h-100">
              <h2>Get in Touch</h2>
              <p className="mb-5">Have a question? We're here to help you 24/7.</p>

              {infoItems.map((item) => (
                <div className="info-item" key={item.title}>
                  <i className={`fa-solid ${item.icon}`}></i>
                  <div>
                    <h5>{item.title}</h5>
                    <p>{item.detail}</p>
                  </div>
                </div>
              ))}

              <div className="contact-social-box mt-auto">
                <a href="#facebook" aria-label="Facebook"><i className="fa-brands fa-facebook"></i></a>
                <a href="#instagram" aria-label="Instagram"><i className="fa-brands fa-instagram"></i></a>
                <a href="#linkedin" aria-label="LinkedIn"><i className="fa-brands fa-linkedin"></i></a>
              </div>
            </div>
          </div>

          {/* ── FORM CARD ── */}
          <div className="col-lg-8">
            <div className="contact-form-card">
              <h3>Send us a Message</h3>
              <form onSubmit={handleSubmit} className="mt-4" noValidate>
                <div className="row g-3">

                  <div className="col-md-6">
                    <label className="form-label" htmlFor="contactName">Name</label>
                    <input
                      id="contactName"
                      type="text"
                      className={`form-control-custom ${errors.name ? 'input-error' : ''}`}
                      placeholder="Your Name"
                      value={fields.name}
                      onChange={set('name')}
                    />
                    <span className="field-error">{errors.name || ''}</span>
                  </div>

                  <div className="col-md-6">
                    <label className="form-label" htmlFor="contactEmail">Email Address</label>
                    <input
                      id="contactEmail"
                      type="email"
                      className={`form-control-custom ${errors.email ? 'input-error' : ''}`}
                      placeholder="Your Email"
                      value={fields.email}
                      onChange={set('email')}
                    />
                    <span className="field-error">{errors.email || ''}</span>
                  </div>

                  <div className="col-12">
                    <label className="form-label" htmlFor="contactSubject">Subject</label>
                    <input
                      id="contactSubject"
                      type="text"
                      className={`form-control-custom ${errors.subject ? 'input-error' : ''}`}
                      placeholder="How can we help?"
                      value={fields.subject}
                      onChange={set('subject')}
                    />
                    <span className="field-error">{errors.subject || ''}</span>
                  </div>

                  <div className="col-12">
                    <label className="form-label" htmlFor="contactMessage">Message</label>
                    <textarea
                      id="contactMessage"
                      className={`form-control-custom ${errors.message ? 'input-error' : ''}`}
                      rows="5"
                      placeholder="Write your message here..."
                      value={fields.message}
                      onChange={set('message')}
                    />
                    <span className="field-error">{errors.message || ''}</span>
                  </div>

                  <div className="col-12 text-center mt-4">
                    <button
                      ref={btnRef}
                      type="submit"
                      className="btn-submit-contact"
                      disabled={loading}
                    >
                      {loading
                        ? <><i className="fa-solid fa-spinner fa-spin me-2"></i>Sending...</>
                        : 'Send Message'
                      }
                    </button>
                  </div>

                </div>
              </form>
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}
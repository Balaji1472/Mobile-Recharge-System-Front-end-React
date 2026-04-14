import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-top">
          <div className="row">

            <div className="col-lg-4 col-md-12 mb-4 mb-lg-0">
              <div className="footer-brand">
                <p className="brand-name">Re<span>Up</span></p>
                <p className="brand-tag">
                  The fastest and most secure way to recharge your mobile plans
                  across all major operators in India.
                </p>
                <div className="social-links">
                  <a href="#facebook" aria-label="Facebook"><i className="fa-brands fa-facebook-f"></i></a>
                  <a href="#instagram" aria-label="Instagram"><i className="fa-brands fa-instagram"></i></a>
                  <a href="#linkedin" aria-label="LinkedIn"><i className="fa-brands fa-linkedin-in"></i></a>
                </div>
              </div>
            </div>

            <div className="col-lg-2 col-md-4 col-6">
              <p className="links-head">Services</p>
              <ul className="footer-ul">
                <li><a href="#mobile">Mobile Recharge</a></li>
                <li><a href="#data">Data Pack</a></li>
              </ul>
            </div>

            <div className="col-lg-2 col-md-4 col-6">
              <p className="links-head">Support</p>
              <ul className="footer-ul">
                <li><Link to="/contact">Contact Us</Link></li>
                <li><a href="#faq">FAQ</a></li>
              </ul>
            </div>

            <div className="col-lg-4 col-md-4 text-md-end">
              <button
                className="back-to-top-btn"
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              >
                Back to Top <i className="fa-solid fa-arrow-up ms-2"></i>
              </button>
            </div>

          </div>
        </div>

        <hr className="footer-divider" />

        <div className="footer-bottom">
          <div className="row align-items-center">
            <div className="col-md-6 text-center text-md-start mb-2 mb-md-0">
              <span className="copyright">© 2026 ReUp. All Rights Reserved.</span>
            </div>
            <div className="col-md-6 text-center text-md-end">
              <div className="footer-legal">
                <a href="#privacy">Privacy Policy</a>
                <a href="#terms">Terms of Service</a>
                <a href="#refund">Refund Policy</a>
              </div>
            </div>
          </div>
        </div>

      </div>
    </footer>
  );
}
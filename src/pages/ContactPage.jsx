import React, { useState, useRef } from "react";
import { useToast } from "../hooks/useToast";
import emailjs from "@emailjs/browser"; 
import "./ContactPage.css";

const infoItems = [
  { icon: "fa-envelope", title: "Email Us", detail: "support@recharge.com" },
  { icon: "fa-phone", title: "Call Us", detail: "+91 1800-REUP-01" },
  {
    icon: "fa-location-dot",
    title: "Visit Us",
    detail: "Tech Park, Bangalore, India",
  },
];

function validate({ name, email, subject, message }) {
  const errs = {};
  if (!name.trim()) errs.name = "Name is required";
  if (!email.trim()) errs.email = "Email is required";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))
    errs.email = "Enter a valid email address";
  if (!subject.trim()) errs.subject = "Subject is required";
  if (!message.trim()) errs.message = "Message is required";
  return errs;
}

export default function ContactPage() {
  const [fields, setFields] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const btnRef = useRef(null);
  const { toast } = useToast();

  const set = (key) => (e) => {
    setFields((p) => ({ ...p, [key]: e.target.value }));
    setErrors((p) => ({ ...p, [key]: "" }));
  };

  //  NEW: onBlur validation for email
  const validateEmailOnBlur = () => {
    if (!fields.email.trim()) {
      setErrors((p) => ({ ...p, email: "Email is required" }));
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email.trim())) {
      setErrors((p) => ({ ...p, email: "Enter a valid email address" }));
    }
  };

  const shakeBtn = () => {
    btnRef.current?.classList.add("btn-shake");
    setTimeout(() => btnRef.current?.classList.remove("btn-shake"), 500);
  };

  //  ONLY LOGIC CHANGE: EmailJS integration
  const handleSubmit = async (e) => {
    e.preventDefault();

    const errs = validate(fields);
    setErrors(errs);

    if (Object.keys(errs).length > 0) {
      shakeBtn();
      return;
    }

    setLoading(true);

    try {
      await emailjs.send(
        "service_3syewkn",
        "template_8ffv42c",
        {
          name: fields.name,
          email: fields.email,
          subject: fields.subject,
          message: fields.message,
        },
        "dHFz9RX__8XFQi66f",
      );

      toast("Message sent! We'll get back to you shortly.", "success");

      setFields({
        name: "",
        email: "",
        subject: "",
        message: "",
      });
    } catch (error) {
      console.error("EmailJS Error:", error);
      toast("Failed to send message. Try again.", "error");
    }

    setLoading(false);
  };

  return (
    <main className="contact-main">
      <div className="container py-5">
        <div className="row align-items-stretch">
          {/* INFO PANEL */}
          <div className="col-lg-4 mb-4 mb-lg-0">
            <div className="contact-info-panel h-100">
              <h2>Get in Touch</h2>
              <p className="mb-5">
                Have a question? We're here to help you 24/7.
              </p>

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
                <a href="#facebook">
                  <i className="fa-brands fa-facebook"></i>
                </a>
                <a href="#instagram">
                  <i className="fa-brands fa-instagram"></i>
                </a>
                <a href="#linkedin">
                  <i className="fa-brands fa-linkedin"></i>
                </a>
              </div>
            </div>
          </div>

          {/* FORM */}
          <div className="col-lg-8">
            <div className="contact-form-card">
              <h3>Send us a Message</h3>

              <form onSubmit={handleSubmit} className="mt-4" noValidate>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label htmlFor="contactName">
                      Name <span style={{ color: "red" }}>*</span>
                    </label>
                    <input
                      id="contactName"
                      type="text"
                      className={`form-control-custom ${errors.name ? "input-error" : ""}`}
                      placeholder="Your Name" //  kept
                      value={fields.name}
                      onChange={set("name")}
                    />
                    <span className="field-error">{errors.name}</span>
                  </div>

                  <div className="col-md-6">
                    <label htmlFor="contactEmail">
                      Email Address <span style={{ color: "red" }}>*</span>
                    </label>
                    <input
                      id="contactEmail"
                      type="email"
                      className={`form-control-custom ${errors.email ? "input-error" : ""}`}
                      placeholder="Your Email" //  kept
                      value={fields.email}
                      onChange={set("email")}
                      onBlur={validateEmailOnBlur} //  added
                    />
                    <span className="field-error">{errors.email}</span>
                  </div>

                  <div className="col-12">
                    <label htmlFor="contactSubject">
                      Subject <span style={{ color: "red" }}>*</span>
                    </label>
                    <input
                      id="contactSubject"
                      type="text"
                      className={`form-control-custom ${errors.subject ? "input-error" : ""}`}
                      placeholder="How can we help?" //  kept
                      value={fields.subject}
                      onChange={set("subject")}
                    />
                    <span className="field-error">{errors.subject}</span>
                  </div>

                  <div className="col-12">
                    <label htmlFor="contactMessage">
                      Message <span style={{ color: "red" }}>*</span>
                    </label>
                    <textarea
                      id="contactMessage"
                      rows="5"
                      className={`form-control-custom ${errors.message ? "input-error" : ""}`}
                      placeholder="Write your message here..." //  kept
                      value={fields.message}
                      onChange={set("message")}
                    />
                    <span className="field-error">{errors.message}</span>
                  </div>

                  <div className="col-12 text-center mt-4">
                    <button
                      ref={btnRef}
                      type="submit"
                      className="btn-submit-contact"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <i className="fa-solid fa-spinner fa-spin me-2"></i>
                          Sending...
                        </>
                      ) : (
                        "Send Message"
                      )}
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

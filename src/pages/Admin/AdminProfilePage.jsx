import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import AdminLayout from '../../components/AdminLayout/AdminLayout';
import './AdminProfilePage.css';

// Backend sends gender as "MALE" / "FEMALE" / "OTHER" — format for display
function formatGender(gender) {
  if (!gender) return '—';
  return gender.charAt(0).toUpperCase() + gender.slice(1).toLowerCase();
}

// Map display value back to backend enum value for the select
const GENDER_OPTIONS = [
  { label: 'Male',             value: 'MALE' },
  { label: 'Female',           value: 'FEMALE' },
  { label: 'Other',            value: 'OTHER' },
  { label: 'Prefer not to say',value: 'PREFER_NOT_TO_SAY' },
];

export default function AdminProfilePage({ sidebarOpen, onSidebarClose }) {
  const { user } = useSelector((state) => state.auth);
  const [showModal, setShowModal] = useState(false);

  const [form, setForm] = useState({
    fullName:     user?.fullName     || '',
    email:        user?.email        || '',
    mobileNumber: user?.mobileNumber || '',
    gender:       user?.gender       || '',   // stored as "MALE" / "FEMALE" etc.
  });
  const [saving, setSaving] = useState(false);

  const initials = user?.fullName
    ? user.fullName.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'A';

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    // TODO: dispatch updateProfile thunk
    setTimeout(() => {
      setSaving(false);
      setShowModal(false);
    }, 800);
  };

  return (
    <AdminLayout sidebarOpen={sidebarOpen} onSidebarClose={onSidebarClose}>
      <div className="ap-page">

        <div className="ap-header">
          <h1 className="ap-title">Profile</h1>
          <p className="ap-subtitle">View and manage your account details</p>
        </div>

        <div className="ap-card">

          {/* Avatar + name */}
          <div className="ap-avatar-row">
            <div className="ap-avatar">{initials}</div>
            <div className="ap-name-block">
              <h2 className="ap-name">{user?.fullName || '—'}</h2>
              <span className="ap-role-badge">
                <i className="fa-solid fa-shield-halved me-1"></i>
                {user?.role || 'ADMIN'}
              </span>
            </div>
          </div>

          <hr className="ap-divider" />

          {/* Info rows */}
          <div className="ap-info-grid">
            <InfoRow icon="fa-user"        label="Full Name"     value={user?.fullName} />
            <InfoRow icon="fa-envelope"    label="Email Address" value={user?.email} />
            <InfoRow icon="fa-phone"       label="Mobile Number" value={user?.mobileNumber} />
            <InfoRow icon="fa-venus-mars"  label="Gender"        value={formatGender(user?.gender)} />
            <InfoRow icon="fa-user-tag"    label="Role"          value={user?.role} />
            <InfoRow icon="fa-circle-check" label="Status"       value={user?.status} />
          </div>

          <hr className="ap-divider" />

          <button className="ap-edit-btn" onClick={() => setShowModal(true)}>
            <i className="fa-solid fa-pen me-2"></i>
            Edit Profile
          </button>

        </div>
      </div>

      {/* ── Edit Modal ── */}
      {showModal && (
        <div className="ap-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="ap-modal" onClick={(e) => e.stopPropagation()}>

            <div className="ap-modal-header">
              <h3 className="ap-modal-title">Edit Profile</h3>
              <button className="ap-modal-close" onClick={() => setShowModal(false)}>
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            <form onSubmit={handleSave} className="ap-modal-body">

              <div className="ap-field">
                <label htmlFor="fullName">Full Name</label>
                <input id="fullName" name="fullName" type="text"
                  className="ap-input" value={form.fullName}
                  onChange={handleChange} placeholder="Enter full name" />
              </div>

              <div className="ap-field">
                <label htmlFor="email">Email Address</label>
                <input id="email" name="email" type="email"
                  className="ap-input" value={form.email}
                  onChange={handleChange} placeholder="Enter email" />
              </div>

              <div className="ap-field">
                <label htmlFor="mobileNumber">Mobile Number</label>
                <input id="mobileNumber" name="mobileNumber" type="tel"
                  className="ap-input" value={form.mobileNumber}
                  onChange={handleChange} placeholder="Enter mobile number" />
              </div>

              <div className="ap-field">
                <label htmlFor="gender">Gender</label>
                <select id="gender" name="gender"
                  className="ap-input ap-select"
                  value={form.gender} onChange={handleChange}>
                  <option value="">Select gender</option>
                  {GENDER_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              <div className="ap-modal-actions">
                <button type="button" className="ap-btn-cancel" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="ap-btn-save" disabled={saving}>
                  {saving
                    ? <><i className="fa-solid fa-spinner fa-spin me-2"></i>Saving...</>
                    : <><i className="fa-solid fa-floppy-disk me-2"></i>Save Changes</>
                  }
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

function InfoRow({ icon, label, value }) {
  return (
    <div className="ap-info-row">
      <span className="ap-info-label">
        <i className={`fa-solid ${icon}`}></i>
        {label}
      </span>
      <span className="ap-info-value">{value || '—'}</span>
    </div>
  );
}
import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import api from '../../api/axios'; 
import AdminLayout from '../../components/AdminLayout/AdminLayout';
import { useToast } from '../../hooks/useToast'; 
import './AdminProfilePage.css';

function formatGender(gender) {
  if (!gender) return '—';
  return gender.charAt(0).toUpperCase() + gender.slice(1).toLowerCase();
}

const GENDER_OPTIONS = [
  { label: 'Male',              value: 'MALE' },
  { label: 'Female',            value: 'FEMALE' },
  { label: 'Other',             value: 'OTHER' },
  { label: 'Prefer not to say', value: 'PREFER_NOT_TO_SAY' },
];

export default function AdminProfilePage({ sidebarOpen, onSidebarClose }) {
  const dispatch = useDispatch();
  const { showToast } = useToast(); 
  const { user: reduxUser } = useSelector((state) => state.auth);
  
  const [user, setUser] = useState(reduxUser);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ fullName: '', gender: '' });
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const res = await api.get('/auth/profile');
        setUser(res.data);
      } catch (err) {
        const backendMessage = err.response?.data?.message || "Error fetching profile";
        showToast(backendMessage, 'error');
        console.error("Error fetching profile:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const initials = user?.fullName
    ? user.fullName.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'A';

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const openModal = () => {
    setForm({ fullName: user?.fullName || '', gender: user?.gender || '' });
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.put('/auth/profile', {
        fullName: form.fullName,
        gender: form.gender
      });

      setUser(res.data); 
      showToast("Profile updated successfully!", "success"); // Success toast
      setShowModal(false);
    } catch (err) {
      // Capture exact backend error message
      const backendMessage = err.response?.data?.message || "Failed to update profile";
      showToast(backendMessage, 'error');
      console.error("Error updating profile:", err);
    } finally {
      setSaving(false);
    }
  };

  if (loading && !user) {
    return (
      <AdminLayout sidebarOpen={sidebarOpen} onSidebarClose={onSidebarClose}>
        <div className="ap-page">Loading...</div>
      </AdminLayout>
    );
  }

  return (
    <div>
      <div className="ap-page">
        <div className="ap-header">
          <h1 className="ap-title">Profile</h1>
          <p className="ap-subtitle">View and manage your account details</p>
        </div>

        <div className="ap-card">
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

          <div className="ap-info-grid">
            <InfoRow icon="fa-user"         label="Full Name"     value={user?.fullName} />
            <InfoRow icon="fa-envelope"     label="Email Address" value={user?.email} />
            <InfoRow icon="fa-phone"        label="Mobile Number" value={user?.mobileNumber} />
            <InfoRow icon="fa-venus-mars"   label="Gender"        value={formatGender(user?.gender)} />
            <InfoRow icon="fa-user-tag"     label="Role"          value={user?.role} />
            <InfoRow icon="fa-circle-check" label="Status"        value={user?.status} />
          </div>

          <hr className="ap-divider" />

          <button className="ap-edit-btn" onClick={openModal}>
            <i className="fa-solid fa-pen me-2"></i>
            Edit Profile
          </button>
        </div>
      </div>

      {showModal && (
        <div className="ap-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="ap-modal" onClick={(e) => e.stopPropagation()}>
            <div className="ap-modal-header">
              <div className="ap-modal-title-group">
                <h3 className="ap-modal-title">Edit Profile</h3>
                <p className="ap-modal-hint">Only name and gender can be updated</p>
              </div>
              <button className="ap-modal-close" onClick={() => setShowModal(false)}>
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            <form onSubmit={handleSave} className="ap-modal-body">
              <div className="ap-field">
                <label htmlFor="fullName">Full Name</label>
                <input id="fullName" name="fullName" type="text"
                  className="ap-input" value={form.fullName}
                  onChange={handleChange} placeholder="Enter full name" required />
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

              <div className="ap-readonly-notice">
                <i className="fa-solid fa-lock"></i>
                <span>Email and mobile number cannot be changed.</span>
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
    </div>
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
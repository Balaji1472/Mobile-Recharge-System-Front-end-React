import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { loadProfile, saveProfile, reset } from "../slice/adminProfileSlice";
import { useToast } from "../../../../hooks/useToast";
import "../css/AdminProfilePage.css";

function formatGender(gender) {
  if (!gender) return "—";
  return gender.charAt(0).toUpperCase() + gender.slice(1).toLowerCase();
}

const GENDER_OPTIONS = [
  { label: "Male", value: "MALE" },
  { label: "Female", value: "FEMALE" },
  { label: "Other", value: "OTHER" },
  { label: "Prefer not to say", value: "PREFER_NOT_TO_SAY" },
];

export default function AdminProfilePage() {
  const dispatch = useDispatch();
  const { showToast } = useToast();

  // Select state from the adminProfile slice
  const {
    data: user,
    isLoading,
    isError,
    message,
  } = useSelector((state) => state.adminProfile);
  const { accessToken } = useSelector((state) => state.auth);

  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ fullName: "", gender: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (accessToken) {
      dispatch(loadProfile());
    }
    // Cleanup on unmount
    return () => dispatch(reset());
  }, [dispatch, accessToken]);

  // Handle error messages from Redux state
  useEffect(() => {
    if (isError && message) {
      showToast(message, "error");
    }
  }, [isError, message, showToast]);

  const initials = user?.fullName
    ? user.fullName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "A";

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const openModal = () => {
    setForm({ fullName: user?.fullName || "", gender: user?.gender || "" });
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      // Dispatch saveProfile thunk and unwrap to handle local UI state
      await dispatch(
        saveProfile({
          fullName: form.fullName,
          gender: form.gender,
        }),
      ).unwrap();

      showToast("Profile updated successfully!", "success");
      setShowModal(false);
    } catch (err) {
      // Error is handled by the thunk, but we catch it here to stop the 'saving' spinner
      console.error("Update failed:", err);
    } finally {
      setSaving(false);
    }
  };

  if (isLoading && !user) {
    return <div className="ap-page">Loading...</div>;
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
              <h2 className="ap-name">{user?.fullName || "—"}</h2>
              <span className="ap-role-badge">
                <i className="fa-solid fa-shield-halved me-1"></i>
                {user?.role || "ADMIN"}
              </span>
            </div>
          </div>

          <hr className="ap-divider" />

          <div className="ap-info-grid">
            <InfoRow icon="fa-user" label="Full Name" value={user?.fullName} />
            <InfoRow
              icon="fa-envelope"
              label="Email Address"
              value={user?.email}
            />
            <InfoRow
              icon="fa-phone"
              label="Mobile Number"
              value={user?.mobileNumber}
            />
            <InfoRow
              icon="fa-venus-mars"
              label="Gender"
              value={formatGender(user?.gender)}
            />
            <InfoRow icon="fa-user-tag" label="Role" value={user?.role} />
            <InfoRow
              icon="fa-circle-check"
              label="Status"
              value={user?.status}
            />
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
                <p className="ap-modal-hint">
                  Only name and gender can be updated
                </p>
              </div>
              <button
                className="ap-modal-close"
                onClick={() => setShowModal(false)}
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            <form onSubmit={handleSave} className="ap-modal-body">
              <div className="ap-field">
                <label htmlFor="fullName">Full Name</label>
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  className="ap-input"
                  value={form.fullName}
                  onChange={handleChange}
                  placeholder="Enter full name"
                  required
                />
              </div>

              <div className="ap-field">
                <label htmlFor="gender">Gender</label>
                <select
                  id="gender"
                  name="gender"
                  className="ap-input ap-select"
                  value={form.gender}
                  onChange={handleChange}
                >
                  <option value="">Select gender</option>
                  {GENDER_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="ap-readonly-notice">
                <i className="fa-solid fa-lock"></i>
                <span>Email and mobile number cannot be changed.</span>
              </div>

              <div className="ap-modal-actions">
                <button
                  type="button"
                  className="ap-btn-cancel"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="ap-btn-save" disabled={saving}>
                  {saving ? (
                    <>
                      <i className="fa-solid fa-spinner fa-spin me-2"></i>
                      Saving...
                    </>
                  ) : (
                    <>
                      <i className="fa-solid fa-floppy-disk me-2"></i>Save
                      Changes
                    </>
                  )}
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
      <span className="ap-info-value">{value || "—"}</span>
    </div>
  );
}

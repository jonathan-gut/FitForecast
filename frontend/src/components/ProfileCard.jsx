import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getToken } from "../authStore";
import { apiUpdateProfile } from "../api/auth";
import "./ProfileCard.css";

export default function ProfileCard({ email, location, units, role, onUpdate }) {
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    location: location || "",
    units: units || "F"
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async () => {
    setSaving(true);
    setError("");
    try {
      const token = getToken();
      const result = await apiUpdateProfile(token, formData);
      setShowModal(false);
      onUpdate?.(result.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const navigate = useNavigate();

  return (
    <>
      <div className="profile-card">
        <div className="profile-info" onClick={() => setShowModal(true)}>
          <div className="profile-name">{email}</div>
          <div className="profile-details">
            {location && <span>{location}</span>}
            <span>•</span>
            <span>{units}°</span>
          </div>
        </div>
        <div className="profile-buttons">
          {role === 'admin' && (
            <button
              className="profile-edit-btn"
              onClick={() => navigate('/admin')}
              title="Admin Panel"
            >
              🛠️
            </button>
          )}
          <button className="profile-edit-btn" onClick={() => setShowModal(true)}>⚙️</button>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Profile Settings</h2>
            
            <div className="modal-form">
              <div className="form-group">
                <label>Email</label>
                <input type="text" value={email} disabled />
              </div>

              <div className="form-group">
                <label>City/Location</label>
                <input
                  type="text"
                  placeholder="e.g., New York"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Temperature Units</label>
                <select
                  value={formData.units}
                  onChange={(e) => setFormData({ ...formData, units: e.target.value })}
                >
                  <option value="F">Fahrenheit (°F)</option>
                  <option value="C">Celsius (°C)</option>
                </select>
              </div>

              {error && <div className="error-msg">{error}</div>}

              <div className="modal-buttons">
                <button
                  className="btn-cancel"
                  onClick={() => setShowModal(false)}
                  disabled={saving}
                >
                  Cancel
                </button>
                <button
                  className="btn-save"
                  onClick={handleSave}
                  disabled={saving}
                >
                  {saving ? "Saving..." : "Save"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

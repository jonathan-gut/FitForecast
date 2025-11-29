import { useState } from "react";
import { apiUpdateProfile } from "../api/auth";
import "./ProfileCard.css";

export default function ProfileCard({ email, location, units, onUpdate }) {
  const [isOpen, setIsOpen] = useState(false);
  const [formLocation, setFormLocation] = useState(location || "");
  const [formUnits, setFormUnits] = useState(units || "F");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async () => {
    setLoading(true);
    setError("");
    try {
      const result = await apiUpdateProfile({
        location: formLocation,
        units: formUnits,
      });
      onUpdate(result.user);
      setIsOpen(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormLocation(location || "");
    setFormUnits(units || "F");
    setError("");
    setIsOpen(false);
  };

  return (
    <>
      <div className="profile-card">
        <div>
          <div className="profile-email">{email}</div>
          {location && <div className="profile-location">{location}</div>}
        </div>
        <button className="profile-edit-btn" onClick={() => setIsOpen(true)}>
          Edit
        </button>
      </div>

      {isOpen && (
        <div className="profile-modal-overlay" onClick={handleCancel}>
          <div className="profile-modal" onClick={(e) => e.stopPropagation()}>
            <h2>Edit Profile</h2>
            
            <div className="form-group">
              <label>Location</label>
              <input
                type="text"
                value={formLocation}
                onChange={(e) => setFormLocation(e.target.value)}
                placeholder="e.g., New York, NY"
              />
            </div>

            <div className="form-group">
              <label>Temperature Units</label>
              <div className="units-toggle">
                <button
                  className={`unit-btn ${formUnits === "F" ? "active" : ""}`}
                  onClick={() => setFormUnits("F")}
                >
                  °F
                </button>
                <button
                  className={`unit-btn ${formUnits === "C" ? "active" : ""}`}
                  onClick={() => setFormUnits("C")}
                >
                  °C
                </button>
              </div>
            </div>

            {error && <div className="error-message">{error}</div>}

            <div className="modal-actions">
              <button
                className="btn-cancel"
                onClick={handleCancel}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                className="btn-save"
                onClick={handleSave}
                disabled={loading}
              >
                {loading ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

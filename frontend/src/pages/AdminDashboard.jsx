import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getToken } from "../authStore";
import { apiMe } from "../api/auth";
import { apiGetUsers, apiUpdateUserRole, apiDeleteUser } from "../api/admin";
import BackArrowIcon from "../assets/BackArrow.svg";
import RuleEngineDebugger from "../components/RuleEngineDebugger";
import "./AdminDashboard.css";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [me, setMe] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    const t = getToken();
    if (!t) {
      setError("Not logged in");
      return;
    }
    
    // Check if user is admin
    apiMe(t)
      .then((d) => {
        if (d.user.role !== "admin") {
          setError("Access denied: Admin role required");
          return;
        }
        setMe(d.user);
        loadUsers();
      })
      .catch((e) => setError(e.message));
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await apiGetUsers();
      setUsers(data.users);
    } catch (err) {
      console.error("Error loading users:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await apiUpdateUserRole(userId, newRole);
      loadUsers();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteClick = (userId, email) => {
    setDeleteConfirm({ userId, email });
  };

  const handleConfirmDelete = async () => {
    try {
      await apiDeleteUser(deleteConfirm.userId);
      setDeleteConfirm(null);
      loadUsers();
    } catch (err) {
      setError(err.message);
    }
  };

  if (error && error.includes("Admin role required")) {
    return (
      <div className="admin-error">
        <h1>Access Denied</h1>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <header className="admin-header">
        <button 
          className="back-btn"
          onClick={() => navigate("/dashboard")}
        >
          <img src={BackArrowIcon} alt="Back" className="back-icon" />
        </button>
        <h1>Admin Dashboard</h1>
        {me && <p className="admin-user">Logged in as: {me.email}</p>}
      </header>

      {error && <div className="error-banner">{error}</div>}

      <div className="admin-content">
        <div className="users-section">
          <div className="section-header">
            <h2>User Management</h2>
            <button 
              className="refresh-btn"
              onClick={loadUsers}
              disabled={loading}
            >
              {loading ? "Loading..." : "Refresh"}
            </button>
          </div>

          <div className="users-table-container">
            {loading ? (
              <p className="loading">Loading users...</p>
            ) : users.length === 0 ? (
              <p className="empty">No users found</p>
            ) : (
              <table className="users-table">
                <thead>
                  <tr>
                    <th>Email</th>
                    <th>Location</th>
                    <th>Units</th>
                    <th>Role</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td className="email">{user.email}</td>
                      <td className="location">{user.profile?.location || "—"}</td>
                      <td className="units">{user.profile?.units || "F"}</td>
                      <td className="role">
                        <select
                          value={user.role}
                          onChange={(e) => handleRoleChange(user.id, e.target.value)}
                          className="role-select"
                        >
                          <option value="member">Member</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                      <td className="actions">
                        <button
                          className="delete-btn"
                          onClick={() => handleDeleteClick(user.id, user.email)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* Rule Engine Debugger */}
      <RuleEngineDebugger />

      {deleteConfirm && (
        <div className="delete-modal-overlay" onClick={() => setDeleteConfirm(null)}>
          <div className="delete-modal" onClick={(e) => e.stopPropagation()}>
            <h2>Confirm Delete</h2>
            <p>
              Are you sure you want to delete the account for <strong>{deleteConfirm.email}</strong>?
            </p>
            <p className="warning">This action cannot be undone.</p>
            <div className="modal-actions">
              <button
                className="cancel-btn"
                onClick={() => setDeleteConfirm(null)}
              >
                Cancel
              </button>
              <button
                className="confirm-delete-btn"
                onClick={handleConfirmDelete}
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

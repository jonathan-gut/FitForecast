import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getToken } from "../authStore";
import { apiMe } from "../api/auth";
import { apiGetAllUsers, apiChangeUserRole, apiDeleteUser } from "../api/admin";
import "./AdminDashboard.css";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [me, setMe] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const token = getToken();
    if (!token) {
      navigate("/login");
      return;
    }

    // Check if user is admin
    apiMe(token)
      .then((data) => {
        if (data.user.role !== "admin") {
          navigate("/dashboard");
          return;
        }
        setMe(data.user);
        // Fetch all users
        return apiGetAllUsers(token);
      })
      .then((data) => {
        if (data) setUsers(data.users);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      })
      .finally(() => setLoading(false));
  }, [navigate]);

  const handleChangeRole = async (userId, newRole) => {
    const token = getToken();
    try {
      setError("");
      setSuccess("");
      const result = await apiChangeUserRole(token, userId, newRole);
      // Update local state
      setUsers(
        users.map((u) => (u.id === userId ? result.user : u))
      );
      setSuccess(`User role changed to ${newRole}`);
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteUser = async (userId, email) => {
    if (!window.confirm(`Are you sure you want to delete ${email}?`)) {
      return;
    }

    const token = getToken();
    try {
      setError("");
      setSuccess("");
      await apiDeleteUser(token, userId);
      setUsers(users.filter((u) => u.id !== userId));
      setSuccess("User deleted successfully");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <div className="admin-page">Loading...</div>;

  return (
    <div className="admin-page">
      <header className="admin-header">
        <button
          className="back-btn"
          onClick={() => navigate('/dashboard')}
          aria-label="Back to dashboard"
          title="Back to dashboard"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M19 12H6" />
            <path d="M12 19L5 12L12 5" />
          </svg>
        </button>
        <h1>Admin Dashboard</h1>
        <p className="admin-info">{me?.email}</p>
      </header>

      {error && <div className="error-banner">{error}</div>}
      {success && <div className="success-banner">{success}</div>}

      <div className="admin-content">
        <h2>Registered Users ({users.length})</h2>

        <div className="users-table">
          <div className="table-header">
            <div className="col-id">ID</div>
            <div className="col-email">Email</div>
            <div className="col-role">Role</div>
            <div className="col-actions">Actions</div>
          </div>

          {users.map((user) => (
            <div key={user.id} className="table-row">
              <div className="col-id">{user.id}</div>
              <div className="col-email">{user.email}</div>
              <div className="col-role">
                <span className={`badge ${user.role}`}>{user.role}</span>
              </div>
              <div className="col-actions">
                <select
                  value={user.role}
                  onChange={(e) => handleChangeRole(user.id, e.target.value)}
                  className="role-select"
                >
                  <option value="member">Member</option>
                  <option value="admin">Admin</option>
                </select>

                {user.id !== me?.id && (
                  <button
                    className="btn-delete"
                    onClick={() => handleDeleteUser(user.id, user.email)}
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export async function apiGetAllUsers(token) {
  const res = await fetch("/api/admin/users", {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to fetch users");
  return data;
}

export async function apiChangeUserRole(token, userId, newRole) {
  const res = await fetch(`/api/admin/users/${userId}/role`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ role: newRole }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to change user role");
  return data;
}

export async function apiDeleteUser(token, userId) {
  const res = await fetch(`/api/admin/users/${userId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to delete user");
  return data;
}

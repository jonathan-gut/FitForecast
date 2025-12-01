import { getToken } from "../authStore";

export async function apiGetUsers() {
  const token = getToken();
  if (!token) throw new Error("Not logged in");

  const res = await fetch("/api/admin/users", {
    method: "GET",
    headers: { "Authorization": `Bearer ${token}` },
  });

  let data;
  try {
    data = await res.json();
  } catch (e) {
    throw new Error(`Server error (${res.status}): Invalid response format`);
  }
  
  if (!res.ok) {
    throw new Error(data.error || `Server error (${res.status})`);
  }
  return data;
}

export async function apiUpdateUserRole(userId, role) {
  const token = getToken();
  if (!token) throw new Error("Not logged in");

  const res = await fetch(`/api/admin/users/${userId}/role`, {
    method: "PATCH",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ role }),
  });

  let data;
  try {
    data = await res.json();
  } catch (e) {
    throw new Error(`Server error (${res.status}): Invalid response format`);
  }
  
  if (!res.ok) {
    throw new Error(data.error || `Server error (${res.status})`);
  }
  return data;
}

export async function apiDeleteUser(userId) {
  const token = getToken();
  if (!token) throw new Error("Not logged in");

  const res = await fetch(`/api/admin/users/${userId}`, {
    method: "DELETE",
    headers: { "Authorization": `Bearer ${token}` },
  });

  let data;
  try {
    data = await res.json();
  } catch (e) {
    throw new Error(`Server error (${res.status}): Invalid response format`);
  }
  
  if (!res.ok) {
    throw new Error(data.error || `Server error (${res.status})`);
  }
  return data;
}

export async function apiRegister({ email, password, location = "", units = "F" }) {
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, location, units }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Registration failed");
    return data; // { access_token, user }
  }
  
  export async function apiLogin({ email, password }) {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Login failed");
    return data; // { access_token, user }
  }
  
  export async function apiMe(token) {
    const res = await fetch("/api/auth/me", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Auth check failed");
    return data; // { user }
  }

  export async function apiUpdateProfile(token, { location, units }) {
    const res = await fetch("/api/auth/me", {
      method: "PUT",
      headers: { 
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ location, units }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Profile update failed");
    return data; // { user }
  }
// src/LoginPage.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiLogin } from "../api/auth";
import { saveToken } from "../authStore";

export default function LoginPage() {
  const nav = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [err, setErr] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    setErr("");
    try {
      const { access_token } = await apiLogin(form);
      saveToken(access_token);
      nav("/dashboard"); // or "/"
    } catch (e) {
      setErr(e.message);
    }
  }

  return (
    <div style={{ minHeight: "100vh", display: "grid", placeItems: "center" }}>
      <form onSubmit={onSubmit} style={{ display: "grid", gap: 12, width: 300 }}>
        <h2>Log in</h2>
        {err && <div style={{ color: "crimson" }}>{err}</div>}
        <input
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
        <input
          placeholder="Password"
          type="password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />
        <button type="submit">Log in</button>
      </form>
    </div>
  );
}
// src/LoginPage.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiLogin } from "../api/auth";
import { saveToken } from "../authStore";
import "./LoginPage.css";

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
    <div className="login-page">
      <h1 className="title">Log in to your account</h1>
      {err && <div style={{ color: "crimson", marginBottom: 12 }}>{err}</div>}
      <form className="login-form" onSubmit={onSubmit}>
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
        <button className="button" type="submit">Log in</button>
      </form>
    </div>
  );
}

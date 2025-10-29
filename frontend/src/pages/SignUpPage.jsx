import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiRegister } from "../api/auth";
import { saveToken } from "../authStore";
import "./SignUpPage.css";

export default function SignUpPage() {
  const nav = useNavigate();
  const [form, setForm] = useState({ email: "", password: "", location: "", units: "F" });
  const [err, setErr] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    setErr("");
    try {
      const { access_token } = await apiRegister(form);
      saveToken(access_token);
      nav("/dashboard"); // or "/"
    } catch (e) {
      setErr(e.message);
    }
  }

  return (
    <div className="signup-page">
      <h1 className="title">Create your account</h1>
      {err && <div style={{ color: "crimson", marginBottom: 12 }}>{err}</div>}
      <form className="signup-form" onSubmit={onSubmit}>
        <input placeholder="Email" value={form.email}
               onChange={(e)=>setForm({ ...form, email: e.target.value })}/>
        <input placeholder="Password" type="password" value={form.password}
               onChange={(e)=>setForm({ ...form, password: e.target.value })}/>
        <input placeholder="City/ZIP (optional)" value={form.location}
               onChange={(e)=>setForm({ ...form, location: e.target.value })}/>
        <select value={form.units} onChange={(e)=>setForm({ ...form, units: e.target.value })}>
          <option value="F">Fahrenheit</option>
          <option value="C">Celsius</option>
        </select>
        <button className="button" type="submit">Sign up</button>
      </form>
    </div>
  );
}
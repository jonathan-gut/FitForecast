import { useEffect, useState } from "react";
import { getToken } from "../authStore";
import { apiMe } from "../api/auth";

export default function Dashboard() {
  const [me, setMe] = useState(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    const t = getToken();
    if (!t) { setErr("Not logged in"); return; }
    apiMe(t).then((d) => setMe(d.user)).catch((e) => setErr(e.message));
  }, []);

  if (err) return <p style={{ padding: 24 }}>{err}</p>;
  if (!me) return <p style={{ padding: 24 }}>Loading…</p>;
  return <div style={{ padding: 24 }}>Welcome, {me.email}!</div>;
}
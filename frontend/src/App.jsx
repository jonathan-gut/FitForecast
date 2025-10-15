import { useEffect, useState } from "react";
import { getHealth } from "./api";

export default function App() {
  const [status, setStatus] = useState("loading...");
  const [error, setError] = useState("");

  useEffect(() => {
    getHealth()
      .then((d) => setStatus(d.status || JSON.stringify(d)))
      .catch((e) => setError(e.message));
  }, []);

  return (
    <main style={{ fontFamily: "system-ui", padding: 24 }}>
      <h1>FitForecast</h1>
      <p>Backend health: {error ? `❌ ${error}` : `✅ ${status}`}</p>
    </main>
  );
}
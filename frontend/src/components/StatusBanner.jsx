import { useEffect, useState } from "react";

export default function StatusBanner() {
  const [status, setStatus] = useState("Checking...");

  useEffect(() => {
    fetch("/health")
      .then((res) => res.json())
      .then((data) => setStatus(data.status))
      .catch(() => setStatus("Backend unreachable"));
  }, []);

  return (
    <p style={{ textAlign: "center", color: "white", fontWeight: "500" }}>
      Backend status: {status}
    </p>
  );
}
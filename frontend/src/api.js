export async function getHealth() {
    const res = await fetch("/health"); // proxied to Flask
    if (!res.ok) throw new Error("Health check failed");
    return res.json();
  }
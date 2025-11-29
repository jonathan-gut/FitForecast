import { getToken } from "../authStore";

export async function apiRecommend({ temp_f, occasion, condition }) {
  const res = await fetch("/api/recommendations", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ temp_f, occasion, condition }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || "Failed to generate outfit");
  }
  return data;
}

export async function apiGetSavedWeather() {
  const token = getToken();
  if (!token) {
    throw new Error("Not logged in");
  }

  const res = await fetch("/api/weather/saved", {
    method: "GET",
    headers: { "Authorization": `Bearer ${token}` },
  });

  if (!res.ok) {
    const contentType = res.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      const data = await res.json();
      throw new Error(data.error || "Failed to fetch saved weather");
    } else {
      throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    }
  }

  const data = await res.json();
  return data;
}
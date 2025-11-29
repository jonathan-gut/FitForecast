export async function fetchSavedWeather(token) {
  const res = await fetch("/api/weather/saved", {
    headers: { Authorization: `Bearer ${token}` },
  });
  
  // Check if response is actually JSON
  const contentType = res.headers.get("content-type");
  if (!contentType?.includes("application/json")) {
    throw new Error(`Invalid response type: ${contentType}`);
  }
  
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to fetch saved weather");
  return data;
}

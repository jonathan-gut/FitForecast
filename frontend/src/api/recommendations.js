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
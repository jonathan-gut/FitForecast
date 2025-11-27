import { useEffect, useState } from "react";
import { getToken } from "../authStore";
import { apiMe } from "../api/auth";
import { apiRecommend } from "../api/recommendations";
import "./Dashboard.css";
import ProfileCard from "../components/ProfileCard";
import WeatherSelector from "../components/WeatherSelector";
import OccasionSelector from "../components/OccasionSelector";

export default function Dashboard() {
  const [me, setMe] = useState(null);
  const [err, setErr] = useState("");

  const [occasion, setOccasion] = useState("casual_outing"); // key used by backend
  const [tempF, setTempF] = useState(null);
  const [weatherCondition, setWeatherCondition] = useState("");

  const [outfit, setOutfit] = useState([]);
  const [loading, setLoading] = useState(false);
  const [recErr, setRecErr] = useState("");

  // Fetch logged-in user
  useEffect(() => {
    const t = getToken();
    if (!t) {
      setErr("Not logged in");
      return;
    }
    apiMe(t)
      .then((d) => setMe(d.user))
      .catch((e) => setErr(e.message));
  }, []);

  async function handleGenerate() {
    setRecErr("");
    setOutfit([]);

    if (tempF == null) {
      setRecErr("Please pick a temperature in the weather box.");
      return;
    }

    setLoading(true);
    try {
      const data = await apiRecommend({
      temp_f: tempF,
      occasion,
      condition: weatherCondition || null,
});
      setOutfit(data.items || []);
    } catch (e) {
      setRecErr(e.message || "Failed to generate outfit.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="dashboard-page">
      <header className="dashboard-header">
        <h1 className="dashboard-title">FitForecast</h1>
        {me && <ProfileCard email={me.email} />}
        {err && !me && <p className="error-text">{err}</p>}
      </header>

      <div className="main-panel">
        {/* LEFT COLUMN */}
        <div className="left-panel">
          <WeatherSelector
            onWeatherSelect={({ temperature, condition }) => {
              setTempF(temperature);
              setWeatherCondition(condition);
            }}
          />

          <OccasionSelector onSelect={setOccasion} />

          <button
            className="generate-btn"
            onClick={handleGenerate}
            disabled={loading}
          >
            {loading ? "Generating..." : "Generate Outfit"}
          </button>

          {recErr && <p className="error-text">{recErr}</p>}
        </div>

        {/* RIGHT COLUMN */}
        <div className="right-panel">
          <div className="outfit-preview">
            {tempF != null && (
              <p className="current-weather">
                Using {tempF}°F
                {weatherCondition ? ` · ${weatherCondition}` : ""}
              </p>
            )}

            {outfit.length === 0 && !loading && (
              <p className="placeholder-text">
                Choose weather & occasion, then click{" "}
                <strong>"Generate Outfit"</strong>.
              </p>
            )}

            {outfit.length > 0 && (
              <ul className="outfit-list">
                {outfit.map((item) => (
                  <li key={item.id} className="outfit-item">
                    <div className="item-name">{item.name}</div>
                    <div className="item-meta">
                      {item.category} · {item.formality} · warmth{" "}
                      {item.warmth_score} · {item.activity_comfort}
                    </div>
                  </li>
                ))}
              </ul>
            )}

            {loading && <p className="loading-text">Picking an outfit...</p>}
          </div>

          <button
            className="save-outfit-btn"
            disabled={outfit.length === 0}
          >
            Save Outfit (coming soon)
          </button>
        </div>
      </div>
    </div>
  );
}
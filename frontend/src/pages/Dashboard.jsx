import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getToken } from "../authStore";
import { apiMe } from "../api/auth";
import { apiRecommend } from "../api/recommendations";
import "./Dashboard.css";
import ProfileCard from "../components/ProfileCard";
import WeatherSelector from "../components/WeatherSelector";
import OccasionSelector from "../components/OccasionSelector";

export default function Dashboard() {
  const navigate = useNavigate();
  const [me, setMe] = useState(null);
  const [err, setErr] = useState("");
  const [occasion, setOccasion] = useState("Casual");
  const [weather, setWeather] = useState({ temperature: 70, condition: "", source: "manual" });
  const [generating, setGenerating] = useState(false);
  const [outfit, setOutfit] = useState(null);

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

  const handleProfileUpdate = (updatedUser) => {
    setMe(updatedUser);
  };

  const handleGenerateOutfit = async () => {
    if (!weather.temperature) {
      setErr("Please select a temperature");
      return;
    }
    setGenerating(true);
    setErr("");
    try {
      const result = await apiRecommend({
        temp_f: weather.temperature,
        occasion: occasion,
        condition: weather.condition,
      });
      setOutfit(result);
    } catch (e) {
      setErr(e.message);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="dashboard-page">
      <header className="dashboard-header">
        <h1 
          className="dashboard-title"
          onClick={() => navigate("/")}
          style={{ cursor: "pointer" }}
        >
          FitForecast
        </h1>
        <div className="header-actions">
          {me?.role === "admin" && (
            <button 
              className="admin-link-btn"
              onClick={() => navigate("/admin")}
            >
              Admin Panel
            </button>
          )}
          {me && (
            <ProfileCard 
              email={me.email}
              location={me.location}
              units={me.units}
              role={me.role}
              onUpdate={handleProfileUpdate}
            />
          )}
        </div>
      </header>

      <div className="main-panel">

        {/* LEFT COLUMN */}
        <div className="left-panel">
          <WeatherSelector 
            onWeatherSelect={setWeather}
            userUnits={me?.units}
            userLocation={me?.location}
          />
          <OccasionSelector onSelect={setOccasion} />

          <button 
            className="generate-btn"
            onClick={handleGenerateOutfit}
            disabled={generating}
          >
            {generating ? "Generating..." : "Generate Outfit"}
          </button>
        </div>

        {/* RIGHT COLUMN */}
        <div className="right-panel">
          <div className="outfit-preview">
            {err && <div className="error-message">{err}</div>}
            {outfit ? (
              <div className="outfit-result">
                <h2 className="outfit-title">Your Outfit</h2>
                <div className="outfit-details">
                  <p className="occasion-badge">{outfit.occasion}</p>
                  <p className="weather-info">
                    {outfit.temp_f}°F {outfit.condition && `• ${outfit.condition}`}
                  </p>
                  <p className="weather-source">
                    (Source: {weather.source === "saved" ? "Saved Location" : "Manual"})
                  </p>
                </div>
                <div className="outfit-items">
                  {outfit.items && outfit.items.map((item) => (
                    <div key={item.id} className="outfit-item">
                      <div className="item-name">{item.name}</div>
                      <div className="item-meta">
                        {item.category && <span>{item.category}</span>}
                        {item.formality && <span>{item.formality}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="empty-state">
                <p>Select weather and occasion, then click "Generate Outfit" to get started</p>
              </div>
            )}
          </div>

          <button 
            className="save-outfit-btn"
            disabled={!outfit}
          >
            Save Outfit
          </button>
        </div>

      </div>
    </div>
  );
}

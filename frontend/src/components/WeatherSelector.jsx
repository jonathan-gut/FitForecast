import { useState, useEffect } from "react";
import SunnyIcon from "../assets/Sunny.svg";
import CloudyIcon from "../assets/Cloudy.svg";
import RainyIcon from "../assets/Rainy.svg";
import SnowyIcon from "../assets/Snowy.svg";
import { apiGetSavedWeather } from "../api/recommendations";
import "./WeatherSelector.css";

export default function WeatherSelector({ onWeatherSelect, userUnits }) {
  const [activeTab, setActiveTab] = useState("manual");
  const [temperature, setTemperature] = useState(70);
  const [condition, setCondition] = useState("");
  const [savedWeather, setSavedWeather] = useState(null);
  const [loadingWeather, setLoadingWeather] = useState(false);
  const [weatherError, setWeatherError] = useState("");

  const conditionOptions = [
    { label: "Sunny", icon: SunnyIcon },
    { label: "Cloudy", icon: CloudyIcon },
    { label: "Rainy", icon: RainyIcon },
    { label: "Snowy", icon: SnowyIcon },
  ];

  // Fetch saved weather when component mounts or when "Saved" tab is clicked or units change
  useEffect(() => {
    if (activeTab === "saved") {
      setLoadingWeather(true);
      setWeatherError("");
      apiGetSavedWeather()
        .then((data) => {
          setSavedWeather(data);
          // Auto-select the saved weather
          const temp = Math.round(data.current_temperature);
          setTemperature(temp);
          // You could map weather conditions based on API data if needed
          notifyParent(temp, condition);
        })
        .catch((err) => {
          setWeatherError(err.message);
        })
        .finally(() => {
          setLoadingWeather(false);
        });
    }
  }, [activeTab, userUnits]);

  function notifyParent(nextTemp, nextCondition, source = "manual") {
    if (typeof onWeatherSelect === "function") {
      onWeatherSelect({
        temperature: nextTemp,
        condition: nextCondition,
        source: source,
      });
    }
  }

  return (
    <div className="weather-box">
      {/* Tabs */}
      <div className="weather-tabs">
        <button
          className={`weather-tab ${activeTab === "saved" ? "active" : ""}`}
          onClick={() => setActiveTab("saved")}
        >
          Saved Weather
        </button>

        <button
          className={`weather-tab ${activeTab === "manual" ? "active" : ""}`}
          onClick={() => setActiveTab("manual")}
        >
          Manual Input
        </button>
      </div>

      <div className="weather-title">How’s the Weather?</div>

      <div className="weather-content">
        {activeTab === "saved" ? (
          <div className="saved-weather">
            {loadingWeather ? (
              <p>Loading your saved location weather...</p>
            ) : weatherError ? (
              <p className="error-text">Error: {weatherError}</p>
            ) : savedWeather ? (
              <div className="saved-weather-display">
                <p className="location-name">
                  {savedWeather._resolved_location?.name || "Your Location"}
                </p>
                <div className="temp-display">
                  <span className="current-temp">
                    {Math.round(savedWeather.current_temperature)}°{savedWeather.user_units || "F"}
                  </span>
                  <span className="temp-range">
                    H: {Math.round(savedWeather.temperature_high)}° L: {Math.round(savedWeather.temperature_low)}°
                  </span>
                </div>
                <p className="timezone-info">
                  {savedWeather._resolved_location?.country} • {savedWeather.timezone}
                </p>
                <button
                  className="use-saved-btn"
                  onClick={() => {
                    setTemperature(Math.round(savedWeather.current_temperature));
                    notifyParent(Math.round(savedWeather.current_temperature), condition, "saved");
                  }}
                >
                  Use This Weather
                </button>
              </div>
            ) : (
              <p>No saved location found. Add one in your profile.</p>
            )}
          </div>
        ) : (
          <div className="manual-weather-full">
            {/* Temperature Label */}
            <h3 className="section-title">
              Temperature: {temperature}°F
            </h3>

            {/* Slider */}
            <input
              type="range"
              min="20"
              max="110"
              value={temperature}
              onChange={(e) => {
                const nextTemp = Number(e.target.value);
                setTemperature(nextTemp);
                // keep current condition, only temp changes
                notifyParent(nextTemp, condition);
              }}
              className="temp-slider"
            />

            {/* Cold / Warm / Hot labels */}
            <div className="slider-labels">
              <span>Cold</span>
              <span>Warm</span>
              <span>Hot</span>
            </div>

            {/* Weather Condition Section */}
            <h3 className="section-title">Weather Condition</h3>

            <div className="condition-grid">
              {conditionOptions.map((opt) => (
                <button
                  key={opt.label}
                  className={`condition-card ${
                    condition === opt.label ? "active" : ""
                  }`}
                  onClick={() => {
                    setCondition(opt.label);
                    notifyParent(temperature, opt.label);
                  }}
                >
                  <div className="condition-icon">
                    <img src={opt.icon} alt={opt.label} />
                  </div>
                  <span>{opt.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
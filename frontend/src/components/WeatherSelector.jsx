import { useState, useEffect } from "react";
import SunnyIcon from "../assets/Sunny.svg";
import CloudyIcon from "../assets/Cloudy.svg";
import RainyIcon from "../assets/Rainy.svg";
import SnowyIcon from "../assets/Snowy.svg";
import { apiGetSavedWeather } from "../api/recommendations";
import ReactiveWeather from "./ReactiveWeather";
import "./WeatherSelector.css";

export default function WeatherSelector({ onWeatherSelect, userUnits, userLocation }) {
  const [activeTab, setActiveTab] = useState("manual");
  const [temperature, setTemperature] = useState(70);
  const [condition, setCondition] = useState("");
  const [savedWeather, setSavedWeather] = useState(null);
  const [savedCondition, setSavedCondition] = useState("Clear");
  const [loadingWeather, setLoadingWeather] = useState(false);
  const [weatherError, setWeatherError] = useState("");

  const conditionOptions = [
    { label: "Clear", icon: SunnyIcon },
    { label: "Cloudy", icon: CloudyIcon },
    { label: "Rainy", icon: RainyIcon },
    { label: "Snowy", icon: SnowyIcon },
  ];

  // Fetch saved weather when component mounts or when "Saved" tab is clicked or units/location change
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
          // Detect condition from weather code if available
          const detectedCondition = detectCondition(data.weather_code || data.weather_condition);
          setSavedCondition(detectedCondition);
          notifyParent(temp, detectedCondition, "saved");
        })
        .catch((err) => {
          setWeatherError(err.message);
        })
        .finally(() => {
          setLoadingWeather(false);
        });
    }
  }, [activeTab, userUnits, userLocation]);

  function notifyParent(nextTemp, nextCondition, source = "manual") {
    if (typeof onWeatherSelect === "function") {
      onWeatherSelect({
        temperature: nextTemp,
        condition: nextCondition,
        source: source,
      });
    }
  }

  function detectCondition(weatherCode) {
    if (!weatherCode) return "Clear";
    // Map weather codes to conditions
    const code = parseInt(weatherCode);
    if (code === 0 || code === 1) return "Clear";
    if (code === 2 || code === 3) return "Cloudy";
    if (code === 45 || code === 48 || (code >= 51 && code <= 67)) return "Rainy";
    if (code >= 71 && code <= 86) return "Snowy";
    if (code >= 80 && code <= 82) return "Rainy";
    return "Clear";
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
              <ReactiveWeather
                weatherData={savedWeather}
                condition={savedCondition}
                onUseWeather={() => {
                  setTemperature(Math.round(savedWeather.current_temperature));
                  notifyParent(Math.round(savedWeather.current_temperature), savedCondition, "saved");
                }}
              />
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
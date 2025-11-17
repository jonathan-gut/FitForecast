import { useState } from "react";
import SunnyIcon from "../assets/Sunny.svg";
import CloudyIcon from "../assets/Cloudy.svg";
import RainyIcon from "../assets/Rainy.svg";
import SnowyIcon from "../assets/Snowy.svg";
import "./WeatherSelector.css";

export default function WeatherSelector({ onWeatherSelect }) {
  const [activeTab, setActiveTab] = useState("manual");
  const [temperature, setTemperature] = useState(70);
  const [condition, setCondition] = useState("");

  const conditionOptions = [
    { label: "Sunny", icon: SunnyIcon },
    { label: "Cloudy", icon: CloudyIcon },
    { label: "Rainy", icon: RainyIcon },
    { label: "Snowy", icon: SnowyIcon },
  ];

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
          <div className="saved-placeholder">
            <p>Saved presets will appear here...</p>
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
              onChange={(e) => setTemperature(Number(e.target.value))}
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
                    onWeatherSelect?.({
                      temperature,
                      condition: opt.label,
                    });
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

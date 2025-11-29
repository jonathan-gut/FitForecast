import { useState, useEffect } from "react";
import { getToken } from "../authStore";
import { fetchSavedWeather } from "../api/weather";
import SunnyIcon from "../assets/Sunny.svg";
import CloudyIcon from "../assets/Cloudy.svg";
import RainyIcon from "../assets/Rainy.svg";
import SnowyIcon from "../assets/Snowy.svg";
import "./WeatherSelector.css";

// Helper function to convert Celsius to Fahrenheit
const celsiusToFahrenheit = (celsius) => (celsius * 9/5) + 32;

// Helper function to convert Fahrenheit to Celsius
const fahrenheitToCelsius = (fahrenheit) => (fahrenheit - 32) * 5/9;

export default function WeatherSelector({ onWeatherSelect, userUnits = "F", userLocation = "" }) {
  const [activeTab, setActiveTab] = useState("manual");
  const [temperature, setTemperature] = useState(70);
  const [condition, setCondition] = useState("");
  const [savedWeather, setSavedWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const conditionOptions = [
    { label: "Sunny", icon: SunnyIcon },
    { label: "Cloudy", icon: CloudyIcon },
    { label: "Rainy", icon: RainyIcon },
    { label: "Snowy", icon: SnowyIcon },
  ];

  useEffect(() => {
    const token = getToken();
    if (token) {
      setLoading(true);
      fetchSavedWeather(token)
        .then((data) => {
          setSavedWeather(data);
          setError("");
        })
        .catch((err) => {
          setError(err.message);
          setSavedWeather(null);
        })
        .finally(() => setLoading(false));
    }
  }, [userUnits, userLocation]);

  // Auto-refresh weather every 5 minutes (300000 ms)
  useEffect(() => {
    const refreshInterval = setInterval(() => {
      const token = getToken();
      if (token && activeTab === "saved") {
        fetchSavedWeather(token)
          .then((data) => {
            setSavedWeather(data);
            setError("");
          })
          .catch((err) => {
            setError(err.message);
          });
      }
    }, 300000); // 5 minutes

    return () => clearInterval(refreshInterval);
  }, [activeTab]);

  const handleSavedWeatherSelect = () => {
    if (savedWeather?.current_temperature !== undefined) {
      const rawTemp = savedWeather.current_temperature;
      const isApiCelsius = savedWeather.temperature_unit === "°C";
      
      // Convert to user's preferred unit
      let temp;
      if (isApiCelsius) {
        // API gives Celsius
        temp = userUnits === "C" 
          ? rawTemp 
          : celsiusToFahrenheit(rawTemp);
      } else {
        // API gives Fahrenheit
        temp = userUnits === "F"
          ? rawTemp
          : fahrenheitToCelsius(rawTemp);
      }
      
      onWeatherSelect?.({
        temperature: Math.round(temp),
        location: savedWeather._resolved_location?.name,
        source: "saved"
      });
    }
  };

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
            {loading && <p>Loading your location weather...</p>}
            {error && <p style={{ color: "red" }}>Error: {error}</p>}
            {savedWeather && !loading && (
              <div>
                <h3 className="section-title">
                  {savedWeather._resolved_location?.name}
                </h3>
                <div className="saved-weather-temps">
                  <p className="saved-weather-temp current">
                    Current: {
                      Math.round(
                        savedWeather.temperature_unit === "°F" 
                          ? (userUnits === "C" 
                            ? fahrenheitToCelsius(savedWeather.current_temperature || 0)
                            : (savedWeather.current_temperature || 0))
                          : (userUnits === "C"
                            ? (savedWeather.current_temperature || 0)
                            : celsiusToFahrenheit(savedWeather.current_temperature || 0))
                      )
                    }°{userUnits}
                  </p>
                  <p className="saved-weather-temp high">
                    High: {
                      Math.round(
                        savedWeather.temperature_unit === "°F" 
                          ? (userUnits === "C" 
                            ? fahrenheitToCelsius(savedWeather.temperature_high || 0)
                            : (savedWeather.temperature_high || 0))
                          : (userUnits === "C"
                            ? (savedWeather.temperature_high || 0)
                            : celsiusToFahrenheit(savedWeather.temperature_high || 0))
                      )
                    }°{userUnits}
                  </p>
                  <p className="saved-weather-temp low">
                    Low: {
                      Math.round(
                        savedWeather.temperature_unit === "°F" 
                          ? (userUnits === "C" 
                            ? fahrenheitToCelsius(savedWeather.temperature_low || 0)
                            : (savedWeather.temperature_low || 0))
                          : (userUnits === "C"
                            ? (savedWeather.temperature_low || 0)
                            : celsiusToFahrenheit(savedWeather.temperature_low || 0))
                      )
                    }°{userUnits}
                  </p>
                </div>
                <button
                  className="use-saved-btn"
                  onClick={handleSavedWeatherSelect}
                >
                  Use This Weather
                </button>
              </div>
            )}
            {!savedWeather && !loading && !error && (
              <p>No saved location found. Add a location in your profile.</p>
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

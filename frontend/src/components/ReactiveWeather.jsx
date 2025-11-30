import SunnyIcon from "../assets/Sunny.svg";
import CloudyIcon from "../assets/Cloudy.svg";
import RainyIcon from "../assets/Rainy.svg";
import SnowyIcon from "../assets/Snowy.svg";
import "./ReactiveWeather.css";

export default function ReactiveWeather({ weatherData, condition = "Clear", onUseWeather }) {
  if (!weatherData) {
    return <p>No weather data available</p>;
  }

  const temp = Math.round(weatherData.current_temperature);
  const units = weatherData.user_units || "F";

  // Convert temperature to Fahrenheit for consistent gradient logic
  const tempInFahrenheit = units === "C" ? (temp * 9/5) + 32 : temp;

  // Function to get gradient based on temperature and condition
  const getGradientStyle = () => {
    const tempRange = {
      cold: [20, 40],
      cool: [40, 60],
      warm: [60, 80],
      hot: [80, 110],
    };

    let gradient = "linear-gradient(135deg, #87CEEB 0%, #E0F6FF 100%)"; // default

    if (tempInFahrenheit >= tempRange.hot[0]) {
      // Hot - Red/Orange tones
      if (condition === "Clear") {
        gradient = "linear-gradient(135deg, #FF6B35 0%, #FFD700 50%, #FFA500 100%)";
      } else if (condition === "Cloudy") {
        gradient = "linear-gradient(135deg, #FF8C42 0%, #FFB84D 50%, #FF8C42 100%)";
      } else if (condition === "Rainy") {
        gradient = "linear-gradient(135deg, #FF7F50 0%, #FF6347 50%, #DC143C 100%)";
      } else if (condition === "Snowy") {
        gradient = "linear-gradient(135deg, #FFA07A 0%, #FFB6C1 50%, #FFC0CB 100%)";
      }
    } else if (tempInFahrenheit >= tempRange.warm[0]) {
      // Warm - Yellow/Orange tones
      if (condition === "Clear") {
        gradient = "linear-gradient(135deg, #FFD700 0%, #FFA500 50%, #FF8C00 100%)";
      } else if (condition === "Cloudy") {
        gradient = "linear-gradient(135deg, #F0E68C 0%, #FFD700 50%, #FFA500 100%)";
      } else if (condition === "Rainy") {
        gradient = "linear-gradient(135deg, #DEB887 0%, #D2B48C 50%, #CD853F 100%)";
      } else if (condition === "Snowy") {
        gradient = "linear-gradient(135deg, #FFE4B5 0%, #FFDAB9 50%, #F5DEB3 100%)";
      }
    } else if (tempInFahrenheit >= tempRange.cool[0]) {
      // Cool - Light blue/teal tones
      if (condition === "Clear") {
        gradient = "linear-gradient(135deg, #87CEEB 0%, #87CEFA 50%, #B0E0E6 100%)";
      } else if (condition === "Cloudy") {
        gradient = "linear-gradient(135deg, #B0C4DE 0%, #ADD8E6 50%, #87CEEB 100%)";
      } else if (condition === "Rainy") {
        gradient = "linear-gradient(135deg, #6495ED 0%, #4169E1 50%, #1E90FF 100%)";
      } else if (condition === "Snowy") {
        gradient = "linear-gradient(135deg, #E0FFFF 0%, #AFEEEE 50%, #7FFFD4 100%)";
      }
    } else {
      // Cold - Blue/icy tones
      if (condition === "Clear") {
        gradient = "linear-gradient(135deg, #4169E1 0%, #1E90FF 50%, #00BFFF 100%)";
      } else if (condition === "Cloudy") {
        gradient = "linear-gradient(135deg, #708090 0%, #778899 50%, #B0C4DE 100%)";
      } else if (condition === "Rainy") {
        gradient = "linear-gradient(135deg, #191970 0%, #00008B 50%, #0000CD 100%)";
      } else if (condition === "Snowy") {
        gradient = "linear-gradient(135deg, #F0F8FF 0%, #E0FFFF 50%, #B0E0E6 100%)";
      }
    }

    return gradient;
  };

  // Get weather icon based on condition
  const getWeatherIcon = () => {
    switch (condition) {
      case "Clear":
        return SunnyIcon;
      case "Cloudy":
        return CloudyIcon;
      case "Rainy":
        return RainyIcon;
      case "Snowy":
        return SnowyIcon;
      default:
        return SunnyIcon;
    }
  };

  return (
    <div
      className="reactive-weather"
      style={{ background: getGradientStyle() }}
    >
      <div className="weather-content-inner">
        {/* Location and Condition */}
        <div className="weather-header">
          <h2 className="location-name">
            {weatherData._resolved_location?.name || "Your Location"}
          </h2>
          <img
            src={getWeatherIcon()}
            alt={condition}
            className="weather-condition-icon"
          />
        </div>

        {/* Main Temperature Display */}
        <div className="temp-display-large">
          <span className="current-temp-large">
            {temp}°{units}
          </span>
          <span className="condition-text">{condition}</span>
        </div>

        {/* High/Low Temperature */}
        <div className="temp-range">
          <span className="temp-high">H: {Math.round(weatherData.temperature_high)}°</span>
          <span className="temp-separator">•</span>
          <span className="temp-low">L: {Math.round(weatherData.temperature_low)}°</span>
        </div>

        {/* Location Details */}
        <div className="location-details">
          <p className="timezone-info">
            {weatherData._resolved_location?.country} • {weatherData.timezone}
          </p>
        </div>

        {/* Use Button */}
        <button className="use-saved-btn" onClick={onUseWeather}>
          Use This Weather
        </button>
      </div>
    </div>
  );
}

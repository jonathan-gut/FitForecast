import { useEffect, useState } from "react";
import { getToken } from "../authStore";
import { apiMe } from "../api/auth";
import "./Dashboard.css";
import ProfileCard from "../components/ProfileCard";
import WeatherSelector from "../components/WeatherSelector";
import OccasionSelector from "../components/OccasionSelector";

export default function Dashboard() {
  const [me, setMe] = useState(null);
  const [err, setErr] = useState("");
  const [occasion, setOccasion] = useState("Casual");

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

  return (
    <div className="dashboard-page">
      <header className="dashboard-header">
        <h1 className="dashboard-title">FitForecast</h1>
        {me && (
          <ProfileCard 
            email={me.email}
            location={me.location}
            units={me.units}
            role={me.role}
            onUpdate={handleProfileUpdate}
          />
        )}
      </header>

      <div className="main-panel">

        {/* LEFT COLUMN */}
        <div className="left-panel">
          <WeatherSelector userUnits={me?.units || "F"} userLocation={me?.location || ""} />
          <OccasionSelector onSelect={setOccasion} />

          <button className="generate-btn">Generate Outfit</button>
        </div>

        {/* RIGHT COLUMN */}
        <div className="right-panel">
          <div className="outfit-preview">
            {/* Outfit rendering will go here */}
          </div>

          <button className="save-outfit-btn">Save Outfit</button>
        </div>

      </div>
    </div>
  );
}

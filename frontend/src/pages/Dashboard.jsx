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

  return (
    <div className="dashboard-page">
      <header className="dashboard-header">
        <h1 className="dashboard-title">FitForecast</h1>
        {me && <ProfileCard email={me.email} />}
      </header>

      <div className="main-panel">

        {/* LEFT COLUMN */}
        <div className="left-panel">
          <WeatherSelector />
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

import { useNavigate } from "react-router-dom";
import StatusBanner from "../components/StatusBanner";
import "./HomePage.css";

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="homepage">
      <StatusBanner />

      <h1 className="title">FitForecast</h1>

      <div className="button-container">
        <button
          className="button login-button"
          onClick={() => navigate("/login")}
          aria-label="Go to Login"
        >
          Login
        </button>

        <button
          className="button signup-button"
          onClick={() => navigate("/signup")}
          aria-label="Go to Sign Up"
        >
          Sign Up
        </button>
      </div>
    </div>
  );
}
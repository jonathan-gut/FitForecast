import { useState } from "react";
import { getToken } from "../authStore";
import "./RuleEngineDebugger.css";

const OCCASIONS = {
  Casual: "Casual",
  Date: "Date",
  Formal: "Formal",
  Workout: "Workout",
};

const CONDITIONS = {
  clear: "Clear",
  cloudy: "Cloudy",
  rainy: "Rainy",
  snowy: "Snowy",
};

const SCORE_THRESHOLDS = {
  excellent: 10,
  good: 5,
};

export default function RuleEngineDebugger() {
  const [tempF, setTempF] = useState(70);
  const [occasion, setOccasion] = useState("Casual");
  const [condition, setCondition] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [results, setResults] = useState(null);
  const [sortBy, setSortBy] = useState("score");
  const [sortOrder, setSortOrder] = useState("desc");

  const testOutfitScoring = async () => {
    setLoading(true);
    setError("");
    setResults(null);

    try {
      const token = getToken();
      if (!token) {
        throw new Error("Not authenticated. Please log in.");
      }

      const response = await fetch(
        "http://localhost:5050/api/admin/debug/test-outfit-scoring",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            temp_f: parseFloat(tempF),
            occasion,
            condition: condition || null,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }

      setResults(await response.json());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const sortItems = (items) => {
    return [...items].sort((a, b) => {
      const aVal = a[sortBy];
      const bVal = b[sortBy];

      if (typeof aVal === "string") {
        return sortOrder === "asc"
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }

      return sortOrder === "asc" ? aVal - bVal : bVal - aVal;
    });
  };

  const getScoreColor = (score) => {
    if (score >= SCORE_THRESHOLDS.excellent) return "#10b981";
    if (score >= SCORE_THRESHOLDS.good) return "#f59e0b";
    return "#ef4444";
  };

  const getScoreLabel = (score) => {
    if (score >= SCORE_THRESHOLDS.excellent) return "Great";
    if (score >= SCORE_THRESHOLDS.good) return "Good";
    if (score > 0) return "Okay";
    return "Poor";
  };

  return (
    <div className="rule-debugger">
      <h2>Test Rule Engine</h2>
      <p className="subtitle">See how items are scored for different weather and occasions</p>

      {/* Input Controls */}
      <div className="controls">
        <div className="control">
          <label>Temperature</label>
          <div className="input-with-unit">
            <input
              type="number"
              value={tempF}
              onChange={(e) => setTempF(e.target.value)}
              min="0"
              max="120"
            />
            <span className="unit">°F</span>
          </div>
        </div>

        <div className="control">
          <label>Occasion</label>
          <select value={occasion} onChange={(e) => setOccasion(e.target.value)}>
            {Object.entries(OCCASIONS).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <div className="control">
          <label>Weather</label>
          <select value={condition} onChange={(e) => setCondition(e.target.value)}>
            {Object.entries(CONDITIONS).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <button className="btn-test" onClick={testOutfitScoring} disabled={loading}>
          {loading ? "Testing..." : "Test"}
        </button>
      </div>

      {/* Error */}
      {error && <div className="error">{error}</div>}

      {/* Results */}
      {results && (
        <div className="results">
          {/* Scenario Summary */}
          <div className="summary">
            <h3>Test Scenario</h3>
            <div className="scenario-info">
              <span>{results.test_params.temp_f}°F</span>
              <span>{OCCASIONS[results.test_params.occasion]}</span>
              <span>{CONDITIONS[results.test_params.condition || ""]}</span>
            </div>
          </div>

          {/* Top Picks */}
          <div className="top-picks">
            <h3>Recommended Items</h3>
            <div className="picks">
              {results.top_picks.map((item, idx) => (
                <div key={item.id} className="pick">
                  <div className="pick-rank">#{idx + 1}</div>
                  <div className="pick-name">{item.name}</div>
                  <div className="pick-category">{item.category}</div>
                  <div
                    className="pick-score"
                    style={{ backgroundColor: getScoreColor(item.score) }}
                  >
                    <div className="score-value">{item.score.toFixed(1)}</div>
                    <div className="score-label">{getScoreLabel(item.score)}</div>
                  </div>
                  <div className="pick-details">
                    <span>Warmth: {item.warmth_score}</span>
                    <span>Style: {item.formality}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* All Items Table */}
          <div className="all-items">
            <div className="section-header">
              <h3>All Items Ranked ({results.all_items_scored.length})</h3>
              <div className="sorting">
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                  <option value="score">Sort: Score</option>
                  <option value="name">Sort: Name</option>
                  <option value="category">Sort: Category</option>
                  <option value="warmth_score">Sort: Warmth</option>
                </select>
                <button onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}>
                  {sortOrder === "asc" ? "↑" : "↓"}
                </button>
              </div>
            </div>

            <table>
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Category</th>
                  <th>Score</th>
                  <th>Warmth</th>
                  <th>Style</th>
                  <th>Activity</th>
                </tr>
              </thead>
              <tbody>
                {sortItems(results.all_items_scored).map((item) => (
                  <tr key={item.id}>
                    <td className="item-name">{item.name}</td>
                    <td>{item.category}</td>
                    <td>
                      <span
                        className="score-badge"
                        style={{ backgroundColor: getScoreColor(item.score) }}
                      >
                        {item.score.toFixed(1)}
                      </span>
                    </td>
                    <td>{item.warmth_score}</td>
                    <td>{item.formality}</td>
                    <td>{item.activity_comfort}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

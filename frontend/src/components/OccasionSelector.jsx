import { useState } from "react";
import CoffeeIcon from "../assets/Coffee.svg?url";
import DumbbellIcon from "../assets/Dumbbell.svg";
import BriefcaseIcon from "../assets/Briefcase.svg";
import HeartIcon from "../assets/Heart.svg";
import "./OccasionSelector.css";

const options = [
  { label: "Casual", icon: CoffeeIcon },
  { label: "Workout", icon: DumbbellIcon },
  { label: "Formal", icon: BriefcaseIcon },
  { label: "Date", icon: HeartIcon },
];

export default function OccasionSelector({ onSelect }) {
  const [selected, setSelected] = useState("Casual");

  const handleSelect = (option) => {
    setSelected(option);
    onSelect?.(option);
  };

  return (
    <div className="occasion-selector">
      <div className="occasion-header">
        <h2 className="occasion-title">What's the Occasion?</h2>
      </div>

      <div className="occasion-options">
        {options.map((opt) => (
          <button
            key={opt.label}
            onClick={() => handleSelect(opt.label)}
            className={`option-card ${selected === opt.label ? "active" : ""}`}
          >
            <div className="option-icon">
              <img src={opt.icon} alt={opt.label} />
            </div>
            <span>{opt.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

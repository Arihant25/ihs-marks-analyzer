"use client";

import React from "react";
import AnimatedButton from "./AnimatedButton";

type SubjectBoxProps = {
  title: string;
  onSubmit: (data: { taName: string; marks: number }) => void;
  color?: "lime" | "blue" | "orange";
};

const taOptions = [
  "Tanveer",
  "Sreenivas",
  "Medha",
  "Sathvika",
  "Anushka",
  "Tanish",
  "Kriti",
  "Gargie",
  "Rohan",
  "Aadi",
  "Asirith",
  "Chetan",
  "Rushil",
  "Akshit",
  "Chandana",
];

export default function SubjectBox({
  title,
  onSubmit,
  color,
}: SubjectBoxProps) {
  const [taName, setTaName] = React.useState(taOptions[0]);
  const [marks, setMarks] = React.useState<number>(0);

  const accentColor = color || "white";
  const textColor = `text-${accentColor}`;

  // Handle marks input change with decimal support
  const handleMarksChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    // Only set marks if it's a valid number
    if (!isNaN(value)) {
      setMarks(value);
    }
  };

  // Determine panel style based on color
  const getPanelStyle = () => {
    if (!color) return "";
    switch (color) {
      case "lime":
        return "panel-highlight";
      case "blue":
        return "panel-secondary";
      case "orange":
        return "panel-tertiary";
      default:
        return "";
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ taName, marks });
  };

  return (
    <div className={`panel my-3 p-4 md:p-6 w-full relative ${getPanelStyle()}`}>
      <div className="absolute -top-6 left-4 text-xs font-mono text-gray-500">
        // {title.toUpperCase().replace(" ", "_")}_MODULE
      </div>

      <h2 className={`text-lg md:text-xl font-bold mb-4 md:mb-6 font-mono uppercase ${textColor}`}>
        {title.replace(" ", "_")}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
        <div>
          <label
            htmlFor={`ta-${title}`}
            className="block text-xs font-mono text-gray-300 mb-2 uppercase"
          >
            Teaching_Assistant:
          </label>
          <select
            id={`ta-${title}`}
            value={taName}
            onChange={(e) => setTaName(e.target.value)}
            className="input-field w-full appearance-none text-sm md:text-base"
          >
            {taOptions.map((name) => (
              <option key={name} value={name} className="bg-black">
                {name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor={`marks-${title}`}
            className="block text-xs font-mono text-gray-300 mb-2 uppercase"
          >
            Marks_[0-30]:
          </label>
          <input
            id={`marks-${title}`}
            type="number"
            min="0"
            max="30"
            step="0.01"
            value={marks}
            onChange={handleMarksChange}
            className="input-field w-full text-sm md:text-base"
          />
        </div>

        <AnimatedButton type="submit" color={color} fullWidth>
          SUBMIT()
        </AnimatedButton>
      </form>
    </div>
  );
}

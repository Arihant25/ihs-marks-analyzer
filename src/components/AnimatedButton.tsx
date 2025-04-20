"use client";

import { ReactNode } from "react";

interface AnimatedButtonProps {
  children: ReactNode;
  onClick?: () => void;
  color?: "lime" | "blue" | "orange";
  type?: "button" | "submit" | "reset";
  className?: string;
  disabled?: boolean;
  fullWidth?: boolean;
}

export default function AnimatedButton({
  children,
  onClick,
  color = "lime",
  type = "button",
  className = "",
  disabled = false,
  fullWidth = false,
}: AnimatedButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`animated-button animated-button-${color} ${
        fullWidth ? "w-full" : ""
      } ${className} ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
    >
      <svg
        viewBox="0 0 24 24"
        className="arr-2"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M16.1716 10.9999L10.8076 5.63589L12.2218 4.22168L20 11.9999L12.2218 19.778L10.8076 18.3638L16.1716 12.9999H4V10.9999H16.1716Z"></path>
      </svg>
      <span className="text">{children}</span>
      <span className="circle"></span>
      <svg
        viewBox="0 0 24 24"
        className="arr-1"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M16.1716 10.9999L10.8076 5.63589L12.2218 4.22168L20 11.9999L12.2218 19.778L10.8076 18.3638L16.1716 12.9999H4V10.9999H16.1716Z"></path>
      </svg>
    </button>
  );
}

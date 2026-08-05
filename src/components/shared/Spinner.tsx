"use client";
import { CSSProperties } from "react";

interface SpinnerProps {
  size?: number;
  color?: string;
  className?: string;
}

const Spinner = ({ size = 60, color, className = "" }: SpinnerProps) => {
  const hasTailwindSizing = /\b(?:h|w)-\S+/.test(className);
  const resolvedSize = hasTailwindSizing ? undefined : size;

  const loaderStyle: CSSProperties = {
    position: "relative",
    color: color || "hsl(var(--primary))",
    ...(resolvedSize
      ? {
          width: `${resolvedSize}px`,
          height: `${resolvedSize}px`,
        }
      : {}),
  };

  const spinnerStyle: CSSProperties = {
    content: '""',
    boxSizing: "border-box",
    position: "absolute",
    inset: 0,
    width: "100%",
    height: "100%",
    borderRadius: "50%",
    borderTop: "2px solid currentColor",
    borderRight: "2px solid transparent",
    animation: "spinner 0.8s linear infinite",
  };

  return (
    <div className={`loader ${className}`} style={loaderStyle}>
      <div style={spinnerStyle} />
      <style>{`
        @keyframes spinner {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
};

export default Spinner;

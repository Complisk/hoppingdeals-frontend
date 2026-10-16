"use client";
import { useEffect, useState, type CSSProperties } from "react";

export default function AutoCtrlPress() {
  const [running, setRunning] = useState(false);
  const [isPressed, setIsPressed] = useState(false);

  // Auto Ctrl Press Logic
  useEffect(() => {
    if (!running) return;

    const interval = setInterval(() => {
      setIsPressed(true);

      const keyDown = new KeyboardEvent("keydown", {
        key: "Control",
        code: "ControlLeft",
        ctrlKey: true,
        bubbles: true,
      });

      const keyUp = new KeyboardEvent("keyup", {
        key: "Control",
        code: "ControlLeft",
        ctrlKey: false,
        bubbles: true,
      });

      document.dispatchEvent(keyDown);

      setTimeout(() => {
        document.dispatchEvent(keyUp);
        setIsPressed(false);
      }, 150);

    }, 1000);

    return () => clearInterval(interval);
  }, [running]);

  // Manual Keyboard Detection Logic
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Control") {
        setIsPressed(true);
      }
    };

    const handleKeyUp = (e) => {
      if (e.key === "Control") {
        setIsPressed(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  return (
    <div style={styles.container}>
      <h2>Auto + Manual CTRL Detector</h2>

      {/* Visual Ctrl Button */}
      <div
        style={{
          ...styles.ctrlKey,
          background: isPressed ? "#22c55e" : "#111",
          transform: isPressed ? "scale(0.95)" : "scale(1)",
        }}
      >
        CTRL
      </div>

      <div style={styles.status}>
        Status: {isPressed ? "Pressed" : "Released"}
      </div>

      <div style={styles.btnRow}>
        <button onClick={() => setRunning(true)} style={styles.start}>
          Start Auto
        </button>
        <button onClick={() => setRunning(false)} style={styles.stop}>
          Stop Auto
        </button>
      </div>
    </div>
  );
}

const styles: Record<string, CSSProperties> = {
  container: {
    height: "100vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 18,
    fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
  },
  ctrlKey: {
    width: 160,
    height: 90,
    borderRadius: 14,
    border: "2px solid #22c55e",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 30,
    fontWeight: "bold",
    color: "white",
    transition: "0.12s ease",
    boxShadow: "0 6px 18px rgba(0,0,0,0.35)",
  },
  status: {
    fontSize: 16,
    fontWeight: 500,
    color: "#444",
  },
  btnRow: {
    display: "flex",
    gap: 14,
  },
  start: {
    padding: "10px 24px",
    fontSize: 16,
    background: "#22c55e",
    color: "white",
    border: "none",
    borderRadius: 7,
    cursor: "pointer",
  },
  stop: {
    padding: "10px 24px",
    fontSize: 16,
    background: "#ef4444",
    color: "white",
    border: "none",
    borderRadius: 7,
    cursor: "pointer",
  },
};

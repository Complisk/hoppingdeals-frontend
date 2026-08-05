"use client";
import React, { useEffect, useState } from "react";

const LAUNCH_DATE = new Date("2026-03-29T23:59:59");

const getTimeLeft = () => {
  const difference = LAUNCH_DATE.getTime() - Date.now();

  if (difference <= 0) {
    return {
      days: "00",
      hours: "00",
      minutes: "00",
      seconds: "00",
      isLaunched: true,
    };
  }

  const totalSeconds = Math.floor(difference / 1000);
  const days = Math.floor(totalSeconds / (60 * 60 * 24));
  const hours = Math.floor((totalSeconds % (60 * 60 * 24)) / (60 * 60));
  const minutes = Math.floor((totalSeconds % (60 * 60)) / 60);
  const seconds = totalSeconds % 60;

  return {
    days: String(days).padStart(2, "0"),
    hours: String(hours).padStart(2, "0"),
    minutes: String(minutes).padStart(2, "0"),
    seconds: String(seconds).padStart(2, "0"),
    isLaunched: false,
  };
};

const timerUnits = [
  { key: "days", label: "Days" },
  { key: "hours", label: "Hours" },
  { key: "minutes", label: "Minutes" },
  { key: "seconds", label: "Seconds" },
] as const;

const Hero: React.FC = () => {
  const [timeLeft, setTimeLeft] = useState(getTimeLeft);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setTimeLeft(getTimeLeft());
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, []);

  return (
    <section className="w-full px-3 py-6 md:py-10">
      <div className="order-1 text-center lg:order-2">
        <h1 className="mx-auto max-w-full text-sm font-bold leading-snug text-gray-800 sm:max-w-[90%] sm:text-base md:text-lg lg:max-w-[55vw]">
          Promotions and deals in your area, offered by local businesses. Deals
          are updated throughout the day and could expire quickly, so keep
          checking to catch the best savings before they end.
        </h1>
      </div>
    </section>
  );
};

export default Hero;

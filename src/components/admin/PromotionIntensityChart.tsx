"use client";
import React from "react";

interface MomentumData {
  score: number;
  level: string;
  message: string;
}

interface PromotionIntensityChartProps {
  weeklyCount: number;
  monthlyCount: number;
  momentum: MomentumData | null;
}

// Calculate intensity level based on count and period type
const calculateIntensityLevel = (
  count: number,
  type: "weekly" | "monthly"
): "Low" | "Medium" | "High" => {
  if (type === "weekly") {
    // Weekly: 1 = Low, 2 = Medium, 3+ = High
    if (count <= 1) return "Low";
    if (count === 2) return "Medium";
    return "High";
  } else {
    // Monthly: 1-3 = Low, 4-7 = Medium, 8+ = High
    if (count <= 3) return "Low";
    if (count <= 7) return "Medium";
    return "High";
  }
};

// Get fill percentage from intensity level
const getFillPercentage = (level: "Low" | "Medium" | "High"): number => {
  switch (level) {
    case "Low":
      return 33;
    case "Medium":
      return 66;
    case "High":
      return 100;
    default:
      return 0;
  }
};

interface IntensityBarProps {
  label: string;
  level: "Low" | "Medium" | "High";
  isLarge?: boolean;
}

const IntensityBar: React.FC<IntensityBarProps> = ({
  label,
  level,
  isLarge = false,
}) => {
  const fillPercentage = getFillPercentage(level);

  return (
    <div className="flex flex-col items-center">
      <div className="flex items-stretch">
        {/* The Bar Container */}
        <div
          className={`relative border-2 border-foreground bg-card ${
            isLarge ? "w-28 h-36" : "w-16 h-24"
          }`}
        >
          {/* Fill - using primary color from system */}
          <div
            className="absolute bottom-0 left-0 right-0 transition-all duration-500 ease-out bg-primary"
            style={{
              height: `${fillPercentage}%`,
            }}
          />

          {/* Zone divider lines - showing Low, Medium, High zones */}
          <div className="absolute left-0 right-0 top-1/3 border-t border-dashed border-muted-foreground/30" />
          <div className="absolute left-0 right-0 top-2/3 border-t border-dashed border-muted-foreground/30" />
        </div>

        {/* Labels pointing to zones on the right side */}
        <div
          className={`flex flex-col justify-between py-1 ${
            isLarge ? "h-36 ml-2" : "h-24 ml-1"
          }`}
        >
          {/* High zone label - top */}
          <span
            className={`text-muted-foreground leading-none ${
              isLarge ? "text-xs" : "text-[10px]"
            } whitespace-nowrap`}
          >
            {isLarge ? "High Intensity" : "High"}
          </span>
          {/* Medium zone label - middle */}
          <span
            className={`text-muted-foreground leading-none ${
              isLarge ? "text-xs" : "text-[10px]"
            } whitespace-nowrap`}
          >
            {isLarge ? "Medium Intensity" : "Medium"}
          </span>
          {/* Low zone label - bottom */}
          <span
            className={`text-muted-foreground leading-none ${
              isLarge ? "text-xs" : "text-[10px]"
            } whitespace-nowrap`}
          >
            {isLarge ? "Low Intensity" : "Low"}
          </span>
        </div>
      </div>

      {/* Label below the bar */}
      <div className="mt-3 text-sm text-muted-foreground text-center whitespace-nowrap font-medium">
        {label}
      </div>
    </div>
  );
};

const PromotionIntensityChart: React.FC<PromotionIntensityChartProps> = ({
  weeklyCount,
  monthlyCount,
  momentum,
}) => {
  const weeklyLevel = calculateIntensityLevel(weeklyCount, "weekly");
  const monthlyLevel = calculateIntensityLevel(monthlyCount, "monthly");

  // Get momentum level from API or calculate based on score
  const getMomentumLevel = (): "Low" | "Medium" | "High" => {
    if (momentum?.level) {
      const level = momentum.level.toLowerCase();
      if (level === "high") return "High";
      if (level === "medium") return "Medium";
      return "Low";
    }
    // Fallback: calculate based on score
    if (momentum?.score) {
      if (momentum.score >= 70) return "High";
      if (momentum.score >= 40) return "Medium";
      return "Low";
    }
    return "Low";
  };

  const momentumLevel = getMomentumLevel();

  return (
    <div className="bg-card rounded-2xl p-6 border border-border">
      <h3 className="text-lg font-semibold text-foreground mb-6">
        Promotion Intensity
      </h3>

      <div className="flex items-end justify-center gap-8 md:gap-12 flex-wrap">
        {/* Weekly Bar - Last 7 days */}
        <IntensityBar label="Last 7 days" level={weeklyLevel} />

        {/* Monthly Bar - Last 30 days */}
        <IntensityBar label="Last 30 days" level={monthlyLevel} />

        {/* Overall Momentum Bar - Larger */}
        {/* <IntensityBar
          label="Overall Momentum"
          level={momentumLevel}
          isLarge={true}
        /> */}
      </div>

      {/* Momentum Message */}
      {momentum?.message && (
        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground">
            Momentum Score:{" "}
            <span className="font-semibold text-foreground">
              {momentum.score}%
            </span>
          </p>
          <p className="text-base font-medium text-primary mt-1">
            {momentum.message}
          </p>
        </div>
      )}
    </div>
  );
};

export default PromotionIntensityChart;

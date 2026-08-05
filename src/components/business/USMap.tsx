"use client";
import React, { useState } from "react";
import { cn } from "@/lib/utils";

interface StateInfo {
  code: string;
  name: string;
  timezone: string;
  color: string;
}

interface USMapProps {
  selectedStates?: string[];
  onStateSelect?: (stateCode: string) => void;
  onTimezoneSelect?: (timezone: string) => void;
  highlightTimezone?: string;
  interactive?: boolean;
}

const stateTimezones: Record<string, StateInfo> = {
  AZ: {
    code: "AZ",
    name: "Arizona",
    timezone: "Mountain",
    color: "bg-orange-400",
  },
  CA: {
    code: "CA",
    name: "California",
    timezone: "Pacific",
    color: "bg-orange-400",
  },
  NV: {
    code: "NV",
    name: "Nevada",
    timezone: "Pacific",
    color: "bg-orange-400",
  },
  OR: {
    code: "OR",
    name: "Oregon",
    timezone: "Pacific",
    color: "bg-orange-400",
  },
  WA: {
    code: "WA",
    name: "Washington",
    timezone: "Pacific",
    color: "bg-orange-400",
  },
  ID: {
    code: "ID",
    name: "Idaho",
    timezone: "Mountain",
    color: "bg-yellow-400",
  },
  MT: {
    code: "MT",
    name: "Montana",
    timezone: "Mountain",
    color: "bg-yellow-400",
  },
  WY: {
    code: "WY",
    name: "Wyoming",
    timezone: "Mountain",
    color: "bg-yellow-400",
  },
  UT: {
    code: "UT",
    name: "Utah",
    timezone: "Mountain",
    color: "bg-yellow-400",
  },
  CO: {
    code: "CO",
    name: "Colorado",
    timezone: "Mountain",
    color: "bg-yellow-400",
  },
  NM: {
    code: "NM",
    name: "New Mexico",
    timezone: "Mountain",
    color: "bg-yellow-400",
  },
  ND: {
    code: "ND",
    name: "North Dakota",
    timezone: "Central",
    color: "bg-green-400",
  },
  SD: {
    code: "SD",
    name: "South Dakota",
    timezone: "Central",
    color: "bg-green-400",
  },
  NE: {
    code: "NE",
    name: "Nebraska",
    timezone: "Central",
    color: "bg-green-400",
  },
  KS: {
    code: "KS",
    name: "Kansas",
    timezone: "Central",
    color: "bg-green-400",
  },
  OK: {
    code: "OK",
    name: "Oklahoma",
    timezone: "Central",
    color: "bg-green-400",
  },
  TX: { code: "TX", name: "Texas", timezone: "Central", color: "bg-green-400" },
  MN: {
    code: "MN",
    name: "Minnesota",
    timezone: "Central",
    color: "bg-green-400",
  },
  IA: { code: "IA", name: "Iowa", timezone: "Central", color: "bg-green-400" },
  MO: {
    code: "MO",
    name: "Missouri",
    timezone: "Central",
    color: "bg-green-400",
  },
  AR: {
    code: "AR",
    name: "Arkansas",
    timezone: "Central",
    color: "bg-green-400",
  },
  LA: {
    code: "LA",
    name: "Louisiana",
    timezone: "Central",
    color: "bg-green-400",
  },
  WI: {
    code: "WI",
    name: "Wisconsin",
    timezone: "Central",
    color: "bg-green-400",
  },
  IL: {
    code: "IL",
    name: "Illinois",
    timezone: "Central",
    color: "bg-green-400",
  },
  MI: {
    code: "MI",
    name: "Michigan",
    timezone: "Eastern",
    color: "bg-blue-400",
  },
  IN: {
    code: "IN",
    name: "Indiana",
    timezone: "Eastern",
    color: "bg-blue-400",
  },
  OH: { code: "OH", name: "Ohio", timezone: "Eastern", color: "bg-blue-400" },
  KY: {
    code: "KY",
    name: "Kentucky",
    timezone: "Eastern",
    color: "bg-blue-400",
  },
  TN: {
    code: "TN",
    name: "Tennessee",
    timezone: "Eastern",
    color: "bg-blue-400",
  },
  MS: {
    code: "MS",
    name: "Mississippi",
    timezone: "Central",
    color: "bg-green-400",
  },
  AL: {
    code: "AL",
    name: "Alabama",
    timezone: "Eastern",
    color: "bg-blue-400",
  },
  GA: {
    code: "GA",
    name: "Georgia",
    timezone: "Eastern",
    color: "bg-blue-400",
  },
  FL: {
    code: "FL",
    name: "Florida",
    timezone: "Eastern",
    color: "bg-blue-400",
  },
  SC: {
    code: "SC",
    name: "South Carolina",
    timezone: "Eastern",
    color: "bg-blue-400",
  },
  NC: {
    code: "NC",
    name: "North Carolina",
    timezone: "Eastern",
    color: "bg-blue-400",
  },
  VA: {
    code: "VA",
    name: "Virginia",
    timezone: "Eastern",
    color: "bg-blue-400",
  },
  WV: {
    code: "WV",
    name: "West Virginia",
    timezone: "Eastern",
    color: "bg-blue-400",
  },
  PA: {
    code: "PA",
    name: "Pennsylvania",
    timezone: "Eastern",
    color: "bg-blue-400",
  },
  NY: {
    code: "NY",
    name: "New York",
    timezone: "Eastern",
    color: "bg-blue-400",
  },
  VT: {
    code: "VT",
    name: "Vermont",
    timezone: "Eastern",
    color: "bg-blue-400",
  },
  NH: {
    code: "NH",
    name: "New Hampshire",
    timezone: "Eastern",
    color: "bg-blue-400",
  },
  ME: { code: "ME", name: "Maine", timezone: "Eastern", color: "bg-blue-400" },
  MA: {
    code: "MA",
    name: "Massachusetts",
    timezone: "Eastern",
    color: "bg-blue-400",
  },
  RI: {
    code: "RI",
    name: "Rhode Island",
    timezone: "Eastern",
    color: "bg-blue-400",
  },
  CT: {
    code: "CT",
    name: "Connecticut",
    timezone: "Eastern",
    color: "bg-blue-400",
  },
  NJ: {
    code: "NJ",
    name: "New Jersey",
    timezone: "Eastern",
    color: "bg-blue-400",
  },
  DE: {
    code: "DE",
    name: "Delaware",
    timezone: "Eastern",
    color: "bg-blue-400",
  },
  MD: {
    code: "MD",
    name: "Maryland",
    timezone: "Eastern",
    color: "bg-blue-400",
  },
  HI: {
    code: "HI",
    name: "Hawaii",
    timezone: "Hawaii-Aleutian",
    color: "bg-pink-400",
  },
  AK: {
    code: "AK",
    name: "Alaska",
    timezone: "Alaska",
    color: "bg-purple-400",
  },
};

const timezoneColors: Record<string, string> = {
  Eastern: "bg-blue-400",
  Central: "bg-green-400",
  Mountain: "bg-yellow-400",
  Pacific: "bg-orange-400",
  Alaska: "bg-purple-400",
  "Hawaii-Aleutian": "bg-pink-400",
};

const USMap: React.FC<USMapProps> = ({
  selectedStates = [],
  onStateSelect = () => {},
  onTimezoneSelect = () => {},
  highlightTimezone = "",
  interactive = true,
}) => {
  const [hoveredState, setHoveredState] = useState<string | null>(null);

  const handleStateClick = (stateCode: string) => {
    if (interactive) {
      onStateSelect(stateCode);
      onTimezoneSelect(stateTimezones[stateCode]?.timezone || "");
    }
  };

  const isStateSelected = (stateCode: string) =>
    selectedStates.includes(stateCode);
  const getStateColor = (stateCode: string) => {
    if (isStateSelected(stateCode)) {
      return "fill-primary hover:fill-primary/80";
    }
    if (
      highlightTimezone &&
      stateTimezones[stateCode]?.timezone === highlightTimezone
    ) {
      return "fill-accent hover:fill-accent/80";
    }
    return "fill-border hover:fill-muted-foreground transition-colors";
  };

  return (
    <div className="w-full bg-card rounded-2xl p-6 border border-border">
      <div className="relative w-full" style={{ aspectRatio: "16/10" }}>
        <svg
          viewBox="0 0 960 600"
          className="w-full h-full"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Pacific Region - Orange */}
          <g
            className="cursor-pointer"
            onMouseEnter={() => interactive && setHoveredState("WA")}
            onMouseLeave={() => setHoveredState(null)}
            onClick={() => handleStateClick("WA")}
          >
            <text
              x="70"
              y="130"
              className="text-lg font-bold fill-foreground pointer-events-none"
              onClick={(e) => e.stopPropagation()}
            >
              CLICK
            </text>
            <path
              className={cn(getStateColor("WA"), "cursor-pointer")}
              d="M 80 80 L 120 80 L 120 140 L 80 140 Z"
              opacity={hoveredState === "WA" ? 0.8 : 0.6}
            />
          </g>

          {/* Mountain Region - Yellow */}
          <g
            className="cursor-pointer"
            onMouseEnter={() => interactive && setHoveredState("MT")}
            onMouseLeave={() => setHoveredState(null)}
            onClick={() => handleStateClick("MT")}
          >
            <text
              x="160"
              y="130"
              className="text-lg font-bold fill-foreground pointer-events-none"
              onClick={(e) => e.stopPropagation()}
            >
              CLICK
            </text>
            <path
              className={cn(getStateColor("MT"), "cursor-pointer")}
              d="M 140 80 L 200 80 L 200 140 L 140 140 Z"
              opacity={hoveredState === "MT" ? 0.8 : 0.6}
            />
          </g>

          {/* Central Region - Green */}
          <g
            className="cursor-pointer"
            onMouseEnter={() => interactive && setHoveredState("ND")}
            onMouseLeave={() => setHoveredState(null)}
            onClick={() => handleStateClick("ND")}
          >
            <text
              x="270"
              y="130"
              className="text-lg font-bold fill-foreground pointer-events-none"
              onClick={(e) => e.stopPropagation()}
            >
              CLICK
            </text>
            <path
              className={cn(getStateColor("ND"), "cursor-pointer")}
              d="M 240 80 L 300 80 L 300 140 L 240 140 Z"
              opacity={hoveredState === "ND" ? 0.8 : 0.6}
            />
          </g>

          {/* Eastern Region - Blue */}
          <g
            className="cursor-pointer"
            onMouseEnter={() => interactive && setHoveredState("NY")}
            onMouseLeave={() => setHoveredState(null)}
            onClick={() => handleStateClick("NY")}
          >
            <text
              x="740"
              y="130"
              className="text-lg font-bold fill-foreground pointer-events-none"
              onClick={(e) => e.stopPropagation()}
            >
              CLICK
            </text>
            <path
              className={cn(getStateColor("NY"), "cursor-pointer")}
              d="M 720 80 L 780 80 L 780 140 L 720 140 Z"
              opacity={hoveredState === "NY" ? 0.8 : 0.6}
            />
          </g>

          {/* Alaska - Purple */}
          <g
            className="cursor-pointer"
            onMouseEnter={() => interactive && setHoveredState("AK")}
            onMouseLeave={() => setHoveredState(null)}
            onClick={() => handleStateClick("AK")}
          >
            <text
              x="70"
              y="370"
              className="text-lg font-bold fill-foreground pointer-events-none"
              onClick={(e) => e.stopPropagation()}
            >
              CLICK
            </text>
            <path
              className={cn(getStateColor("AK"), "cursor-pointer")}
              d="M 50 350 L 110 350 L 110 410 L 50 410 Z"
              opacity={hoveredState === "AK" ? 0.8 : 0.6}
            />
          </g>

          {/* Hawaii - Pink */}
          <g
            className="cursor-pointer"
            onMouseEnter={() => interactive && setHoveredState("HI")}
            onMouseLeave={() => setHoveredState(null)}
            onClick={() => handleStateClick("HI")}
          >
            <text
              x="150"
              y="450"
              className="text-lg font-bold fill-foreground pointer-events-none"
              onClick={(e) => e.stopPropagation()}
            >
              CLICK
            </text>
            <path
              className={cn(getStateColor("HI"), "cursor-pointer")}
              d="M 140 430 L 200 430 L 200 490 L 140 490 Z"
              opacity={hoveredState === "HI" ? 0.8 : 0.6}
            />
          </g>
        </svg>
      </div>

      {/* State Info */}
      {hoveredState && (
        <div className="mt-4 p-3 bg-accent rounded-lg text-sm">
          <span className="font-medium text-foreground">
            {stateTimezones[hoveredState]?.name}
          </span>
          <span className="text-muted-foreground ml-2">({hoveredState})</span>
          <span className="text-muted-foreground ml-4">
            Timezone: {stateTimezones[hoveredState]?.timezone}
          </span>
        </div>
      )}
    </div>
  );
};

export default USMap;

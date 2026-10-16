"use client";
import { useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface USATimezoneMapProps {
  selectedTimezone: string;
  onTimezoneSelect: (timezone: string) => void;
  selectedStates: string[];
  onStateSelect: (stateId: string) => void;
}

// Simplified US states with their timezones and approximate positions
const usStates = [
  // Pacific Time
  { id: 'WA', name: 'Washington', timezone: 'America/Los_Angeles', x: 12, y: 8, color: 'hsl(var(--chart-1))' },
  { id: 'OR', name: 'Oregon', timezone: 'America/Los_Angeles', x: 10, y: 18, color: 'hsl(var(--chart-1))' },
  { id: 'CA', name: 'California', timezone: 'America/Los_Angeles', x: 8, y: 35, color: 'hsl(var(--chart-1))' },
  { id: 'NV', name: 'Nevada', timezone: 'America/Los_Angeles', x: 15, y: 30, color: 'hsl(var(--chart-1))' },
  
  // Mountain Time
  { id: 'MT', name: 'Montana', timezone: 'America/Denver', x: 25, y: 10, color: 'hsl(var(--chart-2))' },
  { id: 'ID', name: 'Idaho', timezone: 'America/Denver', x: 20, y: 18, color: 'hsl(var(--chart-2))' },
  { id: 'WY', name: 'Wyoming', timezone: 'America/Denver', x: 30, y: 22, color: 'hsl(var(--chart-2))' },
  { id: 'UT', name: 'Utah', timezone: 'America/Denver', x: 22, y: 32, color: 'hsl(var(--chart-2))' },
  { id: 'CO', name: 'Colorado', timezone: 'America/Denver', x: 32, y: 35, color: 'hsl(var(--chart-2))' },
  { id: 'AZ', name: 'Arizona', timezone: 'America/Denver', x: 22, y: 48, color: 'hsl(var(--chart-2))' },
  { id: 'NM', name: 'New Mexico', timezone: 'America/Denver', x: 32, y: 50, color: 'hsl(var(--chart-2))' },
  
  // Central Time
  { id: 'ND', name: 'North Dakota', timezone: 'America/Chicago', x: 40, y: 12, color: 'hsl(var(--chart-3))' },
  { id: 'SD', name: 'South Dakota', timezone: 'America/Chicago', x: 40, y: 22, color: 'hsl(var(--chart-3))' },
  { id: 'NE', name: 'Nebraska', timezone: 'America/Chicago', x: 42, y: 30, color: 'hsl(var(--chart-3))' },
  { id: 'KS', name: 'Kansas', timezone: 'America/Chicago', x: 44, y: 40, color: 'hsl(var(--chart-3))' },
  { id: 'OK', name: 'Oklahoma', timezone: 'America/Chicago', x: 46, y: 50, color: 'hsl(var(--chart-3))' },
  { id: 'TX', name: 'Texas', timezone: 'America/Chicago', x: 45, y: 62, color: 'hsl(var(--chart-3))' },
  { id: 'MN', name: 'Minnesota', timezone: 'America/Chicago', x: 52, y: 15, color: 'hsl(var(--chart-3))' },
  { id: 'IA', name: 'Iowa', timezone: 'America/Chicago', x: 54, y: 28, color: 'hsl(var(--chart-3))' },
  { id: 'MO', name: 'Missouri', timezone: 'America/Chicago', x: 56, y: 40, color: 'hsl(var(--chart-3))' },
  { id: 'AR', name: 'Arkansas', timezone: 'America/Chicago', x: 56, y: 52, color: 'hsl(var(--chart-3))' },
  { id: 'LA', name: 'Louisiana', timezone: 'America/Chicago', x: 58, y: 65, color: 'hsl(var(--chart-3))' },
  { id: 'WI', name: 'Wisconsin', timezone: 'America/Chicago', x: 60, y: 18, color: 'hsl(var(--chart-3))' },
  { id: 'IL', name: 'Illinois', timezone: 'America/Chicago', x: 62, y: 32, color: 'hsl(var(--chart-3))' },
  
  // Eastern Time
  { id: 'MI', name: 'Michigan', timezone: 'America/New_York', x: 68, y: 20, color: 'hsl(var(--chart-4))' },
  { id: 'IN', name: 'Indiana', timezone: 'America/New_York', x: 68, y: 35, color: 'hsl(var(--chart-4))' },
  { id: 'OH', name: 'Ohio', timezone: 'America/New_York', x: 74, y: 32, color: 'hsl(var(--chart-4))' },
  { id: 'KY', name: 'Kentucky', timezone: 'America/New_York', x: 72, y: 42, color: 'hsl(var(--chart-4))' },
  { id: 'TN', name: 'Tennessee', timezone: 'America/New_York', x: 70, y: 50, color: 'hsl(var(--chart-4))' },
  { id: 'MS', name: 'Mississippi', timezone: 'America/New_York', x: 64, y: 58, color: 'hsl(var(--chart-4))' },
  { id: 'AL', name: 'Alabama', timezone: 'America/New_York', x: 70, y: 58, color: 'hsl(var(--chart-4))' },
  { id: 'GA', name: 'Georgia', timezone: 'America/New_York', x: 76, y: 55, color: 'hsl(var(--chart-4))' },
  { id: 'FL', name: 'Florida', timezone: 'America/New_York', x: 78, y: 70, color: 'hsl(var(--chart-4))' },
  { id: 'SC', name: 'South Carolina', timezone: 'America/New_York', x: 80, y: 50, color: 'hsl(var(--chart-4))' },
  { id: 'NC', name: 'North Carolina', timezone: 'America/New_York', x: 82, y: 45, color: 'hsl(var(--chart-4))' },
  { id: 'VA', name: 'Virginia', timezone: 'America/New_York', x: 82, y: 38, color: 'hsl(var(--chart-4))' },
  { id: 'WV', name: 'West Virginia', timezone: 'America/New_York', x: 78, y: 38, color: 'hsl(var(--chart-4))' },
  { id: 'PA', name: 'Pennsylvania', timezone: 'America/New_York', x: 80, y: 28, color: 'hsl(var(--chart-4))' },
  { id: 'NY', name: 'New York', timezone: 'America/New_York', x: 84, y: 20, color: 'hsl(var(--chart-4))' },
  { id: 'NJ', name: 'New Jersey', timezone: 'America/New_York', x: 86, y: 30, color: 'hsl(var(--chart-4))' },
  { id: 'CT', name: 'Connecticut', timezone: 'America/New_York', x: 90, y: 24, color: 'hsl(var(--chart-4))' },
  { id: 'MA', name: 'Massachusetts', timezone: 'America/New_York', x: 92, y: 20, color: 'hsl(var(--chart-4))' },
  { id: 'ME', name: 'Maine', timezone: 'America/New_York', x: 94, y: 10, color: 'hsl(var(--chart-4))' },
];

const timezones = [
  { id: 'America/Los_Angeles', name: 'Pacific Time (PT)', color: 'hsl(var(--chart-1))' },
  { id: 'America/Denver', name: 'Mountain Time (MT)', color: 'hsl(var(--chart-2))' },
  { id: 'America/Chicago', name: 'Central Time (CT)', color: 'hsl(var(--chart-3))' },
  { id: 'America/New_York', name: 'Eastern Time (ET)', color: 'hsl(var(--chart-4))' },
];

const USATimezoneMap = ({ selectedTimezone, onTimezoneSelect, selectedStates, onStateSelect }: USATimezoneMapProps) => {
  const [hoveredState, setHoveredState] = useState<string | null>(null);

  const handleStateClick = (state: typeof usStates[0]) => {
    onStateSelect(state.id);
    onTimezoneSelect(state.timezone);
  };

  return (
    <div className="space-y-4">
      {/* Timezone Legend */}
      <div className="flex flex-wrap gap-3">
        {timezones.map((tz) => (
          <button
            key={tz.id}
            onClick={() => onTimezoneSelect(tz.id)}
            className={cn(
              "flex items-center gap-2 px-3 py-2 rounded-lg border transition-all text-sm font-medium",
              selectedTimezone === tz.id
                ? "border-primary bg-primary/10 text-foreground"
                : "border-border hover:border-primary/50 text-muted-foreground"
            )}
          >
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: tz.color }}
            />
            {tz.name}
          </button>
        ))}
      </div>

      {/* Interactive Map */}
      <div className="relative bg-gradient-to-br from-secondary/50 to-secondary rounded-2xl p-4 overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCI+CjxyZWN0IHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgZmlsbD0ibm9uZSIvPgo8cGF0aCBkPSJNMCAzMGgzME0zMCAwdjMwIiBzdHJva2U9InJnYmEoMCwwLDAsMC4wNSkiLz4KPC9zdmc+')] opacity-50" />
        
        <div className="relative aspect-[16/9] min-h-[300px]">
          {usStates.map((state) => (
            <motion.button
              key={state.id}
              className={cn(
                "absolute w-10 h-10 rounded-lg flex items-center justify-center text-xs font-bold transition-all shadow-sm",
                selectedStates.includes(state.id)
                  ? "ring-2 ring-primary ring-offset-2 ring-offset-background z-10"
                  : "hover:scale-110"
              )}
              style={{
                left: `${state.x}%`,
                top: `${state.y}%`,
                backgroundColor: state.color,
                transform: 'translate(-50%, -50%)',
              }}
              onClick={() => handleStateClick(state)}
              onMouseEnter={() => setHoveredState(state.id)}
              onMouseLeave={() => setHoveredState(null)}
              whileHover={{ scale: 1.15, zIndex: 20 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="text-white drop-shadow-md">{state.id}</span>
              
              {/* Tooltip */}
              {hoveredState === state.id && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute bottom-full mb-2 px-2 py-1 bg-foreground text-background text-xs rounded whitespace-nowrap z-30"
                >
                  {state.name}
                </motion.div>
              )}
            </motion.button>
          ))}
        </div>

        {/* Selected States Display */}
        {selectedStates.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="text-sm text-muted-foreground">Selected:</span>
            {selectedStates.map((stateId) => {
              const state = usStates.find(s => s.id === stateId);
              return (
                <span 
                  key={stateId}
                  className="px-2 py-1 rounded-full text-xs font-medium text-white"
                  style={{ backgroundColor: state?.color }}
                >
                  {state?.name}
                </span>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default USATimezoneMap;
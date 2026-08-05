"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import { MapPin, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import Spinner from "@/components/shared/Spinner";

interface LocationItem {
  id: number;
  name: string;
  type: "state" | "city";
  state_code?: string;
  state_name?: string;
  country_name: string;
  country_code: string;
}

interface LocationSelectorProps {
  onSelect: (location: LocationItem) => void;
  placeholder?: string;
  label?: string;
}

// Debounce function
const debounce = (func: Function, delay: number) => {
  let timeoutId: NodeJS.Timeout;
  return (...args: any[]) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

const LocationSelector: React.FC<LocationSelectorProps> = ({
  onSelect,
  placeholder = "Search for city or state...",
  label = "Select Location",
}) => {
  const [search, setSearch] = useState("");
  const [options, setOptions] = useState<LocationItem[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  const API_KEY = "3304c0eb2bmsh56097a82e134642p140415jsn6c3faf39eea6";
  const API_HOST = "city-and-state-search-api.p.rapidapi.com";

  // Fetch locations from API
  const fetchLocations = async (query: string) => {
    if (!query.trim()) {
      setOptions([]);
      setError("");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await fetch(
        `https://${API_HOST}/search?q=${encodeURIComponent(query)}`,
        {
          method: "GET",
          headers: {
            "x-rapidapi-key": API_KEY,
            "x-rapidapi-host": API_HOST,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch locations");
      }

      const data: LocationItem[] = await response.json();

      // Filter for US locations only and sort by type (states first, then cities)
      const usLocations = data
        .filter((item) => item.country_code === "US")
        .sort((a, b) => {
          // States first
          if (a.type === "state" && b.type !== "state") return -1;
          if (a.type !== "state" && b.type === "state") return 1;
          return a.name.localeCompare(b.name);
        });

      setOptions(usLocations);
      setShowDropdown(usLocations.length > 0);
    } catch (err) {
      console.error("Location API Error:", err);
      setError("Failed to fetch locations. Please try again.");
      setOptions([]);
    } finally {
      setIsLoading(false);
    }
  };

  const debouncedFetch = useCallback(debounce(fetchLocations, 600), []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearch(value);
    if (value.length >= 2) {
      debouncedFetch(value);
    } else {
      setOptions([]);
      setShowDropdown(false);
      setError("");
    }
  };

  const handleOptionClick = (option: LocationItem) => {
    onSelect(option);
    setSearch(
      `${option.name}${option.state_code ? ` (${option.state_code})` : ""}`
    );
    setShowDropdown(false);
    setError("");
  };

  // Close dropdown if clicked outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getLocationLabel = (item: LocationItem) => {
    if (item.type === "state") {
      return `${item.name} (${item.state_code}) - State`;
    } else {
      return `${item.name}, ${item.state_name} (${item.state_code}) - City`;
    }
  };

  return (
    <div className="w-full space-y-2">
      {label && <Label htmlFor="location-search">{label}</Label>}
      <div className="relative" ref={containerRef}>
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
          <Input
            id="location-search"
            type="text"
            value={search}
            onChange={handleInputChange}
            onFocus={() => options.length > 0 && setShowDropdown(true)}
            placeholder={placeholder}
            className="pl-10"
            disabled={isLoading}
          />
          {isLoading && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <Spinner className="h-4 w-4 text-primary" />
            </div>
          )}
        </div>

        {error && (
          <div className="mt-2 flex items-center gap-2 text-sm text-destructive">
            <AlertCircle className="h-4 w-4" />
            {error}
          </div>
        )}

        {/* Dropdown Results */}
        {showDropdown && options.length > 0 && (
          <div className="absolute z-50 w-full mt-2 bg-background border border-border rounded-lg shadow-lg max-h-80 overflow-y-auto">
            {options.map((option) => (
              <button
                key={`${option.id}-${option.type}`}
                onClick={() => handleOptionClick(option)}
                className={cn(
                  "w-full text-left px-4 py-3 hover:bg-accent transition-colors border-b border-border last:border-b-0 flex items-start gap-3",
                  "focus:outline-none focus:bg-accent"
                )}
              >
                <div className="flex-shrink-0 mt-0.5">
                  {option.type === "state" ? (
                    <div className="h-5 w-5 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
                      {option.state_code}
                    </div>
                  ) : (
                    <MapPin className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-foreground">
                    {option.name}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {option.type === "state"
                      ? `State • ${option.country_name}`
                      : `${option.state_name}, ${option.state_code} • City`}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
        {showDropdown &&
          options.length === 0 &&
          !isLoading &&
          search.length >= 2 && (
            <div className="absolute z-50 w-full mt-2 bg-background border border-border rounded-lg shadow-lg p-4 text-center text-muted-foreground">
              No locations found for "{search}"
            </div>
          )}

        {isLoading && (
          <div className="absolute z-50 w-full mt-2 bg-background border border-border rounded-lg shadow-lg p-4 text-center text-muted-foreground">
            Searching locations...
          </div>
        )}
      </div>
    </div>
  );
};

export default LocationSelector;

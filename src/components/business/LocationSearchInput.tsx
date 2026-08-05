"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { MapPin, AlertCircle, X } from "lucide-react";
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

interface LocationSearchInputProps {
  label: string;
  placeholder?: string;
  value?: string;
  onSelect: (location: LocationItem) => void;
  selectedLocation?: LocationItem | null;
  filterType?: "state" | "city" | "both";
}

// Debounce function
const debounce = (func: Function, delay: number) => {
  let timeoutId: NodeJS.Timeout;
  return (...args: any[]) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

const LocationSearchInput: React.FC<LocationSearchInputProps> = ({
  label,
  placeholder = "Search location...",
  onSelect,
  selectedLocation = null,
  filterType = "both",
}) => {
  const [search, setSearch] = useState("");
  const [options, setOptions] = useState<LocationItem[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  const API_KEY = "3304c0eb2bmsh56097a82e134642p140415jsn6c3faf39eea6";
  const API_HOST = "city-and-state-search-api.p.rapidapi.com";

  // Fetch locations from single endpoint
  const fetchLocations = async (query: string) => {
    if (!query.trim()) {
      setOptions([]);
      setError("");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const url = `https://${API_HOST}/search?q=${encodeURIComponent(
        query
      )}&limit=50&country_code=US`;

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "x-rapidapi-key": API_KEY,
          "x-rapidapi-host": API_HOST,
        },
      });

      if (!response.ok) throw new Error("Failed to fetch locations");

      let transformed: any[] = await response.json();

      if (filterType === "city") {
        transformed = transformed.filter((item) => item.type === "city");
      } else if (filterType === "state") {
        transformed = transformed.filter((item) => item.type === "state");
      }

      setOptions(transformed);
      setShowDropdown(transformed.length > 0);
    } catch (err) {
      console.error("Location API Error:", err);
      setError("Failed to fetch locations. Please try again.");
      setOptions([]);
    } finally {
      setIsLoading(false);
    }
  };

  const debouncedFetch = useCallback(debounce(fetchLocations, 600), [
    filterType,
  ]);

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

  const handleClear = () => {
    setSearch("");
    setOptions([]);
    setShowDropdown(false);
    setError("");
  };

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

  return (
    <div className="w-full space-y-2">
      <Label htmlFor={`location-${label}`}>{label}</Label>
      <div className="relative" ref={containerRef}>
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
          <Input
            id={`location-${label}`}
            type="text"
            value={search}
            onChange={handleInputChange}
            onFocus={() => options.length > 0 && setShowDropdown(true)}
            placeholder={placeholder}
            className="pl-10 pr-10"
          />
          {search && (
            <button
              onClick={handleClear}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              type="button"
            >
              <X className="h-5 w-5" />
            </button>
          )}
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
                    <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
                      {option.state_code ||
                        option.name.substring(0, 2).toUpperCase()}
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
                      : `${option.state_name} • City`}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* No Results */}
        {showDropdown &&
          options.length === 0 &&
          !isLoading &&
          search.length >= 2 && (
            <div className="absolute z-50 w-full mt-2 bg-background border border-border rounded-lg shadow-lg p-4 text-center text-muted-foreground">
              No locations found for "{search}"
            </div>
          )}

        {/* Loading State */}
        {isLoading && (
          <div className="absolute z-50 w-full mt-2 bg-background border border-border rounded-lg shadow-lg p-4 text-center text-muted-foreground">
            Searching locations...
          </div>
        )}
      </div>
    </div>
  );
};

export default LocationSearchInput;

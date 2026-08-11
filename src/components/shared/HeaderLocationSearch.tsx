"use client";
import React, { useState, useEffect, useRef } from "react";
import { MapPin, AlertCircle } from "lucide-react";
import { useGoogleMapsScript } from "@/hooks/useGoogleMapsScript";

interface HeaderLocationSearchProps {
  className?: string;
  /** Render white text — used inside the dark/overlay home header */
  light?: boolean;
}

const HeaderLocationSearch: React.FC<HeaderLocationSearchProps> = ({
  className = "",
  light = false,
}) => {
  const [currentLocation, setCurrentLocation] =
    useState<string>("Set Location");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [predictions, setPredictions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const autoServiceRef = useRef<any>(null);
  const detailsServiceRef = useRef<any>(null);
  const debounceRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Load Google Maps (Places) once — the actual search only works after it's ready.
  const maps = useGoogleMapsScript();
  const isMapsReady = maps.status === "ready";

  // Initialize Google Places services once the Maps script has loaded.
  useEffect(() => {
    if (!isMapsReady || typeof document === "undefined") return;

    autoServiceRef.current =
      new window.google.maps.places.AutocompleteService();
    detailsServiceRef.current = new window.google.maps.places.PlacesService(
      document.createElement("div"),
    );
  }, [isMapsReady]);

  // Load current location from localStorage
  useEffect(() => {
    const loadLocation = () => {
      if (typeof window === "undefined") {
        setCurrentLocation("Set Location");
        return;
      }

      try {
        const stored = window.localStorage.getItem("userLocation");
        if (stored) {
          const location = JSON.parse(stored);
          const displayText =
            location.city && location.state_code
              ? `${location.city}, ${location.state_code}`
              : location.city || location.state || "Set Location";
          setCurrentLocation(displayText);
        } else {
          setCurrentLocation("Set Location");
        }
      } catch (e) {
        console.error("Error loading location:", e);
        setCurrentLocation("Set Location");
      }
    };

    loadLocation();

    // Listen for location changes from other components
    const handleLocationChange = () => {
      loadLocation();
    };

    if (typeof window === "undefined") {
      return;
    }

    window.addEventListener("locationChanged", handleLocationChange);
    return () =>
      window.removeEventListener("locationChanged", handleLocationChange);
  }, []);

  // Handle search input changes
  const handleSearchChange = (value: string) => {
    setQuery(value);

    if (!value || !autoServiceRef.current) {
      setPredictions([]);
      return;
    }

    clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(() => {
      setLoading(true);

      const options: any = {
        input: value,
        componentRestrictions: { country: "us" },
      };

      autoServiceRef.current.getPlacePredictions(
        options,
        (preds: any, status: string) => {
          setLoading(false);
          if (status === "OK" && preds) setPredictions(preds);
          else setPredictions([]);
        },
      );
    }, 500);
  };

  // Handle location selection
  const handleSelect = (prediction: any) => {
    setQuery(prediction.description);
    detailsServiceRef.current.getDetails(
      { placeId: prediction.place_id },
      (place: any, status: string) => {
        if (status !== "OK") return;

        let city = "";
        let state = "";
        let state_code = "";
        let country = "";
        let lat = null;
        let lng = null;

        place.address_components.forEach((comp: any) => {
          if (comp.types.includes("locality")) city = comp.long_name;
          if (comp.types.includes("administrative_area_level_1")) {
            state = comp.long_name;
            state_code = comp.short_name;
          }
          if (comp.types.includes("country")) {
            country = comp.long_name;
          }
        });

        if (place.geometry?.location) {
          lat = place.geometry.location.lat();
          lng = place.geometry.location.lng();
        }

        // Save to localStorage with the same structure as useUserLocation
        const locationData = {
          city: city || null,
          state: state || null,
          state_code: state_code || null,
          country: country || null,
          lat: lat,
          lng: lng,
          timezone: null,
          source: "manual" as const,
        };

        window.localStorage.setItem(
          "userLocation",
          JSON.stringify(locationData),
        );

        // Update display
        const displayText =
          city && state_code
            ? `${city}, ${state_code}`
            : city || state || "Set Location";
        setCurrentLocation(displayText);

        // Emit location change event
        window.dispatchEvent(
          new CustomEvent("locationChanged", { detail: locationData }),
        );

        // Close search
        setIsSearchOpen(false);
        setQuery("");
        setPredictions([]);
      },
    );
  };

  // Handle click outside to close dropdown
  useEffect(() => {
    if (typeof document === "undefined") {
      return;
    }

    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsSearchOpen(false);
        setQuery("");
        setPredictions([]);
      }
    };

    if (isSearchOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isSearchOpen]);

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Location Display / Trigger */}
      <button
        onClick={() => setIsSearchOpen(!isSearchOpen)}
        className={`flex items-center gap-2 text-sm ${
          light ? "text-white" : "text-gray-700"
        } hover:text-red-500 transition-colors`}
      >
        <MapPin className="h-5 w-5 text-red-500 flex-shrink-0" />
        <span className="font-medium truncate max-w-[200px]">
          {currentLocation}
        </span>
      </button>

      {/* Search Dropdown */}
      {isSearchOpen && (
        <div className="absolute top-full left-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50 p-3">
          <div className="mb-2">
            <p className="text-xs text-gray-500 mb-2">
              Search for a city or state
            </p>
            <input
              type="text"
              value={query}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Enter city name..."
              className="w-full border border-gray-300 text-gray-900 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
              autoFocus
            />
          </div>

          {maps.status === "error" && (
            <p className="text-xs text-red-600 py-2 flex items-start gap-1.5">
              <AlertCircle className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
              <span>{maps.error}</span>
            </p>
          )}

          {maps.status === "loading" && (
            <p className="text-xs text-gray-500 py-2">
              Loading Google Maps...
            </p>
          )}

          {isMapsReady && loading && (
            <p className="text-xs text-gray-500 py-2">Searching...</p>
          )}

          {isMapsReady && predictions.length > 0 && (
            <ul className="max-h-60 overflow-y-auto border-t border-gray-100 mt-2">
              {predictions.map((pred) => (
                <li
                  key={pred.place_id}
                  onClick={() => handleSelect(pred)}
                  className="px-3 py-2 cursor-pointer hover:bg-red-50 rounded text-sm flex justify-between items-center"
                >
                  <span className="text-gray-700">{pred.description}</span>
                  <span className="text-xs text-gray-400">
                    {" "}
                    {pred.types.includes("locality") ? "(City)" : "(State)"}
                  </span>
                </li>
              ))}
            </ul>
          )}

          {isMapsReady &&
            !loading &&
            query &&
            predictions.length === 0 && (
              <p className="text-xs text-gray-400 py-2 text-center">
                No cities found
              </p>
            )}
        </div>
      )}
    </div>
  );
};

export default HeaderLocationSearch;

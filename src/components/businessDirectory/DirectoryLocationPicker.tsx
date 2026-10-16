"use client";

// "Search near" picker for the directory radius filter: the browser's current
// location, the site-wide location saved from the header, or any US
// address / city / ZIP via Google Places.

import { useEffect, useRef, useState } from "react";
import { ChevronDown, Loader2, LocateFixed, MapPin, Search, X } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useGoogleMapsScript } from "@/hooks/useGoogleMapsScript";
import { readSavedUserLocation, type SearchCenter } from "./geo";

interface DirectoryLocationPickerProps {
  center: SearchCenter | null;
  onChange: (center: SearchCenter | null) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const GEOLOCATION_ERRORS: Record<number, string> = {
  1: "Location access is blocked. Allow it in your browser settings, or search for a place instead.",
  2: "We couldn't detect your location. Try searching for a place instead.",
  3: "Finding your location took too long. Please try again.",
};

const isSameSpot = (a: SearchCenter, b: SearchCenter) =>
  Math.abs(a.lat - b.lat) < 1e-6 && Math.abs(a.lng - b.lng) < 1e-6;

const DirectoryLocationPicker = ({
  center,
  onChange,
  open,
  onOpenChange,
}: DirectoryLocationPickerProps) => {
  const maps = useGoogleMapsScript();
  const mapsReady = maps.status === "ready";
  const [query, setQuery] = useState("");
  const [predictions, setPredictions] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [locating, setLocating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState<SearchCenter | null>(null);

  const autocompleteRef = useRef<any>(null);
  const placesRef = useRef<any>(null);
  // Groups keystrokes + the final details lookup into one billed session.
  const sessionTokenRef = useRef<any>(null);
  const debounceRef = useRef<number | null>(null);
  const requestIdRef = useRef(0);

  useEffect(() => {
    if (!mapsReady) return;
    const places = window.google.maps.places;
    autocompleteRef.current = new places.AutocompleteService();
    placesRef.current = new places.PlacesService(document.createElement("div"));
  }, [mapsReady]);

  // Fresh state each time the picker opens.
  useEffect(() => {
    if (!open) return;
    setQuery("");
    setPredictions([]);
    setSearching(false);
    setError(null);
    setSaved(readSavedUserLocation());
  }, [open]);

  useEffect(
    () => () => {
      if (debounceRef.current) window.clearTimeout(debounceRef.current);
    },
    [],
  );

  const choose = (next: SearchCenter) => {
    onChange(next);
    onOpenChange(false);
  };

  const handleQueryChange = (value: string) => {
    setQuery(value);
    setError(null);
    if (debounceRef.current) window.clearTimeout(debounceRef.current);
    requestIdRef.current += 1; // invalidate in-flight responses

    if (!value.trim() || !autocompleteRef.current) {
      setPredictions([]);
      setSearching(false);
      return;
    }

    setSearching(true);
    debounceRef.current = window.setTimeout(() => {
      const requestId = ++requestIdRef.current;
      if (!sessionTokenRef.current) {
        sessionTokenRef.current =
          new window.google.maps.places.AutocompleteSessionToken();
      }
      autocompleteRef.current.getPlacePredictions(
        {
          input: value,
          types: ["geocode"],
          componentRestrictions: { country: "us" },
          sessionToken: sessionTokenRef.current,
        },
        (preds: any[] | null, status: string) => {
          if (requestId !== requestIdRef.current) return;
          setSearching(false);
          setPredictions(status === "OK" && preds ? preds.slice(0, 5) : []);
        },
      );
    }, 300);
  };

  const handlePredictionSelect = (prediction: any) => {
    if (!placesRef.current) return;
    setSearching(true);
    placesRef.current.getDetails(
      {
        placeId: prediction.place_id,
        fields: ["geometry"],
        sessionToken: sessionTokenRef.current,
      },
      (place: any, status: string) => {
        sessionTokenRef.current = null; // a details call ends the session
        setSearching(false);
        const location = place?.geometry?.location;
        if (status !== "OK" || !location) {
          setError("We couldn't find that place. Please try another search.");
          return;
        }
        choose({
          lat: location.lat(),
          lng: location.lng(),
          label: String(prediction.description || "Selected place").replace(/, USA$/, ""),
        });
      },
    );
  };

  const handleUseCurrentLocation = () => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setError("Your browser doesn't support location detection.");
      return;
    }
    setLocating(true);
    setError(null);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocating(false);
        choose({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          label: "Your location",
        });
      },
      (geoError) => {
        setLocating(false);
        setError(GEOLOCATION_ERRORS[geoError.code] || GEOLOCATION_ERRORS[2]);
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 5 * 60 * 1000 },
    );
  };

  const showSaved = saved && !(center && isSameSpot(saved, center));

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={`inline-flex h-10 min-w-0 max-w-full items-center gap-2 rounded-xl border bg-card px-3 text-sm transition-colors hover:border-primary/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/30 ${
            center ? "border-primary/40 text-muted-foreground" : "border-border text-muted-foreground"
          }`}
        >
          <MapPin className="h-4 w-4 shrink-0 text-primary-light" />
          <span className="min-w-0 truncate">
            {center ? (
              <>
                Near{" "}
                <span className="font-semibold text-foreground">{center.label}</span>
              </>
            ) : (
              "Set your location"
            )}
          </span>
          <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground/80" />
        </button>
      </PopoverTrigger>

      <PopoverContent
        align="start"
        className="w-[min(22rem,calc(100vw-2rem))] rounded-xl bg-card p-3"
      >
        <p className="px-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground/80">
          Search near
        </p>

        <button
          type="button"
          onClick={handleUseCurrentLocation}
          disabled={locating}
          className="mt-2 flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-sm font-medium text-foreground/85 transition-colors hover:bg-primary/10 hover:text-primary-light disabled:cursor-wait disabled:opacity-70"
        >
          {locating ? (
            <Loader2 className="h-4 w-4 shrink-0 animate-spin text-primary-light" />
          ) : (
            <LocateFixed className="h-4 w-4 shrink-0 text-primary-light" />
          )}
          {locating ? "Finding your location..." : "Use my current location"}
        </button>

        {showSaved && (
          <button
            type="button"
            onClick={() => choose(saved)}
            className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-sm text-foreground/85 transition-colors hover:bg-primary/10 hover:text-primary-light"
          >
            <MapPin className="h-4 w-4 shrink-0 text-muted-foreground/80" />
            <span className="min-w-0 truncate">
              Saved location: <span className="font-semibold">{saved.label}</span>
            </span>
          </button>
        )}

        <div className="relative mt-2">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/80" />
          <input
            type="text"
            value={query}
            onChange={(e) => handleQueryChange(e.target.value)}
            disabled={!mapsReady}
            placeholder={mapsReady ? "Address, city or ZIP code" : "Loading search..."}
            aria-label="Search for a place"
            className="h-10 w-full rounded-lg border border-border bg-card pl-9 pr-9 text-sm text-foreground placeholder:text-muted-foreground/80 focus:border-primary/70 focus:outline-none focus:ring-2 focus:ring-ring/30 disabled:bg-secondary/40"
          />
          {searching && (
            <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground/80" />
          )}
        </div>

        {maps.status === "error" && (
          <p className="mt-2 px-2 text-xs text-muted-foreground">
            Place search is unavailable right now. You can still use your current
            location.
          </p>
        )}

        {predictions.length > 0 && (
          <ul className="mt-1 max-h-64 overflow-y-auto">
            {predictions.map((prediction) => (
              <li key={prediction.place_id}>
                <button
                  type="button"
                  onClick={() => handlePredictionSelect(prediction)}
                  className="flex w-full items-start gap-2 rounded-lg px-2 py-2 text-left transition-colors hover:bg-accent/60"
                >
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground/80" />
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium text-foreground">
                      {prediction.structured_formatting?.main_text || prediction.description}
                    </span>
                    {prediction.structured_formatting?.secondary_text && (
                      <span className="block truncate text-xs text-muted-foreground">
                        {prediction.structured_formatting.secondary_text}
                      </span>
                    )}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}

        {mapsReady && !searching && query.trim() && predictions.length === 0 && (
          <p className="mt-2 px-2 text-xs text-muted-foreground/80">No places found</p>
        )}

        {error && (
          <p className="mt-2 rounded-lg bg-primary/10 px-2 py-1.5 text-xs text-primary-light">
            {error}
          </p>
        )}

        {center && (
          <button
            type="button"
            onClick={() => {
              onChange(null);
              onOpenChange(false);
            }}
            className="mt-2 flex w-full items-center gap-2 rounded-lg border-t border-border px-2 pb-1 pt-3 text-left text-sm text-muted-foreground transition-colors hover:text-primary-light"
          >
            <X className="h-4 w-4 shrink-0" />
            Clear location
          </button>
        )}
      </PopoverContent>
    </Popover>
  );
};

export default DirectoryLocationPicker;

"use client";
import { useCallback, useState } from "react";
import { MapPin, X } from "lucide-react";
import PlaceSearch from "@/components/shared/PlaceSearch";
import HelpTooltipTrigger from "@/components/shared/HelpTooltipTrigger";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip";

interface LocationItem {
  id?: string | number;
  placeId?: string | number;
  name: string;
  type: "city" | "state";
  state_name?: string;
  state_code?: string;
  country_code?: string;
  country_name?: string;
  lat?: number;
  lng?: number;
  formattedAddress?: string;
}

interface PlaceSearchResult {
  placeId?: string;
  name?: string;
  city?: string;
  state?: string;
  state_code?: string;
  country_code?: string;
  country?: string;
  lat?: number;
  lng?: number;
  formattedAddress?: string;
}

interface LocationTargeterProps {
  maxCities?: number;
  maxStates?: number;
  hasActiveSubscription?: boolean;
  selectedCities: LocationItem[];
  selectedStates: LocationItem[];
  onAddCity: (location: LocationItem) => void;
  onRemoveCity: (id: string) => void;
  onAddState: (location: LocationItem) => void;
  onRemoveState: (id: string) => void;
}

export const LocationTargeter = ({
  maxCities = 2,
  maxStates,
  hasActiveSubscription = true,
  selectedCities,
  selectedStates,
  onAddCity,
  onRemoveCity,
  onAddState,
  onRemoveState,
}: LocationTargeterProps) => {
  const [isLocationTooltipOpen, setIsLocationTooltipOpen] = useState(false);
  const cityLimit = Math.max(0, Number(maxCities || 0));
  const stateLimit =
    maxStates === undefined || maxStates === null
      ? null
      : Math.max(0, Number(maxStates || 0));
  const isStateLimited = stateLimit !== null && Number.isFinite(stateLimit);

  const handleLocationTooltipClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      setIsLocationTooltipOpen((prev) => !prev);
    },
    [],
  );

  const handleSelectLocation = (
    place: PlaceSearchResult,
    type: "city" | "state",
  ) => {
    const location: LocationItem = {
      placeId: place.placeId,
      id: place.placeId,
      name:
        type === "city" ? place.city || place.name : place.state || place.name,
      state_name: place.state || "",
      state_code: place.state_code || "",
      country_code: place.country_code || "",
      country_name: place.country || "",
      lat: place.lat,
      lng: place.lng,
      formattedAddress: place.formattedAddress,
      type,
    };

    if (type === "city") onAddCity(location);
    else onAddState(location);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-sm font-medium text-muted-foreground bg-secondary px-3 py-1 rounded-full">
          Step 3
        </span>
        <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <MapPin className="h-5 w-5 text-primary" />
          Target Locations
          <TooltipProvider delayDuration={0} skipDelayDuration={0}>
            <Tooltip
              open={isLocationTooltipOpen}
              onOpenChange={(nextOpen) => {
                if (!nextOpen) setIsLocationTooltipOpen(false);
              }}
            >
              <HelpTooltipTrigger
                ariaLabel="Target locations help"
                onClick={handleLocationTooltipClick}
                className="ml-1"
                iconSize={28}
              />
              <TooltipContent
                sideOffset={10}
                className="w-[calc(100vw-2rem)] max-w-sm text-left text-xs sm:text-base font-normal leading-relaxed bg-black/90 text-white border-white/20 backdrop-blur-[1px] animate-none data-[state=closed]:animate-none"
                onEscapeKeyDown={() => setIsLocationTooltipOpen(false)}
              >
                Pick the city you want to target users in. All plans have the
                option to edit city changes (once per day). Great for targeting
                your surrounding cities!
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </h3>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card rounded-2xl p-6 border border-border space-y-4">
          <div className="mb-4">
            <h4 className="font-semibold text-foreground">Search Locations</h4>
            <p className="text-xs text-muted-foreground mt-1">
              Max {cityLimit} {cityLimit === 1 ? "city" : "cities"} and{" "}
              {isStateLimited ? `${stateLimit} state` : "multiple states"}
            </p>
          </div>

          {!hasActiveSubscription && (
            <div className="rounded-lg border border-yellow-300 bg-yellow-50 px-3 py-2 text-xs text-yellow-900">
              You do not have an active subscription. Please subscribe before
              creating or activating promotions.
            </div>
          )}

          <div className="space-y-3">
            {cityLimit > 0 ? (
              Array.from({ length: cityLimit }, (_, index) => (
                <div key={`city-input-${index + 1}`}>
                  <label>{`City ${index + 1}`}</label>
                  <PlaceSearch
                    searchType="city"
                    disabled={selectedCities.length >= cityLimit}
                    onSelectPlace={(place) =>
                      handleSelectLocation(place, "city")
                    }
                  />
                </div>
              ))
            ) : (
              <p className="text-xs text-muted-foreground">
                No city targeting is included in your subscription plan.
              </p>
            )}

            <div>
              <label>
                State{isStateLimited && stateLimit === 1 ? " (max 1)" : ""}
              </label>
              <PlaceSearch
                searchType="state"
                disabled={
                  isStateLimited
                    ? selectedStates.length >= Number(stateLimit)
                    : false
                }
                onSelectPlace={(place) => handleSelectLocation(place, "state")}
              />
              {isStateLimited && selectedStates.length >= Number(stateLimit) ? (
                <p className="mt-1 text-xs text-muted-foreground">
                  State limit reached.
                </p>
              ) : null}
            </div>
          </div>
        </div>

        <div className="bg-card rounded-2xl p-6 border border-border space-y-4">
          <h4 className="font-semibold text-foreground">Selected Locations</h4>

          {selectedCities.length === 0 && selectedStates.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <MapPin className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No locations selected</p>
              <p className="text-sm">Search and select cities or states</p>
            </div>
          ) : (
            <div className="space-y-2">
              {selectedCities.map((city) => (
                <div
                  key={city.id}
                  className="flex items-center justify-between px-4 py-2 bg-blue-100 rounded-lg"
                >
                  <div>
                    <span className="text-foreground font-medium">
                      {city.name}
                    </span>
                    <span className="text-xs text-muted-foreground ml-2">
                      {city.state_name} | City
                    </span>
                  </div>
                  <button
                    onClick={() => onRemoveCity(String(city.id || ""))}
                    className="text-xs text-muted-foreground hover:text-destructive"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}

              {selectedStates.map((state) => (
                <div
                  key={state.id}
                  className="flex items-center justify-between px-4 py-2 bg-green-100 rounded-lg"
                >
                  <div>
                    <span className="text-foreground font-medium">
                      {state.name}
                    </span>
                    <span className="text-xs text-muted-foreground ml-2">
                      State
                    </span>
                  </div>
                  <button
                    onClick={() => onRemoveState(String(state.id || ""))}
                    className="text-xs text-muted-foreground hover:text-destructive"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

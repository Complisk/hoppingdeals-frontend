"use client";
import { Badge } from "@/components/ui/badge";
import { X, Globe, MapPin } from "lucide-react";
import PlaceSearch from "@/components/shared/PlaceSearch";
import { useToast } from "@/hooks/use-toast";

interface LocationItem {
  id?: string | number;
  placeId?: string | number;
  name: string;
  code?: string;
  state_code?: string;
  state_name?: string;
  country_code?: string;
  country_name?: string;
  lat?: number;
  lng?: number;
  type?: "city" | "state";
}

interface PromotionLocationEditorProps {
  states: LocationItem[];
  cities: LocationItem[];
  lockedStates?: LocationItem[];
  enforceExistingStatesOnly?: boolean;
  subscription: {
    freeStates?: number;
    freeCities?: number;
  } | null;
  onStatesChange: (states: LocationItem[]) => void;
  onCitiesChange: (cities: LocationItem[]) => void;
  hasExistingLocations?: number;
}

const normalizeLocationId = (location: any): string =>
  String(location?.placeId || location?.id || "").trim();

const PromotionLocationEditor = ({
  states,
  cities,
  lockedStates = [],
  enforceExistingStatesOnly = false,
  subscription,
  onStatesChange,
  onCitiesChange,
  hasExistingLocations = 0,
}: PromotionLocationEditorProps) => {
  const { toast } = useToast();

  const existingStateCount = Number(hasExistingLocations || 0);
  const freeStates = Number(subscription?.freeStates || 0);
  const freeCities = Number(subscription?.freeCities || 0);

  // Do not force users to remove pre-existing locations when editing older promotions.
  const maxStates = Math.max(freeStates, existingStateCount);
  const maxCities = freeCities;
  const lockedStateLimit = Math.max(
    0,
    Number((lockedStates || []).length || hasExistingLocations || 0),
  );
  const stateSelectionDisabled =
    enforceExistingStatesOnly && lockedStateLimit === 0;

  const handleStateSelected = (place: any) => {
    const stateCode = String(place?.state_code || "").trim().toUpperCase();
    const stateName = String(place?.state || place?.name || "").trim();
    if (!stateCode && !stateName) return;

    if (enforceExistingStatesOnly) {
      if (lockedStateLimit === 0) {
        toast({
          title: "State edit locked",
          description:
            "This promotion has no existing states, so you cannot add states in edit mode.",
          variant: "destructive",
        });
        return;
      }
    }

    const alreadySelected = states.some((state) => {
      const existingCode = String(state?.state_code || state?.code || "")
        .trim()
        .toUpperCase();
      const existingName = String(state?.state_name || state?.name || "")
        .trim()
        .toLowerCase();
      return (
        (stateCode && existingCode && stateCode === existingCode) ||
        (stateName && existingName && stateName.toLowerCase() === existingName)
      );
    });

    if (alreadySelected) return;

    if (enforceExistingStatesOnly) {
      if (lockedStateLimit > 0 && states.length + 1 > lockedStateLimit) {
        toast({
          title: "State limit reached",
          description: `You can keep up to ${lockedStateLimit} states on this promotion.`,
          variant: "destructive",
        });
        return;
      }
    } else if (maxStates > 0 && states.length + 1 > maxStates) {
      toast({
        title: "State limit reached",
        description: `You can add up to ${maxStates} states on this promotion.`,
        variant: "destructive",
      });
      return;
    }

    const location: LocationItem = {
      id: normalizeLocationId(place),
      placeId: normalizeLocationId(place),
      name: stateName || stateCode,
      code: stateCode,
      state_name: stateName || null,
      state_code: stateCode || "",
      country_code: place?.country_code || "",
      country_name: place?.country || "",
      lat: place?.lat,
      lng: place?.lng,
      type: "state",
    };

    onStatesChange([...states, location]);
  };

  const handleCitySelected = (place: any) => {
    const cityName = String(place?.city || place?.name || "").trim();
    const stateCode = String(place?.state_code || "").trim().toUpperCase();
    if (!cityName) return;

    const alreadySelected = cities.some((city) => {
      const existingCity = String(city?.name || "").trim().toLowerCase();
      const existingStateCode = String(city?.state_code || "")
        .trim()
        .toUpperCase();
      return existingCity === cityName.toLowerCase() && existingStateCode === stateCode;
    });

    if (alreadySelected) return;

    if (maxCities > 0 && cities.length + 1 > maxCities) {
      toast({
        title: "City limit reached",
        description: `You can add up to ${maxCities} cities on this promotion.`,
        variant: "destructive",
      });
      return;
    }

    const location: LocationItem = {
      id: normalizeLocationId(place),
      placeId: normalizeLocationId(place),
      name: cityName,
      state_name: place?.state || "",
      state_code: stateCode || "",
      country_code: place?.country_code || "",
      country_name: place?.country || "",
      lat: place?.lat,
      lng: place?.lng,
      type: "city",
    };

    onCitiesChange([...cities, location]);
  };

  const handleRemoveState = (index: number) =>
    onStatesChange(states.filter((_, i) => i !== index));
  const handleRemoveCity = (index: number) =>
    onCitiesChange(cities.filter((_, i) => i !== index));

  return (
    <div className="w-full space-y-6">
      <div className="border rounded-lg p-4 space-y-4">
        <h3 className="font-semibold flex items-center gap-2">
          <Globe className="h-4 w-4" /> States
        </h3>
        <PlaceSearch
          searchType="state"
          onSelectPlace={handleStateSelected}
          disabled={stateSelectionDisabled}
        />
        {enforceExistingStatesOnly && (
          <p className="text-xs text-muted-foreground">
            {lockedStateLimit > 0
              ? `You can keep up to ${lockedStateLimit} state${lockedStateLimit > 1 ? "s" : ""}. Remove one to add another.`
              : "No states exist on this promotion, so state additions are disabled."}
          </p>
        )}
        {states.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">
              Selected States ({states.length})
            </p>
            <div className="flex flex-wrap gap-2">
              {states.map((state, index) => (
                <Badge
                  key={`${state.state_code || state.name}-${index}`}
                  variant="secondary"
                  className="flex items-center gap-2 px-3 py-1"
                >
                  {state.state_name || state.name}
                  {state.state_code ? (
                    <span className="text-xs opacity-70">({state.state_code})</span>
                  ) : null}
                  <X
                    className="h-3 w-3 cursor-pointer hover:text-red-600"
                    onClick={() => handleRemoveState(index)}
                  />
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="border rounded-lg p-4 space-y-4">
        <h3 className="font-semibold flex items-center gap-2">
          <MapPin className="h-4 w-4" /> Cities
        </h3>
        <PlaceSearch searchType="city" onSelectPlace={handleCitySelected} />
        {cities.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">
              Selected Cities ({cities.length})
            </p>
            <div className="flex flex-wrap gap-2">
              {cities.map((city, index) => (
                <Badge
                  key={`${city.name}-${city.state_code || ""}-${index}`}
                  variant="secondary"
                  className="flex items-center gap-2 px-3 py-1"
                >
                  {city.name}
                  {city.state_code ? (
                    <span className="text-xs opacity-70">({city.state_code})</span>
                  ) : null}
                  <X
                    className="h-3 w-3 cursor-pointer hover:text-red-600"
                    onClick={() => handleRemoveCity(index)}
                  />
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PromotionLocationEditor;

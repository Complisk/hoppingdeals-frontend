"use client";
import React, { useState, useEffect, useRef } from "react";
import { useGoogleMapsScript } from "@/hooks/useGoogleMapsScript";

interface BusinessSearchProps {
  disabled?: boolean;
  onSelectBusiness: (place: {
    placeId: string;
    name: string;
    description: string;
    formattedAddress?: string;
    lat?: number;
    lng?: number;
    rating?: number;
    userRatingsTotal?: number;
    iconMaskBaseUri?: string;
    iconBackgroundColor?: string;
    primaryPhotoUrl?: string;
    reviews?: any[];
    website?: string;
    url?: string;
    formattedPhoneNumber?: string;
    internationalPhoneNumber?: string;
    types?: string[];
  }) => void;
}

const BusinessSearchInput: React.FC<BusinessSearchProps> = ({
  onSelectBusiness,
  disabled = false,
}) => {
  const [query, setQuery] = useState("");
  const [predictions, setPredictions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const autoServiceRef = useRef<any>(null);
  const detailsServiceRef = useRef<any>(null);
  const debounceRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Load Google Maps (Places) once — search only works after it's ready.
  const maps = useGoogleMapsScript();
  const isMapsReady = maps.status === "ready";

  useEffect(() => {
    if (!isMapsReady) return;

    autoServiceRef.current =
      new window.google.maps.places.AutocompleteService();

    detailsServiceRef.current = new window.google.maps.places.PlacesService(
      document.createElement("div"),
    );
  }, [isMapsReady]);

  const fetchPlaceDetails = async (placeId: string) => {
    const run = (request: any) =>
      new Promise<any>((resolve) => {
        if (!detailsServiceRef.current) return resolve(null);
        detailsServiceRef.current.getDetails(
          request,
          (place: any, status: string) => {
            if (status !== "OK") return resolve(null);
            resolve(place);
            console.log("Fetched place details:", place);
          },
        );
      });

    // Prefer explicit fields (more reliable + cheaper), but fallback if needed.
    const withFields = await run({
      placeId,
      fields: [
        "place_id",
        "name",
        "formatted_address",
        "vicinity",
        "geometry",
        "rating",
        "user_ratings_total",
        "icon_mask_base_uri",
        "icon_background_color",
        "reviews",
        "website",
        "url",
        "formatted_phone_number",
        "international_phone_number",
        "business_status",
        "opening_hours",
        "photos",
        "types",
      ],
    });
    if (withFields) return withFields;

    return await run({ placeId });
  };

  const getPredictionLabel = (pred: any) => {
    const main = pred?.structured_formatting?.main_text || "";
    const secondary = pred?.structured_formatting?.secondary_text || "";

    if (main && secondary) return `${main} (${secondary})`;
    if (pred?.description) return String(pred.description);
    if (main) return String(main);
    return "";
  };

  const handleSearchChange = (value: string) => {
    if (disabled) return;
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
        types: ["establishment"], // 🔥 Business search
        componentRestrictions: { country: "us" },
      };

      autoServiceRef.current.getPlacePredictions(
        options,
        (preds: any, status: string) => {
          setLoading(false);
          console.log(preds, status);
          if (status === "OK" && preds) setPredictions(preds);
          else setPredictions([]);
        },
      );
    }, 400);
  };

  const handleSelect = async (prediction: any) => {
    setQuery(getPredictionLabel(prediction));
    setPredictions([]);

    const placeId = prediction.place_id || prediction.placeId;
    if (!placeId) return;

    const place = await fetchPlaceDetails(placeId);
    const geometry = place?.geometry?.location;
    const lat = geometry?.lat ? geometry.lat() : undefined;
    const lng = geometry?.lng ? geometry.lng() : undefined;
    const primaryPhotoUrl =
      place?.photos?.[0]?.getUrl?.({ maxWidth: 256, maxHeight: 256 }) ||
      undefined;

    onSelectBusiness({
      placeId: place?.place_id || placeId,
      name: place?.name || prediction?.structured_formatting?.main_text || "",
      description: prediction.description || getPredictionLabel(prediction),
      formattedAddress: place?.formatted_address || place?.vicinity,
      lat,
      lng,
      rating: place?.rating,
      userRatingsTotal: place?.user_ratings_total,
      iconMaskBaseUri: place?.icon_mask_base_uri,
      iconBackgroundColor: place?.icon_background_color,
      primaryPhotoUrl,
      reviews: place?.reviews,
      website: place?.website,
      url: place?.url,
      formattedPhoneNumber: place?.formatted_phone_number,
      internationalPhoneNumber: place?.international_phone_number,
      types: place?.types,
    });
  };

  const handleBlur = (e: React.FocusEvent<HTMLDivElement>) => {
    if (!containerRef.current?.contains(e.relatedTarget as Node)) {
      setPredictions([]);
    }
  };

  return (
    <div
      ref={containerRef}
      tabIndex={-1}
      onBlur={handleBlur}
      className="space-y-1 relative"
    >
      <input
        type="text"
        value={query}
        disabled={disabled}
        onChange={(e) => handleSearchChange(e.target.value)}
        placeholder="Search business..."
        className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-gray-100 disabled:text-gray-500"
      />

      {maps.status === "error" && (
        <p className="text-xs text-red-600">{maps.error}</p>
      )}

      {maps.status === "loading" && (
        <p className="text-xs text-gray-500">Loading Google Maps...</p>
      )}

      {isMapsReady && loading && (
        <p className="text-xs text-gray-500">Searching...</p>
      )}

      {!disabled && isMapsReady && predictions.length > 0 && (
        <ul className="absolute z-50 w-full border border-gray-300 rounded-lg max-h-52 overflow-y-auto bg-white shadow-md">
          {predictions.map((pred) => (
            <li
              key={pred.place_id}
              tabIndex={0}
              onClick={() => handleSelect(pred)}
              className="px-3 py-2 cursor-pointer hover:bg-gray-100"
            >
              {getPredictionLabel(pred)}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default React.memo(BusinessSearchInput);

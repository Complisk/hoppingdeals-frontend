"use client";
import React, { useState, useEffect, useRef } from "react";
import { useGoogleMapsScript } from "@/hooks/useGoogleMapsScript";

interface PlaceSearchProps {
  searchType: "city" | "state";
  disabled?: boolean;
  onSelectPlace: (place: {
    placeId: string;
    description: string;
    city?: string;
    state?: string;
    state_code?: string;
    country?: string;
    country_code?: string;
    formattedAddress?: string;
    lat?: number;
    lng?: number;
  }) => void;
}

const PlaceSearch: React.FC<PlaceSearchProps> = ({
  searchType,
  disabled = false,
  onSelectPlace,
}) => {
  const [query, setQuery] = useState("");
  const [predictions, setPredictions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const autoServiceRef = useRef<any>(null);
  const detailsServiceRef = useRef<any>(null);
  const debounceRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (disabled) {
      setPredictions([]);
    }
  }, [disabled]);

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
        componentRestrictions: { country: "us" },
      };

      if (searchType === "city") options.types = ["(cities)"];
      if (searchType === "state") options.types = ["(regions)"];

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

  const handleSelect = (prediction: any) => {
    if (disabled) return;

    setQuery(prediction.description);
    setPredictions([]);
    detailsServiceRef.current.getDetails(
      { placeId: prediction.place_id },
      (place: any, status: string) => {
        if (status !== "OK") return;
        console.log(place, "check selected place details");
        let city = "";
        let state = "";
        let state_code = "";
        let country = "";
        let country_code = "";

        place.address_components.forEach((comp: any) => {
          if (comp.types.includes("locality")) city = comp.long_name;
          if (comp.types.includes("administrative_area_level_1")) {
            state = comp.long_name;
            state_code = comp.short_name;
          }
          if (comp.types.includes("country")) {
            country = comp.long_name;
            country_code = comp.short_name;
          }
        });

        onSelectPlace({
          placeId: place.place_id,
          description: prediction.description,
          city,
          state,
          state_code,
          country,
          country_code,
          formattedAddress: place.formatted_address,
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng(),
        });
      },
    );
  };

  /** 🔥 KEY PART: hide dropdown on blur */
  const handleBlur = (e: React.FocusEvent<HTMLDivElement>) => {
    // If focus moves outside this component, close dropdown
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
        onChange={(e) => handleSearchChange(e.target.value)}
        disabled={disabled}
        placeholder={
          searchType === "city" ? "Search city..." : "Search state..."
        }
        className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-primary disabled:cursor-not-allowed disabled:opacity-60"
      />

      {maps.status === "error" && (
        <p className="text-xs text-red-600">{maps.error}</p>
      )}

      {maps.status === "loading" && (
        <p className="text-xs text-gray-500">Loading Google Maps...</p>
      )}

      {isMapsReady && loading && (
        <p className="text-xs text-gray-500">Loading...</p>
      )}

      {isMapsReady && predictions.length > 0 && (
        <ul className="absolute z-50 w-full border border-gray-300 rounded-lg max-h-52 overflow-y-auto bg-white shadow-md">
          {predictions.map((pred) => (
            <li
              key={pred.place_id}
              tabIndex={0}
              onClick={() => handleSelect(pred)}
              className="px-3 py-2 cursor-pointer hover:bg-gray-100 flex justify-between"
            >
              <span>{pred.description}</span>
              <span className="text-xs text-gray-500">
                {pred.types.includes("locality") ? "(City)" : "(State)"}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default React.memo(PlaceSearch);

// import React, { useState, useEffect, useRef } from "react";

// interface PlaceSearchProps {
//   searchType: "city" | "state";
//   onSelectPlace: (place: {
//     placeId: string;
//     description: string;
//     city?: string;
//     state?: string;
//     state_code?: string;
//     country?: string;
//     country_code?: string;
//     formattedAddress?: string;
//     lat?: number;
//     lng?: number;
//   }) => void;
// }

// const PlaceSearch: React.FC<PlaceSearchProps> = ({
//   searchType,
//   onSelectPlace,
// }) => {
//   const [query, setQuery] = useState("");
//   const [predictions, setPredictions] = useState<any[]>([]);
//   const [loading, setLoading] = useState(false);

//   const autoServiceRef = useRef<any>(null);
//   const detailsServiceRef = useRef<any>(null);
//   const debounceRef = useRef<any>(null);

//   useEffect(() => {
//     if (!window.google) return;

//     autoServiceRef.current =
//       new window.google.maps.places.AutocompleteService();
//     detailsServiceRef.current = new window.google.maps.places.PlacesService(
//       document.createElement("div"),
//     );
//   }, []);

//   const handleSearchChange = (value: string) => {
//     setQuery(value);

//     if (!value || !autoServiceRef.current) {
//       setPredictions([]);
//       return;
//     }

//     clearTimeout(debounceRef.current);

//     debounceRef.current = setTimeout(() => {
//       setLoading(true);

//       const options: any = {
//         input: value,
//         componentRestrictions: { country: "us" },
//       };

//       if (searchType === "city") options.types = ["(cities)"];
//       else if (searchType === "state") options.types = ["(regions)"];

//       autoServiceRef.current.getPlacePredictions(
//         options,
//         (preds: any, status: string) => {
//           setLoading(false);
//           if (status === "OK" && preds) setPredictions(preds);
//           else setPredictions([]);
//         },
//       );
//     }, 500);
//   };

//   const handleSelect = (prediction: any) => {
//     setQuery(prediction.description);
//     detailsServiceRef.current.getDetails(
//       { placeId: prediction.place_id },
//       (place: any, status: string) => {
//         if (status !== "OK") return;
//         console.log(place, "check selected place details");

//         let city = "";
//         let state = "";
//         let state_code = "";
//         let country = "";
//         let country_code = "";

//         place.address_components.forEach((comp: any) => {
//           if (comp.types.includes("locality")) city = comp.long_name;
//           if (comp.types.includes("administrative_area_level_1")) {
//             state = comp.long_name;
//             state_code = comp.short_name; // <-- This gives the state code (e.g., CA)
//           }
//           if (comp.types.includes("country")) {
//             country = comp.long_name;
//             country_code = comp.short_name; // <-- Country code (e.g., US)
//           }
//         });

//         const result = {
//           placeId: place.place_id,
//           description: prediction.description,
//           city,
//           mapLocation: place?.url,
//           state,
//           state_code,
//           country,
//           country_code,
//           formattedAddress: place.formatted_address,
//           lat: place.geometry.location.lat(),
//           lng: place.geometry.location.lng(),
//         };

//         onSelectPlace(result);
//       },
//     );
//   };

//   return (
//     <div className="space-y-1">
//       <input
//         type="text"
//         value={query}
//         onChange={(e) => handleSearchChange(e.target.value)}
//         placeholder={
//           searchType === "city" ? "Search city..." : "Search state..."
//         }
//         className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-primary"
//       />

//       {loading && <p className="text-xs text-gray-500">Loading...</p>}

//       {predictions.length > 0 && (
//         <ul className="border border-gray-300 rounded-lg max-h-52 overflow-y-auto bg-white shadow-md">
//           {predictions.map((pred) => (
//             <li
//               key={pred.place_id}
//               onClick={() => handleSelect(pred)}
//               className="px-3 py-2 cursor-pointer hover:bg-gray-100 flex justify-between"
//             >
//               <span>{pred.description}</span>
//               <span className="text-xs text-gray-500">
//                 {pred.types.includes("locality") ? "(City)" : "(State)"}
//               </span>
//             </li>
//           ))}
//         </ul>
//       )}
//     </div>
//   );
// };

// export default React.memo(PlaceSearch);

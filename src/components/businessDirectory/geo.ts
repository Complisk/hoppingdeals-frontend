// Distance helpers for the directory's "search near" radius filter.
// Distances are in miles (the platform is US-focused).

export interface LatLng {
  lat: number;
  lng: number;
}

export interface SearchCenter extends LatLng {
  label: string;
}

export const RADIUS_OPTIONS_MILES = [5, 10, 25, 50, 100] as const;

const EARTH_RADIUS_MILES = 3958.8;
const METERS_PER_MILE = 1609.344;
const MILES_PER_DEGREE_LAT = 69.0;

const toRadians = (deg: number) => (deg * Math.PI) / 180;

// Great-circle distance (haversine).
export const distanceMiles = (a: LatLng, b: LatLng) => {
  const dLat = toRadians(b.lat - a.lat);
  const dLng = toRadians(b.lng - a.lng);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(a.lat)) * Math.cos(toRadians(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_MILES * Math.asin(Math.min(1, Math.sqrt(h)));
};

export const milesToMeters = (miles: number) => miles * METERS_PER_MILE;

// Bounding box that fully contains a circle — used to frame the radius on the map.
export const radiusBounds = (center: LatLng, miles: number) => {
  const dLat = miles / MILES_PER_DEGREE_LAT;
  const dLng =
    miles / (MILES_PER_DEGREE_LAT * Math.max(0.01, Math.cos(toRadians(center.lat))));
  return {
    south: center.lat - dLat,
    north: center.lat + dLat,
    west: center.lng - dLng,
    east: center.lng + dLng,
  };
};

export const formatDistance = (miles: number) => {
  if (miles < 0.1) return "< 0.1 mi";
  if (miles < 10) return `${miles.toFixed(1)} mi`;
  return `${Math.round(miles)} mi`;
};

const isValidCoordinate = (lat: unknown, lng: unknown) =>
  typeof lat === "number" &&
  typeof lng === "number" &&
  Number.isFinite(lat) &&
  Number.isFinite(lng) &&
  Math.abs(lat) <= 90 &&
  Math.abs(lng) <= 180 &&
  !(lat === 0 && lng === 0);

// Location chosen site-wide via the header's "Set Location" (see
// HeaderLocationSearch / useUserLocation), if it has coordinates.
export const readSavedUserLocation = (): SearchCenter | null => {
  try {
    const stored = window.localStorage.getItem("userLocation");
    if (!stored) return null;
    const loc = JSON.parse(stored);
    if (!isValidCoordinate(loc?.lat, loc?.lng)) return null;
    const label =
      loc.city && loc.state_code
        ? `${loc.city}, ${loc.state_code}`
        : loc.city || loc.state || "Saved location";
    return { lat: loc.lat, lng: loc.lng, label };
  } catch {
    return null;
  }
};

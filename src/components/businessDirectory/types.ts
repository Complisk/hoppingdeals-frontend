export interface DirectoryBusiness {
  id: string;
  name: string;
  logoUrl?: string | null;
  businessType?: string | null;
  businessAddress?: string | null;
  categories?: string[];
  activePromotions?: number;
  // Null when the business has no valid location (backend validates these).
  lat?: number | null;
  lng?: number | null;
  // Client-side: miles from the "search near" location, when one is set.
  distanceMiles?: number | null;
}

export type MappableBusiness = DirectoryBusiness & { lat: number; lng: number };

export const isMappable = (
  business: DirectoryBusiness,
): business is MappableBusiness =>
  typeof business.lat === "number" &&
  typeof business.lng === "number" &&
  Number.isFinite(business.lat) &&
  Number.isFinite(business.lng);

export const getInitial = (name?: string | null) =>
  (name || "B").trim().charAt(0).toUpperCase() || "B";

export const getDirectionsUrl = (business: MappableBusiness) =>
  `https://www.google.com/maps/dir/?api=1&destination=${business.lat},${business.lng}`;

export const formatPromotions = (count = 0) =>
  `${count} active promotion${count === 1 ? "" : "s"}`;

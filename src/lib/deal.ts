import { parseDateOnlyToLocal } from "@/utils/dateOnly";

// Small display helpers shared by every deal (promotion) surface.

const SMALL_WORDS = new Set(["and", "of", "the"]);

/** "beauty-&-spas" → "Beauty & Spas" */
export const formatCategoryLabel = (slug?: string | null) => {
  if (!slug) return "";
  return String(slug)
    .split("-")
    .filter(Boolean)
    .map((word, index) =>
      word === "&" || (index > 0 && SMALL_WORDS.has(word))
        ? word
        : word.charAt(0).toUpperCase() + word.slice(1),
    )
    .join(" ");
};

/** "Valid through May 19" (adds the year when it isn't this year). */
export const formatValidThrough = (stopDate?: string | null) => {
  const date = parseDateOnlyToLocal(stopDate);
  if (!date) return "";
  const sameYear = date.getFullYear() === new Date().getFullYear();
  const label = date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    ...(sameYear ? {} : { year: "numeric" }),
  });
  return `Valid through ${label}`;
};

export const getDealBusinessName = (promotion: any) =>
  promotion?.business?.name || promotion?.metadata?.businessName || "";

export const getDealAddress = (promotion: any) =>
  promotion?.business?.businessAddress ||
  promotion?.metadata?.businessAddress ||
  "";

export const getDealDescription = (promotion: any) =>
  promotion?.metadata?.promotionDescription || "";

export const getDealPrimaryCategory = (promotion: any) => {
  const list = Array.isArray(promotion?.categories)
    ? promotion.categories
    : Array.isArray(promotion?.business?.categories)
      ? promotion.business.categories
      : [];
  return list[0] || promotion?.category || "";
};

/** Categories offered for browsing (header menu, category page chips). */
export const BROWSE_CATEGORIES: { label: string; slug: string }[] = [
  { label: "Restaurants", slug: "restaurants" },
  { label: "Beauty & Spas", slug: "beauty-&-spas" },
  { label: "Home Services", slug: "home-services" },
  { label: "Coffee & Tea", slug: "coffee-&-tea" },
  { label: "Food", slug: "food" },
  { label: "Auto Services", slug: "auto-services" },
  { label: "Pets", slug: "pets" },
  { label: "Shopping", slug: "shopping" },
  { label: "Professional Services", slug: "professional-services" },
  { label: "Health & Medical", slug: "health-&-medical" },
  { label: "Event Planning & Services", slug: "event-planning-&-services" },
  { label: "Hotels & Casinos", slug: "hotels-&-casinos" },
  { label: "Nightlife", slug: "nightlife" },
  { label: "Active Life", slug: "active-life" },
  { label: "Education", slug: "education" },
  { label: "Arts & Entertainment", slug: "arts-&-entertainment" },
  { label: "Travel & Activities", slug: "travel-&-activities" },
];

/** City/state the shopper picked in the header, if any. */
export const readSavedLocationLabel = () => {
  try {
    const stored = window.localStorage.getItem("userLocation");
    const location = stored ? JSON.parse(stored) : null;
    if (!location) return "";
    if (location.city && location.state_code)
      return `${location.city}, ${location.state_code}`;
    return location.city || location.state || "";
  } catch {
    return "";
  }
};

/**
 * Ticket colors per category — the light/dark pairs from the home hero
 * tickets, extended to every browse category. Used for the deal ticket stub.
 */
const TICKET_COLORS: Record<string, { light: string; dark: string }> = {
  restaurants: { light: "#ffa93a", dark: "#cb4400" },
  food: { light: "#ff8a65", dark: "#c2341b" },
  "beauty-&-spas": { light: "#ff97c2", dark: "#d82465" },
  "home-services": { light: "#a3f03b", dark: "#4a8a0b" },
  "coffee-&-tea": { light: "#af52ff", dark: "#5209ac" },
  "auto-services": { light: "#60a5fa", dark: "#1d4ed8" },
  pets: { light: "#fbbf24", dark: "#c26a04" },
  shopping: { light: "#a78bfa", dark: "#6d28d9" },
  "online-shopping": { light: "#a78bfa", dark: "#6d28d9" },
  "general-merchandise-store": { light: "#a78bfa", dark: "#6d28d9" },
  "professional-services": { light: "#7dd3fc", dark: "#0369a1" },
  "health-&-medical": { light: "#5eead4", dark: "#0f766e" },
  "event-planning-&-services": { light: "#f9a8d4", dark: "#a21c5c" },
  "hotels-&-casinos": { light: "#fcd34d", dark: "#a35208" },
  nightlife: { light: "#c084fc", dark: "#6b21a8" },
  "active-life": { light: "#86efac", dark: "#15803d" },
  education: { light: "#93c5fd", dark: "#1e40af" },
  "arts-&-entertainment": { light: "#fb7185", dark: "#9f1239" },
  "travel-&-activities": { light: "#67e8f9", dark: "#0e7490" },
  "local-services": { light: "#7dd3fc", dark: "#0369a1" },
  "real-estate": { light: "#fdba74", dark: "#9a3412" },
  "mass-media": { light: "#a5b4fc", dark: "#3730a3" },
  airline: { light: "#67e8f9", dark: "#0e7490" },
};

const DEFAULT_TICKET = { light: "#f7c948", dark: "#a8650a" };

export const getTicketColors = (slug?: string | null) => {
  if (!slug) return DEFAULT_TICKET;
  const key = String(slug).trim().toLowerCase().replace(/\s+/g, "-");
  return TICKET_COLORS[key] || DEFAULT_TICKET;
};

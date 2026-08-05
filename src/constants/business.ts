import {
  Users,
  Building2,
  Briefcase,
  ShoppingCart,
  LucideIcon,
} from "lucide-react";

/**
 * Business Categories - Used across the application for business registration and filtering
 */
export const BUSINESS_CATEGORIES = [
  "restaurants",
  "beauty-&-spas",
  "home-services",
  "coffee-&-tea",
  "food",
  "auto-services",
  "pets",
  "professional-services",
  "health-&-medical",
  "event-planning-&-services",
  "hotels-&-casinos",
  "nightlife",
  "active-life",
  "education",
  "arts-&-entertainment",
  "travel-&-activities",
  "online-shopping",
  "shopping",
  "local-services",
  "real-estate",
  "mass-media",
  "general-merchandise-store",
  "airline",
];

export type BusinessCategory = (typeof BUSINESS_CATEGORIES)[number];

/**
 * Business Type definitions
 */
export interface BusinessType {
  id: string;
  name: string;
  icon: LucideIcon;
  description: string;
  color: string;
}

export const BUSINESS_TYPES: BusinessType[] = [
  {
    id: "small",
    name: "Small Business",
    icon: Users,
    description: "Local shops, boutiques, solo entrepreneurs",
    color: "from-emerald-500 to-teal-500",
  },
  {
    id: "medium",
    name: "Medium Size Business",
    icon: Building2,
    description: "Growing businesses with multiple locations",
    color: "from-blue-500 to-indigo-500",
  },
  {
    id: "large",
    name: "Large Corporation",
    icon: Briefcase,
    description: "Enterprises with nationwide presence",
    color: "from-purple-500 to-pink-500",
  },
  {
    id: "online-ecommerce",
    name: "Online Ecommerce Store",
    icon: ShoppingCart,
    description: "Online stores, digital marketplaces, dropshipping",
    color: "from-orange-500 to-red-500",
  },
];

/**
 * Get business type by ID
 */
export const getBusinessTypeById = (id: string): BusinessType | undefined => {
  return BUSINESS_TYPES.find((type) => type.id === id);
};

/**
 * Get business type name by ID
 */
export const getBusinessTypeName = (id: string): string => {
  return getBusinessTypeById(id)?.name || id;
};

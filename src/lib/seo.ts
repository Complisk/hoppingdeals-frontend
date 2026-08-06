export const SITE_NAME = "Hopping Deals";
export const SITE_URL = "https://www.hoppingdeals.world";
export const DEFAULT_OG_IMAGE = `${SITE_URL}/logo.png`;
export const DEFAULT_TITLE = "Hopping Deals | Coupons from local businesses near you";
export const DEFAULT_DESCRIPTION =
  "Find local coupons, business promotions, flash deals, and limited-time offers near you. Browse restaurants, beauty, services, shopping, and more on Hopping Deals.";
export const DEFAULT_KEYWORDS = [
  "hopping deals",
  "local coupons",
  "business promotions",
  "flash deals",
  "limited-time offers",
  "local deals",
  "small business marketing",
];

export type StructuredData =
  | Record<string, unknown>
  | Array<Record<string, unknown>>;

export const buildCanonicalUrl = (pathname = "/") => {
  if (!pathname || pathname === "/") {
    return SITE_URL;
  }

  return `${SITE_URL}${pathname.startsWith("/") ? pathname : `/${pathname}`}`;
};

export const toAbsoluteUrl = (value?: string | null) => {
  if (!value) {
    return DEFAULT_OG_IMAGE;
  }

  if (value.startsWith("http://") || value.startsWith("https://")) {
    return value;
  }

  return `${SITE_URL}${value.startsWith("/") ? value : `/${value}`}`;
};

export const withSiteName = (title?: string) => {
  if (!title) {
    return DEFAULT_TITLE;
  }

  if (title.includes(SITE_NAME)) {
    return title;
  }

  return `${title} | ${SITE_NAME}`;
};

export const formatCategoryName = (slug?: string) => {
  if (!slug) {
    return "Category";
  }

  return slug.replace(/-/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
};

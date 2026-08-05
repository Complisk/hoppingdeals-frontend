export const SITE_NAME = "Complisk";
export const SITE_URL = "https://complisk.com";
export const DEFAULT_OG_IMAGE = `${SITE_URL}/image.png`;
export const DEFAULT_TITLE = "Complisk | Local business promotions and deals";
export const DEFAULT_DESCRIPTION =
  "Discover local business promotions, limited-time offers, and targeted marketing campaigns across the United States with Complisk.";
export const DEFAULT_KEYWORDS = [
  "local promotions",
  "business promotions",
  "local deals",
  "marketing promotions",
  "small business marketing",
  "geo targeted promotions",
  "Complisk",
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

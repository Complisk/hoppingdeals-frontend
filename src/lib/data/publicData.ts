/**
 * Server-side data layer for public pages.
 * Uses classic ISR fetch caching (`next: { revalidate }`) so public reads are
 * cached with the configured lifetime and can be invalidated by tag via
 * `revalidateTag` (see @/lib/cache/revalidate).
 */
const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api";

export interface PublicPhoto {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  cloudinaryPublicId?: string | null;
  altText?: string | null;
  isActive: boolean;
  sortOrder: number;
  [key: string]: unknown;
}

export interface PublicPromotion {
  id: string;
  title?: string;
  description?: string;
  category?: string;
  status?: string;
  businessName?: string;
  bannerImage?: string;
  imageUrl?: string;
  metadata?: Record<string, unknown>;
  [key: string]: unknown;
}

const fetchJson = async (url: string, revalidate: number) => {
  const res = await fetch(url, {
    headers: { "x-timezone": "UTC" },
    next: { revalidate, tags: ["promotions"] },
  });
  if (!res.ok) return null;
  return res.json();
};

/** Public photo gallery — cached for an hour. */
export async function getPublicPhotos(): Promise<PublicPhoto[]> {
  try {
    const data = await fetchJson(`${API_BASE}/photos`, 3600);
    const photos = data?.photos || data || [];
    return Array.isArray(photos) ? photos : [];
  } catch {
    return [];
  }
}

/** Single public promotion (used for SEO metadata). */
export async function getPublicPromotion(
  id: string,
): Promise<PublicPromotion | null> {
  try {
    const data = await fetchJson(
      `${API_BASE}/promotions/${encodeURIComponent(id)}`,
      3600,
    );
    return data?.promotion || data || null;
  } catch {
    return null;
  }
}

/** Public promotions list (used for category feeds & SEO). */
export async function getPublicPromotions(filters?: {
  category?: string;
  state?: string;
  city?: string;
}): Promise<PublicPromotion[]> {
  try {
    const params = new URLSearchParams({ country_code: "US" });
    if (filters?.category) params.set("category", filters.category);
    if (filters?.state) params.set("state", filters.state);
    if (filters?.city) params.set("city", filters.city);

    const data = await fetchJson(
      `${API_BASE}/promotions?${params.toString()}`,
      300,
    );
    const promotions = data?.promotions || data || [];
    return Array.isArray(promotions) ? promotions : [];
  } catch {
    return [];
  }
}

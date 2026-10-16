import type { MetadataRoute } from "next";
import { BUSINESS_CATEGORIES } from "@/constants/business";
import { SITE_URL } from "@/lib/seo";
import { getPublicPromotions } from "@/lib/data/publicData";

export const revalidate = 3600;

/**
 * Generated sitemap:
 *  - all static public routes
 *  - every business category route
 *  - live promotion URLs fetched through the ISR data layer
 * Regenerated at most once an hour; promotion tags invalidate it too.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${SITE_URL}/about-us`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/blog`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/terms`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.4,
    },
    {
      url: `${SITE_URL}/install-app`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${SITE_URL}/hopping-deals-business-directory`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.6,
    },
    {
      url: `${SITE_URL}/photos`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.5,
    },
  ];

  const categoryRoutes: MetadataRoute.Sitemap = BUSINESS_CATEGORIES.map(
    (category) => ({
      url: `${SITE_URL}/category/${category}`,
      lastModified: now,
      changeFrequency: "daily" as const,
      priority: 0.8,
    }),
  );

  // Fetches through the ISR data layer (cached; [] if the API is unreachable)
  const promotions = await getPublicPromotions();
  const promotionRoutes: MetadataRoute.Sitemap = promotions
    .filter((promotion) => promotion?.id)
    .map((promotion) => ({
      url: `${SITE_URL}/promotion/${promotion.id}`,
      lastModified:
        typeof promotion.updatedAt === "string"
          ? new Date(promotion.updatedAt)
          : now,
      changeFrequency: "daily" as const,
      priority: 0.9,
    }));

  return [...staticRoutes, ...categoryRoutes, ...promotionRoutes];
}

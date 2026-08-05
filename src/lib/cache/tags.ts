/**
 * Cache tag registry.
 * Every cache tag string lives here — no raw strings anywhere else.
 */
export const CACHE_TAGS = {
  // Collection tags
  promotions: "promotions",
  categories: "categories",
  businesses: "businesses",
  photos: "photos",
  templates: "templates",
  subscriptionTemplates: "subscription-templates",
  supportMessages: "support-messages",
  businessTaggings: "business-taggings",

  // Entity tag factories
  promotion: (id: string | number) => `promotion:${id}`,
  business: (id: string | number) => `business:${id}`,
  user: (id: string | number) => `user:${id}`,
  photo: (id: string | number) => `photo:${id}`,
} as const;

export type CacheTag = (typeof CACHE_TAGS)[keyof typeof CACHE_TAGS];

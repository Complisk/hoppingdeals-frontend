"use client";

export type SeoProps = {
  title?: string;
  description?: string;
  pathname?: string;
  canonicalUrl?: string;
  image?: string;
  imageAlt?: string;
  type?: "website" | "article";
  keywords?: string[];
  robots?: string;
  noindex?: boolean;
  structuredData?: Record<string, unknown> | Array<Record<string, unknown>>;
  publishedTime?: string;
  modifiedTime?: string;
  section?: string;
};

/**
 * No-op placeholder in the Next.js port.
 *
 * SEO is handled natively by the Next.js Metadata API in each route's
 * `page.tsx` (`export const metadata` / `generateMetadata`), which is
 * server-rendered and automatically kept fresh on client-side navigation.
 * Keeping this component lets all ~40 call sites stay untouched.
 */
const Seo = (_props: SeoProps) => null;

export default Seo;

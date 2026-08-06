import type { Metadata } from "next";
import Index from "@/views/Index";
import JsonLd from "@/components/seo/JsonLd";
import {
  SITE_URL,
  DEFAULT_OG_IMAGE,
  DEFAULT_DESCRIPTION,
} from "@/lib/seo";

export const metadata: Metadata = {
  title: "Hopping Deals | Coupons from local businesses near you",
  description: DEFAULT_DESCRIPTION,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Hopping Deals | Local business promotions and deals",
    description: DEFAULT_DESCRIPTION,
    url: SITE_URL,
    siteName: "Hopping Deals",
    images: [{ url: DEFAULT_OG_IMAGE }],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Hopping Deals | Local business promotions and deals",
    description: DEFAULT_DESCRIPTION,
    images: [DEFAULT_OG_IMAGE],
  },
};

export default function HomePage() {
  return (
    <>
      <JsonLd
        data={[
          {
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: "Hopping Deals",
            url: SITE_URL,
          },
          {
            "@context": "https://schema.org",
            "@type": "Organization",
            name: "Hopping Deals",
            url: SITE_URL,
            logo: `${SITE_URL}/logo.png`,
          },
        ]}
      />
      <Index />
    </>
  );
}

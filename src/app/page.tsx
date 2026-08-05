import type { Metadata } from "next";
import Index from "@/views/Index";
import JsonLd from "@/components/seo/JsonLd";
import {
  SITE_URL,
  DEFAULT_OG_IMAGE,
  DEFAULT_DESCRIPTION,
} from "@/lib/seo";

export const metadata: Metadata = {
  title: "Local business promotions and deals across the US",
  description: DEFAULT_DESCRIPTION,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Complisk | Local business promotions and deals",
    description: DEFAULT_DESCRIPTION,
    url: SITE_URL,
    siteName: "Complisk",
    images: [{ url: DEFAULT_OG_IMAGE }],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Complisk | Local business promotions and deals",
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
            name: "Complisk",
            url: SITE_URL,
          },
          {
            "@context": "https://schema.org",
            "@type": "Organization",
            name: "Complisk",
            url: SITE_URL,
            logo: `${SITE_URL}/web-app-manifest-512x512.png`,
          },
        ]}
      />
      <Index />
    </>
  );
}

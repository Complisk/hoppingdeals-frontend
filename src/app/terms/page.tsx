import type { Metadata } from "next";
import Terms from "@/views/Terms";
import JsonLd from "@/components/seo/JsonLd";
import { SITE_URL } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Hopping Deals terms of service and usage policies.",
  alternates: {
    canonical: "/terms",
  },
  openGraph: {
    title: "Terms of Service",
    description: "Hopping Deals terms of service and usage policies.",
    url: `${SITE_URL}/terms`,
    siteName: "Hopping Deals",
    type: "website",
  },
};

export default function TermsPage() {
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: "Terms of Service",
          url: `${SITE_URL}/terms`,
          description: "Hopping Deals terms of service and usage policies.",
        }}
      />
      <Terms />
    </>
  );
}

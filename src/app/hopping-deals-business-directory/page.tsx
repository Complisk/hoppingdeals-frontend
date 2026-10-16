import type { Metadata } from "next";
import CompliskBusinessDirectory from "@/views/CompliskBusinessDirectory";
import JsonLd from "@/components/seo/JsonLd";
import { SITE_URL } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Hopping Deals Business Directory",
  description:
    "Support local with Hopping Deals and discover businesses powering our platform.",
  alternates: {
    canonical: "/hopping-deals-business-directory",
  },
  openGraph: {
    title: "Hopping Deals Business Directory",
    description:
      "Support local with Hopping Deals and discover businesses powering our platform.",
    url: `${SITE_URL}/hopping-deals-business-directory`,
    siteName: "Hopping Deals",
    type: "website",
  },
};

export default function CompliskBusinessDirectoryPage() {
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: "Hopping Deals Business Directory",
          url: `${SITE_URL}/hopping-deals-business-directory`,
        }}
      />
      <CompliskBusinessDirectory />
    </>
  );
}

import type { Metadata } from "next";
import CompliskBusinessDirectory from "@/views/CompliskBusinessDirectory";
import JsonLd from "@/components/seo/JsonLd";
import { SITE_URL } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Complisk Business Directory",
  description:
    "Support local with Complisk and discover businesses powering our platform.",
  alternates: {
    canonical: "/complisk-business-directory",
  },
  openGraph: {
    title: "Complisk Business Directory",
    description:
      "Support local with Complisk and discover businesses powering our platform.",
    url: `${SITE_URL}/complisk-business-directory`,
    siteName: "Complisk",
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
          name: "Complisk Business Directory",
          url: `${SITE_URL}/complisk-business-directory`,
        }}
      />
      <CompliskBusinessDirectory />
    </>
  );
}

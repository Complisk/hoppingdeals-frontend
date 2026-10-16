import type { Metadata } from "next";
import InstallApp from "@/views/InstallApp";
import JsonLd from "@/components/seo/JsonLd";
import { SITE_URL } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Install Hopping Deals App on Your Phone",
  description:
    "Get the Hopping Deals app icon on your phone home screen with easy setup instructions.",
  alternates: {
    canonical: "/install-app",
  },
  openGraph: {
    title: "Install Hopping Deals App on Your Phone",
    description:
      "Get the Hopping Deals app icon on your phone home screen with easy setup instructions.",
    url: `${SITE_URL}/install-app`,
    siteName: "Hopping Deals",
    type: "website",
  },
};

export default function InstallAppPage() {
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: "Install Hopping Deals App",
          url: `${SITE_URL}/install-app`,
        }}
      />
      <InstallApp />
    </>
  );
}

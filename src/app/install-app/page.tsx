import type { Metadata } from "next";
import InstallApp from "@/views/InstallApp";
import JsonLd from "@/components/seo/JsonLd";
import { SITE_URL } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Install Complisk App on Your Phone",
  description:
    "Get the Complisk app icon on your phone home screen with easy setup instructions.",
  alternates: {
    canonical: "/install-app",
  },
  openGraph: {
    title: "Install Complisk App on Your Phone",
    description:
      "Get the Complisk app icon on your phone home screen with easy setup instructions.",
    url: `${SITE_URL}/install-app`,
    siteName: "Complisk",
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
          name: "Install Complisk App",
          url: `${SITE_URL}/install-app`,
        }}
      />
      <InstallApp />
    </>
  );
}

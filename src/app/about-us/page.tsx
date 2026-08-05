import type { Metadata } from "next";
import AboutUs from "@/views/AboutUs";
import JsonLd from "@/components/seo/JsonLd";
import { SITE_URL } from "@/lib/seo";

export const metadata: Metadata = {
  title: "About Us",
  description: "Learn more about Complisk and how we support local businesses.",
  alternates: {
    canonical: "/about-us",
  },
  openGraph: {
    title: "About Complisk",
    description: "Learn more about Complisk and how we support local businesses.",
    url: `${SITE_URL}/about-us`,
    siteName: "Complisk",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "About Complisk",
    description: "Learn more about Complisk and how we support local businesses.",
  },
};

export default function AboutUsPage() {
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "AboutPage",
          name: "About Complisk",
          url: `${SITE_URL}/about-us`,
          description:
            "Complisk connects local businesses with nearby customers through targeted promotions and deals.",
        }}
      />
      <AboutUs />
    </>
  );
}

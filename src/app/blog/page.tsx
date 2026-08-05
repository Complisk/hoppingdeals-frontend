import type { Metadata } from "next";
import BlogDIYMarketing2026 from "@/views/BlogDIYMarketing2026";
import JsonLd from "@/components/seo/JsonLd";
import { SITE_URL } from "@/lib/seo";

const BLOG_URL = `${SITE_URL}/blog`;

export const metadata: Metadata = {
  title: "DIY marketing strategies for small businesses in 2026",
  description:
    "Practical DIY marketing strategies for local businesses, including referral marketing, reviews, loyalty offers, and promotional planning.",
  alternates: {
    canonical: "/blog",
  },
  openGraph: {
    title: "DIY Marketing Strategies for Small Businesses in 2026",
    description:
      "Practical DIY marketing strategies for local businesses, including referral marketing, reviews, loyalty offers, and promotional planning.",
    url: BLOG_URL,
    siteName: "Complisk",
    type: "article",
    publishedTime: "2026-03-09",
    modifiedTime: "2026-03-09",
  },
  twitter: {
    card: "summary_large_image",
    title: "DIY Marketing Strategies for Small Businesses in 2026",
    description:
      "Practical DIY marketing strategies for local businesses, including referral marketing, reviews, loyalty offers, and promotional planning.",
  },
};

export default function BlogPage() {
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Article",
          headline: "DIY Marketing Strategies (2026)",
          description:
            "A practical guide to referral marketing, customer reviews, special deals, and collaboration ideas for small businesses.",
          author: { "@type": "Organization", name: "Complisk" },
          publisher: {
            "@type": "Organization",
            name: "Complisk",
            logo: {
              "@type": "ImageObject",
              url: `${SITE_URL}/web-app-manifest-512x512.png`,
            },
          },
          datePublished: "2026-03-09",
          dateModified: "2026-03-09",
          mainEntityOfPage: BLOG_URL,
        }}
      />
      <BlogDIYMarketing2026 />
    </>
  );
}

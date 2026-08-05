import type { Metadata } from "next";
import { Suspense } from "react";
import PromotionDetail from "@/views/PromotionDetail";
import PageLoader from "@/app/_components/Loader";
import { getPublicPromotion } from "@/lib/data/publicData";
import { SITE_URL, toAbsoluteUrl } from "@/lib/seo";
import JsonLd from "@/components/seo/JsonLd";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const promotion = await getPublicPromotion(id);

  if (!promotion) {
    return {
      title: "Promotion",
      description: "Browse this local promotion on Complisk.",
      alternates: { canonical: `/promotion/${id}` },
    };
  }

  const title =
    typeof promotion.title === "string" && promotion.title
      ? promotion.title
      : "Promotion";
  const description =
    typeof promotion.description === "string"
      ? promotion.description
      : "Browse this local promotion on Complisk.";
  const image = promotion.bannerImage || promotion.imageUrl || "";

  return {
    title,
    description,
    alternates: { canonical: `/promotion/${id}` },
    openGraph: {
      title,
      description,
      url: `${SITE_URL}/promotion/${id}`,
      siteName: "Complisk",
      type: "website",
      images: image ? [{ url: toAbsoluteUrl(image) }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: image ? [toAbsoluteUrl(image)] : undefined,
    },
  };
}

export default async function PromotionDetailPage({ params }: PageProps) {
  const { id } = await params;
  const promotion = await getPublicPromotion(id);

  const structuredData = promotion
    ? {
        "@context": "https://schema.org",
        "@type": "Product",
        name: typeof promotion.title === "string" ? promotion.title : id,
        description:
          typeof promotion.description === "string"
            ? promotion.description
            : undefined,
        url: `${SITE_URL}/promotion/${id}`,
        image: (promotion.bannerImage || promotion.imageUrl)
          ? toAbsoluteUrl(promotion.bannerImage || promotion.imageUrl)
          : undefined,
        offers: {
          "@type": "Offer",
          availability: "https://schema.org/InStock",
        },
      }
    : {
        // Fallback so the page always emits structured data even if the
        // backend detail endpoint is unavailable.
        "@context": "https://schema.org",
        "@type": "Product",
        name: "Promotion",
        url: `${SITE_URL}/promotion/${id}`,
      };

  return (
    <>
      <JsonLd data={structuredData} />
      <Suspense fallback={<PageLoader />}>
        <PromotionDetail />
      </Suspense>
    </>
  );
}

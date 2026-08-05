import type { Metadata } from "next";
import { Suspense } from "react";
import CategoryPage from "@/views/CategoryPage";
import PageLoader from "@/app/_components/Loader";
import { SITE_URL, formatCategoryName } from "@/lib/seo";
import JsonLd from "@/components/seo/JsonLd";

interface PageProps {
  params: Promise<{ category: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { category } = await params;
  const name = formatCategoryName(category);
  const title = `${name} promotions`;
  const description = `Browse active ${name.toLowerCase()} promotions and local deals on Complisk.`;

  return {
    title,
    description,
    alternates: {
      canonical: `${SITE_URL}/category/${category}`,
    },
    openGraph: {
      title,
      description,
      url: `${SITE_URL}/category/${category}`,
      siteName: "Complisk",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function CategoryRoute({ params }: PageProps) {
  const { category } = await params;
  const name = formatCategoryName(category);

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: `${name} promotions`,
          url: `${SITE_URL}/category/${category}`,
          description: `Browse active ${name.toLowerCase()} promotions and local deals on Complisk.`,
        }}
      />
      <Suspense fallback={<PageLoader />}>
        <CategoryPage />
      </Suspense>
    </>
  );
}

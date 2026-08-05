"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { usePromotionService } from "@/services/promotionService";
import { useUserLocation } from "@/utils/useUserLocation";
import PromotionCard from "@/components/public/PromotionCard";
import Header from "@/components/homePage/Header";
import Seo from "@/components/seo/Seo";
import { SITE_URL } from "@/lib/seo";

const humanize = (id: string) =>
  id.replace(/-/g, " ").replace(/\b\w/g, (s) => s.toUpperCase());

const CategoryPage = () => {
  const { category } = useParams<{ category?: string }>();
  const [loading, setLoading] = useState(true);
  const [promotions, setPromotions] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const { getPromotions } = usePromotionService();
  const getLocation = useCallback(() => {
    try {
      const stored = localStorage.getItem("userLocation");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }, []);
  const fetchPromotions = async () => {
    const location = getLocation();
    setLoading(true);
    setError(null);
    try {
      const response: any = await getPromotions({
        category,
        state: location?.state_code,
        city: location?.city,
      });
      const data = response?.promotions || response || [];
      setPromotions(data);
    } catch (err) {
      setError("Failed to load category promotions");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    if (!category) return;

    fetchPromotions();
  }, [category]);
  useEffect(() => {
    const handleLocationChange = () => {
      fetchPromotions();
    };
    window.addEventListener("locationChanged", handleLocationChange);
    return () =>
      window.removeEventListener("locationChanged", handleLocationChange);
  }, []);

  const categoryTitle = category ? humanize(category) : "Category";

  return (
    <>
      <Seo
        title={`${categoryTitle} promotions`}
        description={`Browse active ${categoryTitle.toLowerCase()} promotions and local deals on Complisk.`}
        pathname={`/category/${category ?? ""}`}
        structuredData={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: `${categoryTitle} promotions`,
          url: `${SITE_URL}/category/${category ?? ""}`,
          mainEntity: {
            "@type": "ItemList",
            itemListElement: promotions
              .slice(0, 10)
              .map((promotion, index) => ({
                "@type": "ListItem",
                position: index + 1,
                name:
                  promotion?.metadata?.promotionTitle ||
                  promotion?.metadata?.promotionDescription ||
                  promotion?.title ||
                  "Promotion",
                url: promotion?.id
                  ? `${SITE_URL}/promotion/${promotion.id}`
                  : `${SITE_URL}/category/${category ?? ""}`,
              })),
          },
        }}
      />
      <Header />
      <div className=" p-3 sm:p-8 ">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <Link href="/" className="underline text-sm">
              Back Home
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-80 bg-gray-200 animate-pulse rounded-lg"
              />
            ))}
          </div>
        ) : error ? (
          <div className="text-center text-muted-foreground py-12">{error}</div>
        ) : promotions.length === 0 ? (
          <div className="text-center text-muted-foreground py-12">
            No promotions found for this category.
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-1 md:gap-2">
            {promotions.map((promotion: any) => (
              <PromotionCard key={promotion.id} promotion={promotion} />
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default CategoryPage;

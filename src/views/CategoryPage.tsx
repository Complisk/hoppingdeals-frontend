"use client";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { usePromotionService } from "@/services/promotionService";
import { useUserLocation } from "@/utils/useUserLocation";
import PromotionCard from "@/components/public/PromotionCard";
import Header from "@/components/homePage/Header";
import Footer from "@/components/homePage/Footer";
import PageHero from "@/components/public/PageHero";
import {
  BROWSE_CATEGORIES,
  formatCategoryLabel,
  getTicketColors,
  readSavedLocationLabel,
} from "@/lib/deal";
import { cn } from "@/lib/utils";
import Seo from "@/components/seo/Seo";
import { SITE_URL } from "@/lib/seo";

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

  const categorySlug = (() => {
    try {
      return category ? decodeURIComponent(category) : "";
    } catch {
      return category || "";
    }
  })();
  const categoryTitle = categorySlug
    ? formatCategoryLabel(categorySlug)
    : "Category";

  const [locationLabel, setLocationLabel] = useState("");
  useEffect(() => {
    const update = () => setLocationLabel(readSavedLocationLabel());
    update();
    window.addEventListener("locationChanged", update);
    return () => window.removeEventListener("locationChanged", update);
  }, []);

  return (
    <>
      <Seo
        title={`${categoryTitle} promotions`}
        description={`Browse active ${categoryTitle.toLowerCase()} promotions and local deals on Hopping Deals.`}
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
      <main className="min-h-screen">
        <PageHero
          scene="street"
          accent={getTicketColors(categorySlug).light}
          title={categoryTitle}
          description={
            locationLabel
              ? `Showing deals near ${locationLabel}.`
              : "Set your location in the header to see deals near you."
          }
          crumbs={[
            { label: "Home", href: "/" },
            { label: "Categories" },
            { label: categoryTitle },
          ]}
        />

        <nav
          aria-label="Other categories"
          className="mx-auto -mt-6 max-w-7xl px-4 sm:px-6 lg:px-8"
        >
          <div className="scrollbar-none flex gap-2 overflow-x-auto rounded-2xl border border-border bg-card/80 p-2 backdrop-blur-md">
            {BROWSE_CATEGORIES.map((item) => {
              const active = item.slug === categorySlug;
              return (
                <Link
                  key={item.slug}
                  href={`/category/${item.slug}`}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "shrink-0 rounded-xl px-3.5 py-2 text-sm font-medium transition-colors",
                    active
                      ? "bg-gold text-gold-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground",
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
        </nav>

        <section className="mx-auto max-w-7xl px-3 py-10 sm:px-6 lg:px-8">
          {!loading && !error && promotions.length > 0 ? (
            <p className="mb-5 px-1 text-sm text-muted-foreground">
              {promotions.length} {promotions.length === 1 ? "deal" : "deals"}
            </p>
          ) : null}

          {loading ? (
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-5 lg:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="overflow-hidden rounded-[14px] border border-border/60 bg-card/60"
                >
                  <div className="aspect-[4/3] animate-pulse bg-secondary/70" />
                  <div className="space-y-2.5 p-4">
                    <div className="h-4 w-2/3 animate-pulse rounded bg-secondary/70" />
                    <div className="h-3.5 w-full animate-pulse rounded bg-secondary/70" />
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="hd-empty">
              <p className="font-medium text-foreground">
                We couldn’t load {categoryTitle.toLowerCase()} deals.
              </p>
              <button
                type="button"
                onClick={fetchPromotions}
                className="text-sm font-semibold text-gold underline-offset-4 hover:underline"
              >
                Try again
              </button>
            </div>
          ) : promotions.length === 0 ? (
            <div className="hd-empty">
              <p className="font-medium text-foreground">
                No {categoryTitle.toLowerCase()} deals near you yet.
              </p>
              <p className="max-w-sm text-sm text-muted-foreground">
                Try another category above, or change your location in the
                header.
              </p>
              <Link
                href="/"
                className="mt-1 text-sm font-semibold text-gold underline-offset-4 hover:underline"
              >
                Back to all deals
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-5 lg:grid-cols-4">
              {promotions.map((promotion: any) => (
                <PromotionCard key={promotion.id} promotion={promotion} />
              ))}
            </div>
          )}
        </section>
      </main>
      <Footer />
    </>
  );
};

export default CategoryPage;

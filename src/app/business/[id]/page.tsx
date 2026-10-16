"use client";

// Public business profile — reached from the Business Directory cards.
// Shows the business info plus its active promotions.

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import Header from "@/components/homePage/Header";
import { formatCategoryLabel, getTicketColors } from "@/lib/deal";
import Footer from "@/components/homePage/Footer";
import PromotionCard from "@/components/public/PromotionCard";
import { MapPin, Gift, Loader2, Building2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { SceneBackdrop } from "@/components/art/Scene";

const BusinessPublicPage = () => {
  const { id } = useParams<{ id: string }>();
  const [business, setBusiness] = useState<any>(null);
  const [promotions, setPromotions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/business-directory/${id}`,
        );
        const data = await res.json();
        if (!mounted) return;
        if (res.ok) {
          setBusiness(data?.business || null);
          setPromotions(Array.isArray(data?.promotions) ? data.promotions : []);
        } else {
          setNotFound(true);
        }
      } catch (error) {
        console.error("Failed to load business:", error);
        setNotFound(true);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [id]);

  return (
    <>
      <Header />

      <div className="flex min-h-screen flex-col">
        {loading ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 py-32">
            <Loader2 className="h-8 w-8 animate-spin text-gold" />
            <p className="text-sm text-muted-foreground">Loading business…</p>
          </div>
        ) : notFound || !business ? (
          <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-20">
            <div className="hd-empty">
              <Building2 className="h-10 w-10 text-muted-foreground/60" />
              <h1 className="text-xl text-foreground">Business not found</h1>
              <p className="text-sm text-muted-foreground">
                This business isn’t listed in the directory.
              </p>
              <Link
                href="/hopping-deals-business-directory"
                className="text-sm font-semibold text-gold underline-offset-4 hover:underline"
              >
                Back to the directory
              </Link>
            </div>
          </main>
        ) : (
          <>
            <section className="relative isolate overflow-hidden border-b border-white/10 px-4 pb-16 pt-10 sm:px-8 sm:pb-24 sm:pt-14">
              <SceneBackdrop
                name="storefront"
                accent={getTicketColors(business.categories?.[0]).light}
              />
              <div className="mx-auto max-w-6xl">
                <nav aria-label="Breadcrumb" className="mb-6 text-sm text-white/70">
                  <Link href="/" className="hover:text-gold">Home</Link>
                  <span className="mx-2 text-white/40">/</span>
                  <Link
                    href="/hopping-deals-business-directory"
                    className="hover:text-gold"
                  >
                    Business directory
                  </Link>
                </nav>
                <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
                  <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-gold/60 bg-card text-4xl font-black text-gold shadow-[0_0_40px_hsl(var(--gold)/0.25)]">
                    {business.logoUrl ? (
                      <img
                        src={business.logoUrl}
                        alt={business.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      (business.name || "B").charAt(0).toUpperCase()
                    )}
                  </div>
                  <div className="min-w-0">
                    <h1 className="text-3xl text-white drop-shadow-[0_3px_12px_rgb(0_0_0/0.6)] sm:text-4xl">
                      {business.name}
                    </h1>
                    <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-white/80">
                      <span className="capitalize">
                        {business.businessType || "Business"}
                      </span>
                      {business.businessAddress && (
                        <span className="flex items-center gap-1.5">
                          <MapPin className="h-3.5 w-3.5 shrink-0 text-gold" />
                          {business.businessAddress}
                        </span>
                      )}
                    </div>
                    {Array.isArray(business.categories) &&
                      business.categories.length > 0 && (
                        <div className="mt-4 flex flex-wrap gap-2">
                          {business.categories
                            .filter(Boolean)
                            .slice(0, 4)
                            .map((cat: string) => (
                              <Badge
                                key={cat}
                                variant="secondary"
                                className="border-white/15 bg-[rgb(3_8_25/0.6)] text-xs text-white backdrop-blur"
                              >
                                {formatCategoryLabel(cat)}
                              </Badge>
                            ))}
                        </div>
                      )}
                  </div>
                </div>
              </div>
            </section>

            <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-12 sm:px-8">
              <h2 className="flex items-center gap-3 text-xl text-foreground md:text-2xl">
                <span className="hd-sparkle" aria-hidden="true" />
                Deals from {business.name}
              </h2>

              {promotions.length === 0 ? (
                <div className="hd-empty mt-6">
                  <Gift className="h-8 w-8 text-gold" />
                  <p className="font-medium text-foreground">
                    No deals running right now
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Check back soon for new offers from {business.name}.
                  </p>
                </div>
              ) : (
                <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-5 lg:grid-cols-4">
                  {promotions.map((promotion) => (
                    <PromotionCard key={promotion.id} promotion={promotion} />
                  ))}
                </div>
              )}
            </main>
          </>
        )}

        <Footer />
      </div>
    </>
  );
};

export default BusinessPublicPage;

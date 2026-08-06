"use client";

// Public business profile — reached from the Business Directory cards.
// Shows the business info plus its active promotions.

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Header from "@/components/homePage/Header";
import Footer from "@/components/homePage/Footer";
import PromotionCard from "@/components/public/PromotionCard";
import { MapPin, Gift, Loader2, Building2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

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
        const res = await fetch(`/api/business-directory/${id}`);
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

      <div className="min-h-screen flex flex-col bg-white">
        <main className="flex-grow px-4 py-4 md:py-16 sm:px-8">
          <section className="mx-auto max-w-6xl">
            {loading ? (
              <div className="flex flex-col items-center gap-3 py-20">
                <Loader2 className="h-8 w-8 animate-spin text-red-500" />
                <p className="text-sm text-slate-500">Loading business...</p>
              </div>
            ) : notFound || !business ? (
              <div className="rounded-2xl border border-dashed border-slate-300 py-16 text-center">
                <Building2 className="mx-auto h-10 w-10 text-slate-300" />
                <p className="mt-3 font-medium text-slate-600">
                  Business not found
                </p>
                <p className="text-sm text-slate-400">
                  This business is not listed in the directory.
                </p>
              </div>
            ) : (
              <>
                <div className="flex flex-col items-center text-center">
                  <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-2xl bg-red-50 text-4xl font-black text-red-600">
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
                  <h1 className="mt-5 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
                    {business.name}
                  </h1>
                  <p className="mt-1 text-sm capitalize text-slate-500">
                    {business.businessType || "Business"}
                  </p>

                  {business.businessAddress && (
                    <p className="mt-3 flex items-center gap-1.5 text-sm text-slate-500">
                      <MapPin className="h-3.5 w-3.5 shrink-0" />
                      {business.businessAddress}
                    </p>
                  )}

                  {Array.isArray(business.categories) &&
                    business.categories.length > 0 && (
                      <div className="mt-4 flex flex-wrap justify-center gap-2">
                        {business.categories
                          .filter(Boolean)
                          .slice(0, 3)
                          .map((cat: string) => (
                            <Badge key={cat} variant="secondary" className="text-xs">
                              {cat}
                            </Badge>
                          ))}
                      </div>
                    )}
                </div>

                <div className="mt-12">
                  <h2 className="flex items-center gap-2 text-xl font-bold text-slate-900">
                    <Gift className="h-5 w-5 text-red-600" />
                    Active Promotions
                  </h2>

                  {promotions.length === 0 ? (
                    <div className="mt-6 rounded-2xl border border-dashed border-slate-300 py-14 text-center">
                      <p className="font-medium text-slate-600">
                        No active promotions right now
                      </p>
                      <p className="text-sm text-slate-400">
                        Check back soon for new offers from {business.name}.
                      </p>
                    </div>
                  ) : (
                    <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                      {promotions.map((promotion) => (
                        <PromotionCard
                          key={promotion.id}
                          promotion={promotion}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </section>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default BusinessPublicPage;

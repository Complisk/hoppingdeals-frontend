"use client";

// Business Directory — ported 1:1 from the HoppingDeals business directory page.
// Fetches active businesses (with active promotion counts) from the backend
// and shows them as a responsive card grid.

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/homePage/Header";
import Footer from "@/components/homePage/Footer";
import { MapPin, Building2, Gift, ArrowRight, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface DirectoryBusiness {
  id: string;
  name: string;
  logoUrl?: string | null;
  businessType?: string | null;
  businessAddress?: string | null;
  categories?: string[];
  activePromotions?: number;
}

const CompliskBusinessDirectory = () => {
  const router = useRouter();
  const [businesses, setBusinesses] = useState<DirectoryBusiness[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/business-directory`,
        );
        if (res.ok) {
          const data = await res.json();
          if (mounted) setBusinesses(data?.businesses || []);
        }
      } catch (error) {
        console.error("Failed to load business directory:", error);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <>
      <Header light />

      <div className="min-h-screen flex flex-col bg-white">
        <main className="flex-grow px-4 py-4 md:py-28 sm:px-8">
          <section className="mx-auto max-w-6xl">
            <h1 className="text-3xl font-extrabold text-center tracking-tight text-slate-900 sm:text-4xl">
              Hopping Deals Business Directory
            </h1>

            <p className="mt-5 text-base leading-8 text-slate-700 sm:text-lg max-w-3xl mx-auto text-center">
              Support Local with Hopping Deals! Discover the incredible
              businesses that power our platform. Whether they have already
              shared exclusive offers with our users or are gearing up for
              future launches, these merchants are committed to excellence.
            </p>

            <div className="mt-12">
              {loading ? (
                <div className="flex flex-col items-center gap-3 py-20">
                  <Loader2 className="h-8 w-8 animate-spin text-red-500" />
                  <p className="text-sm text-slate-500">
                    Loading businesses...
                  </p>
                </div>
              ) : businesses.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-300 py-16 text-center">
                  <Building2 className="mx-auto h-10 w-10 text-slate-300" />
                  <p className="mt-3 font-medium text-slate-600">
                    No businesses listed yet
                  </p>
                  <p className="text-sm text-slate-400">
                    Businesses will appear here as they join Hopping Deals.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {businesses.map((business) => (
                    <button
                      key={business.id}
                      onClick={() => router.push(`/business/${business.id}`)}
                      className="group flex flex-col rounded-2xl border border-slate-200 bg-white p-6 text-left shadow-sm transition-all hover:-translate-y-1 hover:border-red-300 hover:shadow-lg"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-xl font-black text-red-600 shrink-0">
                            {business.logoUrl ? (
                              <img
                                src={business.logoUrl}
                                alt={business.name}
                                className="h-full w-full rounded-xl object-cover"
                              />
                            ) : (
                              (business.name || "B").charAt(0).toUpperCase()
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="truncate font-bold text-slate-900">
                              {business.name}
                            </p>
                            <p className="text-xs capitalize text-slate-500">
                              {business.businessType || "Business"}
                            </p>
                          </div>
                        </div>
                        <ArrowRight className="h-4 w-4 shrink-0 text-slate-300 transition-all group-hover:translate-x-1 group-hover:text-red-500" />
                      </div>

                      {business.businessAddress && (
                        <p className="mt-4 flex items-center gap-1.5 text-sm text-slate-500">
                          <MapPin className="h-3.5 w-3.5 shrink-0" />
                          <span className="truncate">
                            {business.businessAddress}
                          </span>
                        </p>
                      )}

                      <div className="mt-4 flex flex-wrap gap-2">
                        {Array.isArray(business.categories)
                          ? business.categories
                              .filter(Boolean)
                              .slice(0, 3)
                              .map((cat) => (
                                <Badge
                                  key={cat}
                                  variant="secondary"
                                  className="text-xs"
                                >
                                  {cat}
                                </Badge>
                              ))
                          : null}
                      </div>

                      <div className="mt-auto pt-4 flex items-center gap-1.5 text-sm font-semibold text-red-600">
                        <Gift className="h-4 w-4" />
                        {business.activePromotions || 0} active promotion
                        {(business.activePromotions || 0) === 1 ? "" : "s"}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default CompliskBusinessDirectory;

"use client";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import fetchData from "@/utils/apiAction";
import { Skeleton } from "@/components/ui/skeleton";
import PromotionCard from "./PromotionCard";
import { useIsMobile } from "@/hooks/use-mobile";

interface CategoryCarouselProps {
  title: string;
  categories?: string[];
  excludeCategories?: string[];
}

interface ArrowButtonProps {
  direction: "next" | "prev";
  disabled: boolean;
  loading?: boolean;
  onClick: () => void;
}

type CarouselItem =
  | { type: "promotion"; promotion: any }
  | { type: "skeleton"; id: string }
  | { type: "filler"; id: string };

const ArrowButton = memo(
  ({ direction, disabled, loading = false, onClick }: ArrowButtonProps) => (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={
        direction === "next" ? "Next promotions" : "Previous promotions"
      }
      className="inline-flex h-10 w-10 items-center justify-center rounded-full border bg-blend-hard-light shadow-sm backdrop-blur-sm transition-colors hover:bg-muted disabled:cursor-not-allowed  text-white "
    >
      {direction === "next" && loading ? (
        <Loader2 className="h-5 w-5 animate-spin" />
      ) : direction === "next" ? (
        <ChevronRight className="h-5 w-5" />
      ) : (
        <ChevronLeft className="h-5 w-5" />
      )}
    </button>
  ),
);

ArrowButton.displayName = "ArrowButton";

const PromotionSkeletonCard = memo(() => (
  <div className="p-1">
    <div className="space-y-2">
      <Skeleton className="aspect-[4/4] rounded-lg md:aspect-[4/3]" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-5/6" />
      <Skeleton className="h-4 w-2/3" />
    </div>
  </div>
));

PromotionSkeletonCard.displayName = "PromotionSkeletonCard";

const chunkItems = (items: CarouselItem[], size: number) => {
  const pages: CarouselItem[][] = [];

  for (let index = 0; index < items.length; index += size) {
    pages.push(items.slice(index, index + size));
  }

  return pages;
};

const CategoryCarousel = memo(
  ({ title, categories, excludeCategories }: CategoryCarouselProps) => {
    const mobile = useIsMobile();
    const [promotions, setPromotions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(0);
    const [pendingScrollPage, setPendingScrollPage] = useState<number | null>(
      null,
    );

    const viewportRef = useRef<HTMLDivElement>(null);
    const apiPageRef = useRef(1);
    const hasMoreRef = useRef(true);
    const loadingMoreRef = useRef(false);

    const columns = mobile ? 2 : 3;
    const rows = 2;
    const itemsPerView = columns * rows;
    const API_LIMIT = 16;

    const getLocation = useCallback(() => {
      try {
        const stored = localStorage.getItem("userLocation");
        return stored ? JSON.parse(stored) : null;
      } catch {
        return null;
      }
    }, []);

    const scrollToPage = useCallback(
      (page: number, behavior: ScrollBehavior = "smooth") => {
        const container = viewportRef.current;
        if (!container) return;

        container.scrollTo({
          left: page * container.clientWidth,
          behavior,
        });
      },
      [],
    );

    const fetchPromotions = useCallback(
      async (page: number, reset = false) => {
        if (loadingMoreRef.current && !reset) return;

        setError(null);

        if (reset) {
          hasMoreRef.current = true;
          setLoading(true);
          setCurrentPage(0);
          setPendingScrollPage(0);
          viewportRef.current?.scrollTo({ left: 0, behavior: "auto" });
        } else {
          loadingMoreRef.current = true;
          setLoadingMore(true);
        }

        try {
          const location = getLocation();
          const params = new URLSearchParams();

          if (categories?.length) {
            params.append("category", categories.join(","));
          }

          params.append("page", page.toString());
          params.append("limit", API_LIMIT.toString());

          if (
            location?.source === "browser" ||
            location?.source === "ip" ||
            !location
          ) {
            params.append("country_code", "US");
          } else if (location) {
            if (location.state_code)
              params.append("state", location.state_code);
            if (location.city) params.append("city", location.city);
          }

          const { response, error: fetchError } = await fetchData(
            `/promotions?${params.toString()}`,
            { method: "GET" },
            () => {},
            "business",
          );

          if (fetchError) {
            setError("Failed to load promotions");
            return;
          }

          if (response?.success) {
            const excludedCategorySet = new Set(
              (excludeCategories || [])
                .map((category) => category?.toString().trim().toLowerCase())
                .filter(Boolean),
            );

            const normalizeCategory = (value: unknown) =>
              value?.toString().trim().toLowerCase() || "";

            const isExcludedPromotion = (promotion: any) => {
              if (!excludedCategorySet.size) return false;

              const promotionCategories = new Set<string>();

              if (Array.isArray(promotion?.categories)) {
                promotion.categories.forEach((category: unknown) => {
                  const normalized = normalizeCategory(category);
                  if (normalized) promotionCategories.add(normalized);
                });
              }

              const singleCategory = normalizeCategory(promotion?.category);
              if (singleCategory) promotionCategories.add(singleCategory);

              if (Array.isArray(promotion?.business?.categories)) {
                promotion.business.categories.forEach((category: unknown) => {
                  const normalized = normalizeCategory(category);
                  if (normalized) promotionCategories.add(normalized);
                });
              }

              return [...promotionCategories].some((category) =>
                excludedCategorySet.has(category),
              );
            };

            const newPromotions = (response.promotions || []).filter(
              (promotion: any) => !isExcludedPromotion(promotion),
            );

            setPromotions((previous) =>
              reset ? newPromotions : [...previous, ...newPromotions],
            );
            apiPageRef.current = page;
            hasMoreRef.current = page < response.totalPages;
          }
        } catch {
          setError("Failed to load promotions");
        } finally {
          setLoading(false);
          loadingMoreRef.current = false;
          setLoadingMore(false);
        }
      },
      [API_LIMIT, categories, excludeCategories, getLocation],
    );

    useEffect(() => {
      void fetchPromotions(1, true);
    }, [fetchPromotions]);

    useEffect(() => {
      const handleLocationChange = () => {
        void fetchPromotions(1, true);
      };

      window.addEventListener("locationChanged", handleLocationChange);
      return () =>
        window.removeEventListener("locationChanged", handleLocationChange);
    }, [fetchPromotions]);

    const carouselPages = useMemo(() => {
      const items: CarouselItem[] = promotions.map((promotion) => ({
        type: "promotion",
        promotion,
      }));

      if (loadingMore) {
        items.push(
          ...Array.from({ length: itemsPerView }, (_, index) => ({
            type: "skeleton" as const,
            id: `loading-${apiPageRef.current + 1}-${index}`,
          })),
        );
      }

      const pages = chunkItems(items, itemsPerView);

      if (!pages.length) {
        pages.push([]);
      }

      return pages.map((page, pageIndex) => {
        if (page.length === itemsPerView) return page;

        return [
          ...page,
          ...Array.from({ length: itemsPerView - page.length }, (_, index) => ({
            type: "filler" as const,
            id: `filler-${pageIndex}-${index}`,
          })),
        ];
      });
    }, [itemsPerView, loadingMore, promotions]);

    const totalPages = carouselPages.length;
    const canGoPrev = currentPage > 0;
    const canGoNext = currentPage < totalPages - 1 || hasMoreRef.current;
    const displayedPageTotal = Math.max(totalPages, currentPage + 1);

    useEffect(() => {
      if (loading || loadingMoreRef.current || !hasMoreRef.current) return;

      const isOnLastLoadedPage =
        currentPage >=
        Math.max(Math.ceil(promotions.length / itemsPerView) - 1, 0);

      if (isOnLastLoadedPage) {
        void fetchPromotions(apiPageRef.current + 1);
      }
    }, [
      currentPage,
      fetchPromotions,
      itemsPerView,
      loading,
      promotions.length,
    ]);

    useEffect(() => {
      const container = viewportRef.current;
      if (!container) return;

      const handleScroll = () => {
        const nextPage = Math.round(
          container.scrollLeft / Math.max(container.clientWidth, 1),
        );
        setCurrentPage(nextPage);
      };

      handleScroll();
      container.addEventListener("scroll", handleScroll, { passive: true });
      return () => container.removeEventListener("scroll", handleScroll);
    }, [carouselPages.length, mobile]);

    useEffect(() => {
      if (pendingScrollPage === null) return;
      if (pendingScrollPage >= totalPages) return;

      scrollToPage(pendingScrollPage);
      setPendingScrollPage(null);
    }, [pendingScrollPage, scrollToPage, totalPages]);

    useEffect(() => {
      const maxPage = Math.max(totalPages - 1, 0);

      if (currentPage > maxPage) {
        setCurrentPage(maxPage);
        scrollToPage(maxPage, "auto");
      }
    }, [currentPage, scrollToPage, totalPages]);

    const handleNextClick = useCallback(() => {
      if (!canGoNext || loadingMoreRef.current) return;

      const nextPage = currentPage + 1;
      const loadedPages = Math.max(
        Math.ceil(promotions.length / itemsPerView),
        1,
      );

      if (nextPage >= loadedPages && hasMoreRef.current) {
        void fetchPromotions(apiPageRef.current + 1);
      }

      setPendingScrollPage(nextPage);
    }, [
      canGoNext,
      currentPage,
      fetchPromotions,
      itemsPerView,
      promotions.length,
    ]);

    const handlePrevClick = useCallback(() => {
      if (!canGoPrev) return;
      setPendingScrollPage(currentPage - 1);
    }, [canGoPrev, currentPage]);

    const loadingSkeleton = useMemo(
      () => (
        <section className="relative">
          <div className="mx-2 my-8 border border-black/50 p-2 md:mx-6 md:p-6">
            <div className="mb-4">
              <h2 className="text-xl font-bold md:text-2xl">{title}</h2>
            </div>

            <div className="grid grid-cols-2 gap-3 overflow-hidden md:grid-cols-3 md:gap-4">
              {Array.from({ length: itemsPerView }).map((_, index) => (
                <PromotionSkeletonCard key={index} />
              ))}
            </div>
          </div>
        </section>
      ),
      [itemsPerView, title],
    );

    if (loading) return loadingSkeleton;

    if (error) return <p className="py-8 text-center">{error}</p>;

    if (!promotions.length) {
      return (
        <div className="mb-4 flex items-center justify-between p-4">
          <h2 className="text-xl font-bold md:text-2xl">{title}</h2>
          <p className="py-8 text-center">No promotions available</p>
        </div>
      );
    }

    return (
      <section className="relative">
        <div className="mx-2 my-8 border border-black/50 p-2 md:mx-6 md:p-6">
          <div className="mb-4">
            <h2 className="text-xl font-bold md:text-2xl">{title}</h2>
          </div>

          <div className="relative">
            <div className="absolute left-1 top-1/2 z-10 -translate-y-1/2 md:left-2">
              <ArrowButton
                direction="prev"
                onClick={handlePrevClick}
                disabled={!canGoPrev}
              />
            </div>

            <div
              ref={viewportRef}
              className="overflow-x-auto overflow-y-hidden scroll-smooth [scrollbar-width:none] [-ms-overflow-style:none"
              // style={{ WebkitOverflowScrolling: "touch" }}
            >
              <div className="flex snap-x snap-mandatory touch-auto">
                {carouselPages.map((page, pageIndex) => (
                  <div key={pageIndex} className="min-w-full snap-start">
                    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4">
                      {page.map((item) => {
                        if (item.type === "promotion") {
                          return (
                            <PromotionCard
                              key={item.promotion.id}
                              promotion={item.promotion}
                            />
                          );
                        }

                        if (item.type === "skeleton") {
                          return <PromotionSkeletonCard key={item.id} />;
                        }

                        return (
                          <div key={item.id} className="invisible p-1">
                            <div className="aspect-[4/4] md:aspect-[4/3]" />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="absolute right-1 top-1/2 z-10 -translate-y-1/2 md:right-2">
              <ArrowButton
                direction="next"
                onClick={handleNextClick}
                disabled={!canGoNext || loadingMoreRef.current}
                loading={loadingMore}
              />
            </div>
          </div>
        </div>
      </section>
    );
  },
);

CategoryCarousel.displayName = "CategoryCarousel";

export default CategoryCarousel;

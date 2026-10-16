"use client";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import fetchData from "@/utils/apiAction";
import { Skeleton } from "@/components/ui/skeleton";
import PromotionCard from "./PromotionCard";

// Columns per page: 2 on phones, 3 on tablets, 4 on desktop.
function useColumns() {
  const [columns, setColumns] = useState(4);
  useEffect(() => {
    const sm = window.matchMedia("(max-width: 639px)");
    const md = window.matchMedia("(max-width: 1023px)");
    const update = () => setColumns(sm.matches ? 2 : md.matches ? 3 : 4);
    update();
    sm.addEventListener("change", update);
    md.addEventListener("change", update);
    return () => {
      sm.removeEventListener("change", update);
      md.removeEventListener("change", update);
    };
  }, []);
  return columns;
}

interface CategoryCarouselProps {
  title: string;
  /** Optional link for "See all" (e.g. a category page) */
  href?: string;
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
      className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card/80 text-foreground transition-colors hover:border-gold/60 hover:text-gold disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:border-border disabled:hover:text-foreground"
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
    <div className="overflow-hidden rounded-[14px] border border-border/60 bg-card/60">
      <Skeleton className="aspect-[4/3] rounded-none" />
      <div className="space-y-2.5 p-4">
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-3.5 w-full" />
        <Skeleton className="h-3.5 w-1/2" />
      </div>
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
  ({ title, href, categories, excludeCategories }: CategoryCarouselProps) => {
    const columns = useColumns();
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

    // One row when the section only has a handful of deals, two otherwise.
    const rows = promotions.length > columns ? 2 : 1;
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
    }, [carouselPages.length, columns]);

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

    const gridStyle = {
      gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
    };

    const heading = (
      <div className="mb-5 flex items-end justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <span className="hd-sparkle text-lg" aria-hidden="true" />
          <h2 className="truncate text-xl text-foreground md:text-2xl">
            {title}
          </h2>
          {href ? (
            <a
              href={href}
              className="hidden shrink-0 text-sm font-medium text-gold underline-offset-4 hover:underline sm:inline"
            >
              See all
            </a>
          ) : null}
        </div>
        {!loading && promotions.length > 0 ? (
          <div className="flex shrink-0 items-center gap-2">
            <span className="mr-1 hidden text-xs tabular-nums text-muted-foreground sm:inline">
              {currentPage + 1} / {displayedPageTotal}
            </span>
            <ArrowButton
              direction="prev"
              onClick={handlePrevClick}
              disabled={!canGoPrev}
            />
            <ArrowButton
              direction="next"
              onClick={handleNextClick}
              disabled={!canGoNext || loadingMoreRef.current}
              loading={loadingMore}
            />
          </div>
        ) : null}
      </div>
    );

    const shell = (body: React.ReactNode) => (
      <section className="mx-auto w-full max-w-7xl px-3 py-8 sm:px-6 md:py-10 lg:px-8">
        {heading}
        {body}
      </section>
    );

    if (loading) {
      return shell(
        <div className="grid gap-3 md:gap-5" style={gridStyle}>
          {Array.from({ length: columns }).map((_, index) => (
            <PromotionSkeletonCard key={index} />
          ))}
        </div>,
      );
    }

    if (error) {
      return shell(
        <div className="hd-empty">
          <p className="font-medium text-foreground">
            We couldn’t load these deals.
          </p>
          <button
            type="button"
            onClick={() => void fetchPromotions(1, true)}
            className="text-sm font-semibold text-gold underline-offset-4 hover:underline"
          >
            Try again
          </button>
        </div>,
      );
    }

    if (!promotions.length) {
      return shell(
        <div className="hd-empty">
          <p className="font-medium text-foreground">
            No deals here for your area yet.
          </p>
          <p className="max-w-sm text-sm text-muted-foreground">
            Change your location in the header to see deals somewhere else.
          </p>
        </div>,
      );
    }

    return shell(
      <div
        ref={viewportRef}
        className="scrollbar-none -mx-1 overflow-x-auto overflow-y-hidden scroll-smooth"
      >
        <div className="flex snap-x snap-mandatory touch-auto">
          {carouselPages.map((page, pageIndex) => (
            <div key={pageIndex} className="min-w-full snap-start px-1">
              <div className="grid gap-3 md:gap-5" style={gridStyle}>
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
                    <div key={item.id} className="invisible p-1" aria-hidden="true">
                      <div className="aspect-[4/3]" />
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>,
    );
  },
);

CategoryCarousel.displayName = "CategoryCarousel";

export default CategoryCarousel;

"use client";
import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight, MapPin, Store } from "lucide-react";
import fetchData from "@/utils/apiAction";
import { PromotionVisualCard } from "../shared/PromotionVisualCard";
import PromotionDetailModal from "./PromotionDetailModal";
import Spinner from "@/components/shared/Spinner";

const FeaturedPromotion = () => {
  const [promotions, setPromotions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0); // UI page (which 6 items to show)
  const [apiPage, setApiPage] = useState(1); // API page for fetching
  const [totalApiPages, setTotalApiPages] = useState(0); // Total pages from API
  const [hasMore, setHasMore] = useState(true);
  const [selectedPromotion, setSelectedPromotion] = useState<any>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const ITEMS_PER_VIEW = 6; // 3 columns x 2 rows (items shown per carousel view)
  const API_LIMIT = 12; // Items to fetch per API call

  // Get user location from localStorage
  const getLocation = () => {
    try {
      const stored = localStorage.getItem("userLocation");
      return stored ? JSON.parse(stored) : null;
    } catch (e) {
      console.error("Error parsing stored location:", e);
      return null;
    }
  };

  // Fetch featured promotions (no category filter)
  const fetchPromotions = useCallback(async (page: number, reset: boolean = false) => {
    if (reset) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }
    setError(null);

    try {
      const location = getLocation();
      const params = new URLSearchParams();
      
      // No category filter for featured promotions
      params.append("page", page.toString());
      params.append("limit", API_LIMIT.toString());
      
      if (location) {
        if (location.state_code) params.append("state", location.state_code);
        if (location.city) params.append("city", location.city);
      }

      const { response, error: fetchError } = await fetchData(
        `/promotions?${params.toString()}`,
        { method: "GET" },
        () => {},
        "business"
      );

      if (fetchError) {
        setError("Failed to load promotions");
        return;
      }

      if (response?.success) {
        const newPromotions = response.promotions || [];
        
        if (reset) {
          setPromotions(newPromotions);
          setCurrentPage(0);
        } else {
          setPromotions(prev => [...prev, ...newPromotions]);
        }
        
        setTotalApiPages(response.totalPages || 0);
        setHasMore(page < response.totalPages);
        setApiPage(page);
      }
    } catch (err) {
      console.error("Error fetching promotions:", err);
      setError("Failed to load promotions");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchPromotions(1, true);
  }, []);

  // Listen for location changes
  useEffect(() => {
    const handleLocationChange = () => {
      fetchPromotions(1, true);
    };
    window.addEventListener("locationChanged", handleLocationChange);
    return () => window.removeEventListener("locationChanged", handleLocationChange);
  }, [fetchPromotions]);

  // Calculate UI pagination
  const totalUIPages = Math.ceil(promotions.length / ITEMS_PER_VIEW);
  const startIndex = currentPage * ITEMS_PER_VIEW;
  const visiblePromotions = promotions.slice(startIndex, startIndex + ITEMS_PER_VIEW);

  const goToPrevious = () => {
    if (currentPage > 0) {
      setCurrentPage(prev => prev - 1);
    }
  };

  const goToNext = async () => {
    const nextPage = currentPage + 1;
    const nextStartIndex = nextPage * ITEMS_PER_VIEW;
    
    // Check if we need to fetch more data
    if (nextStartIndex >= promotions.length && hasMore && !loadingMore) {
      // Fetch next page from API
      await fetchPromotions(apiPage + 1, false);
    }
    
    // Only advance if there are more items or we just fetched more
    if (nextStartIndex < promotions.length || hasMore) {
      setCurrentPage(nextPage);
    }
  };

  // Check if can navigate
  const canGoNext = currentPage < totalUIPages - 1 || hasMore;
  const canGoPrev = currentPage > 0;

  // Loading state
  if (loading) {
    return (
      <section className="py-8">
        <div className="container mx-auto px-4">
          <h2 className="text-xl md:text-2xl font-bold text-foreground mb-6">
            Featured Promotions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="h-64 bg-gray-200 animate-pulse rounded-lg"
              />
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Error state
  if (error) {
    return (
      <section className="py-8">
        <div className="container mx-auto px-4">
          <h2 className="text-xl md:text-2xl font-bold text-foreground mb-6">
            Featured Promotions
          </h2>
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-6 text-center">
            <p className="text-destructive">{error}</p>
          </div>
        </div>
      </section>
    );
  }

  // No promotions state
  if (promotions.length === 0) {
    return (
      <section className="py-8">
        <div className="container mx-auto px-4">
          <h2 className="text-xl md:text-2xl font-bold text-foreground mb-6">
            Featured Promotions
          </h2>
          <div className="bg-background border border-border rounded-lg p-8 text-center">
            <p className="text-muted-foreground">
              No promotions available in your area
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <>
      <section className="py-8">
        <div className="container mx-auto px-4">
          {/* Header with title and navigation arrows */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-foreground">
                Featured Promotions
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                {promotions.length}+ deal{promotions.length !== 1 ? "s" : ""} near you
              </p>
            </div>
            
            {/* Navigation Arrows */}
            <div className="flex items-center gap-2">
              <button
                onClick={goToPrevious}
                disabled={!canGoPrev}
                className="p-2 rounded-full bg-background border border-border hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Previous page"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <span className="text-sm text-muted-foreground px-2 min-w-[60px] text-center">
                {loadingMore ? (
                  <Spinner className="h-4 w-4 animate-spin inline"  />
                ) : (
                  `${currentPage + 1} / ${hasMore ? `${totalUIPages}+` : totalUIPages}`
                )}
              </span>
              <button
                onClick={goToNext}
                disabled={!canGoNext || loadingMore}
                className="p-2 rounded-full bg-background border border-border hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Next page"
              >
                {loadingMore ? (
                  <Spinner className="h-5 w-5 animate-spin"  />
                ) : (
                  <ChevronRight className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>

          {/* Carousel Container */}
          <div className="relative">
            {/* Left Arrow (Large Screens) */}
            <button
              onClick={goToPrevious}
              disabled={!canGoPrev}
              className="hidden lg:flex absolute -left-12 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full bg-background border border-border shadow-md hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Previous page"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>

            {/* Grid - 3 columns x 2 rows */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {visiblePromotions.map((promotion: any) => (
                <div
                  key={promotion.id}
                  onClick={() => {
                    setSelectedPromotion(promotion);
                    setModalOpen(true);
                  }}
                  className="cursor-pointer group"
                >
                  <div className="space-y-2">
                    {/* Promotion Image */}
                    <div className="rounded-lg overflow-hidden border border-border group-hover:shadow-lg transition-shadow">
                      <PromotionVisualCard
                        imageUrl={promotion.imageUrl}
                        backgroundColor={promotion.backgroundColor}
                        text={promotion.text}
                        showOverlay={false}
                        className="aspect-[4/3]"
                      />
                    </div>

                    {/* Business Name */}
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <Store className="h-4 w-4 text-primary flex-shrink-0" />
                      <span className="truncate">{promotion?.business?.name}</span>
                    </div>

                    {/* Address */}
                    <div className="flex items-start gap-2 text-xs text-muted-foreground">
                      <MapPin className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
                      <span className="line-clamp-1">
                        {promotion?.business?.businessAddress || "Address not available"}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Right Arrow (Large Screens) */}
            <button
              onClick={goToNext}
              disabled={!canGoNext || loadingMore}
              className="hidden lg:flex absolute -right-12 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full bg-background border border-border shadow-md hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Next page"
            >
              {loadingMore ? (
                <Spinner className="h-6 w-6 animate-spin"  />
              ) : (
                <ChevronRight className="h-6 w-6" />
              )}
            </button>
          </div>

          {/* Pagination Dots */}
          {totalUIPages > 1 && (
            <div className="flex justify-center gap-2 mt-6">
              {Array.from({ length: Math.min(totalUIPages, 10) }).map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentPage(index)}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === currentPage
                      ? "bg-primary"
                      : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
                  }`}
                  aria-label={`Go to page ${index + 1}`}
                />
              ))}
              {hasMore && totalUIPages >= 10 && (
                <span className="text-muted-foreground text-xs">...</span>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Modal */}
      <PromotionDetailModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        promotion={selectedPromotion}
      />
    </>
  );
};

export default FeaturedPromotion;

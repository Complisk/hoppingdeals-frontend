"use client";
import { categories } from "@/data/mockData";
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { usePromotionService } from "@/services/promotionService";
import type { RootState } from "@/store";
import PromotionDetailModal from "./PromotionDetailModal";
import { PromotionVisualCard } from "../shared/PromotionVisualCard";
import { MapPin, Store } from "lucide-react";

interface PromotionFeedProps {
  selectedCategory: string | null;
}

const PromotionFeed = ({ selectedCategory }: PromotionFeedProps) => {
  const dispatch = useDispatch();
  const { getFeaturedPromotions } = usePromotionService();
  const [selectedPromotion, setSelectedPromotion] = useState<any>(null);
  const [open, setOpen] = useState(false);

  const { featuredPromotions, featuredLoading } = useSelector(
    (state: RootState) => state.promotion,
  );

  useEffect(() => {
    getFeaturedPromotions(dispatch);
  }, [dispatch]);

  useEffect(() => {
    const handleLocationChange = () => {
      getFeaturedPromotions(dispatch);
    };
    window.addEventListener("locationChanged", handleLocationChange);
    return () =>
      window.removeEventListener("locationChanged", handleLocationChange);
  }, [dispatch]);

  const filteredPromotions = selectedCategory
    ? (featuredPromotions || []).filter(
        (p: any) => p.category === selectedCategory,
      )
    : featuredPromotions || [];

  const getCategoryInfo = (categoryId: string) => {
    return categories.find((c) => c.id === categoryId);
  };

  return (
    <>
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground">
                {selectedCategory
                  ? `${getCategoryInfo(selectedCategory)?.name} Promotions`
                  : "Featured Promotions"}
              </h2>
              <p className="text-muted-foreground mt-1">
                {filteredPromotions.length} active deals near you
              </p>
            </div>
          </div>

          {featuredLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="h-80 bg-gray-200 animate-pulse rounded-lg"
                />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredPromotions.map((promotion: any) => (
                <div
                  key={promotion.id}
                  onClick={() => {
                    setSelectedPromotion(promotion);
                    setOpen(true);
                  }}
                  className="cursor-pointer space-y-3"
                >
                  {/* Promotion Image */}
                  <PromotionVisualCard
                    imageUrl={promotion.imageUrl}
                    backgroundColor={promotion.backgroundColor}
                    text={promotion.text}
                    showOverlay={false}
                  />

                  {/* Business Name */}
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <Store className="h-4 w-4 text-primary" />
                    <span>{promotion?.business?.name}</span>
                  </div>

                  {/* Address */}
                  <div className="flex items-start gap-2 text-xs text-muted-foreground">
                    <MapPin className="h-4 w-4 mt-0.5 text-primary" />
                    <span>
                      {promotion?.business?.businessAddress ||
                        "Address not available"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Modal */}
      <PromotionDetailModal
        open={open}
        onOpenChange={setOpen}
        promotion={selectedPromotion}
      />
    </>
  );
};

export default PromotionFeed;

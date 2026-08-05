"use client";
import { memo, useCallback, useState } from "react";
import { FileText, MapPin, Store } from "lucide-react";
import { PromotionVisualCard } from "../shared/PromotionVisualCard";
import PromotionDetailModal from "./PromotionDetailModal";

interface PromotionCardProps {
  promotion: any;
  isInWishlist?: boolean;
  onWishlistChange?: (promotionId: string) => void;
  onCardClick?: (promotion: any) => void;
  disableModal?: boolean;
}

const PromotionCard = memo(
  ({
    promotion,
    isInWishlist = false,
    onWishlistChange,
    onCardClick,
    disableModal = false,
  }: PromotionCardProps) => {
    const [modalOpen, setModalOpen] = useState(false);

    const handleModalClose = useCallback((open: boolean) => {
      setModalOpen(open);
    }, []);

    const handleCardClick = useCallback(() => {
      onCardClick?.(promotion);
      if (!disableModal) {
        setModalOpen(true);
      }
    }, [disableModal, onCardClick, promotion]);

    return (
      <>
        <div className="cursor-pointer p-1 relative group" onClick={handleCardClick}>
          <div className="rounded-lg overflow-hidden border hover:shadow-lg transition relative">
            <PromotionVisualCard
              imageUrl={promotion.imageUrl}
              backgroundColor={promotion.backgroundColor}
              text={promotion.text}
              showOverlay={false}
              className="aspect-[4/4] md:aspect-[4/3]"
            />
          </div>
          <div className="flex items-center gap-1 mt-1 text-xs font-medium">
            <Store className="h-4 w-4 text-primary" />
            <span className="truncate">
              {promotion?.business?.name || promotion?.metadata?.businessName || ""}
            </span>
          </div>
          <div className="flex items-center gap-1 mt-1 text-xs ">
            <MapPin className="h-4 w-4 mt-0.5 text-primary" />
            <span className="line-clamp-1">
              {promotion?.business?.businessAddress ||
                promotion?.metadata?.businessAddress ||
                "No address"}
            </span>
          </div>

          <span className="flex items-center w-full gap-1 mt-1 text-xs ">
            <FileText size={15} className="text-primary" />
            <span className="line-clamp-2 w-[90%] whitespace-pre-wrap break-words">
              {promotion?.metadata?.promotionDescription || "No description"}
            </span>
          </span>
        </div>

        {!disableModal && modalOpen && (
          <PromotionDetailModal
            open={modalOpen}
            onOpenChange={handleModalClose}
            promotion={promotion}
            isInWishlist={isInWishlist}
            onWishlistChange={onWishlistChange}
          />
        )}
      </>
    );
  },
);

PromotionCard.displayName = "PromotionCard";

export default PromotionCard;

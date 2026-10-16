"use client";
import { memo, useCallback, useState } from "react";
import { MapPin, Store } from "lucide-react";
import { PromotionVisualCard } from "../shared/PromotionVisualCard";
import PromotionDetailModal from "./PromotionDetailModal";
import {
  formatCategoryLabel,
  formatValidThrough,
  getDealAddress,
  getDealBusinessName,
  getDealDescription,
  getDealPrimaryCategory,
  getTicketColors,
} from "@/lib/deal";

interface PromotionCardProps {
  promotion: any;
  isInWishlist?: boolean;
  onWishlistChange?: (promotionId: string) => void;
  onCardClick?: (promotion: any) => void;
  disableModal?: boolean;
}

// A deal rendered as a coupon ticket: the artwork on top, a perforated tear
// line with punched notches, then a stub in the category's ticket color
// (the same palette as the tickets in the home hero).
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

    const businessName = getDealBusinessName(promotion);
    const address = getDealAddress(promotion);
    const description = getDealDescription(promotion);
    const categorySlug = getDealPrimaryCategory(promotion);
    const category = formatCategoryLabel(categorySlug);
    const validThrough = formatValidThrough(promotion?.stopDate);
    const logoUrl = promotion?.business?.logoUrl;
    const colors = getTicketColors(categorySlug);

    const ticketStyle = {
      "--t-light": colors.light,
      "--t-dark": colors.dark,
    } as React.CSSProperties;

    return (
      <>
        <div className="hd-ticket-frame p-1" style={ticketStyle}>
          <button
            type="button"
            onClick={handleCardClick}
            aria-label={`View deal${businessName ? ` from ${businessName}` : ""}`}
            className="hd-ticket-card block w-full text-left outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <div className="relative">
              <PromotionVisualCard
                imageUrl={promotion.imageUrl}
                backgroundColor={promotion.backgroundColor}
                text={promotion.text}
                showOverlay={false}
                className="aspect-[4/3] bg-secondary"
              />
              {category ? (
                <span className="hd-ticket-label absolute left-2.5 top-2.5 z-40 max-w-[75%] truncate rounded-md px-2 py-0.5 text-[11px] font-bold">
                  {category}
                </span>
              ) : null}
            </div>

            <div className="hd-ticket-stub">
              <div
                className="hd-ticket-tear hd-ticket-tear--light"
                aria-hidden="true"
              />
              <div className="relative z-10 space-y-2 px-4 pb-4 pt-3.5">
                <div className="flex items-center gap-2.5">
                  <span className="grid h-8 w-8 shrink-0 place-items-center overflow-hidden rounded-full border-[1.5px] border-white/80 bg-white/20">
                    {logoUrl ? (
                      <img
                        src={logoUrl}
                        alt=""
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <Store className="h-4 w-4 text-white" aria-hidden="true" />
                    )}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-[15px] font-bold leading-tight">
                    {businessName || "Local business"}
                  </span>
                </div>

                <p className="line-clamp-2 min-h-[2.5rem] whitespace-pre-line break-words text-[13px] font-medium leading-5 text-white/90">
                  {description || "Tap to see the full offer."}
                </p>

                <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 rounded-lg bg-black/25 px-2.5 py-1.5 text-[11.5px] font-medium [text-shadow:none]">
                  <span className="flex min-w-0 items-center gap-1 text-white/90">
                    <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                    <span className="truncate">{address || "Address on request"}</span>
                  </span>
                  {validThrough ? (
                    <span className="shrink-0 text-white">{validThrough}</span>
                  ) : null}
                </div>
              </div>
            </div>
          </button>
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

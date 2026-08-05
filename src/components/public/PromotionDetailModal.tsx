"use client";
import * as Dialog from "@radix-ui/react-dialog";
import {
  Clock,
  MapPin,
  X,
  Heart,
  FileText,
  Calendar,
  Globe,
  ExternalLink,
} from "lucide-react";
import { PromotionVisualCard } from "../shared/PromotionVisualCard";
import { useState, useCallback, useEffect } from "react";
import { addToWishlist, removeFromWishlist } from "@/services/wishlistService";
import { useAppSelector } from "@/hooks/use-redux";
import Link from "next/link";
import Spinner from "@/components/shared/Spinner";
import { normalizeWebsiteUrl } from "@/utils/websiteUrl";
import { parseDateOnlyToLocal } from "@/utils/dateOnly";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  promotion: any;
  isInWishlist?: boolean;
  onWishlistChange?: (promotionId: string) => void;
}

const PromotionDetailModal = ({
  open,
  onOpenChange,
  promotion,
  isInWishlist = false,
  onWishlistChange,
}: Props) => {
  const user = useAppSelector((state) => state.auth.user);
  const business = useAppSelector((state) => state.auth.business);
  const accountType = useAppSelector((state) => state.auth.accountType);
  const [loading, setLoading] = useState(false);
  const [inWishlist, setInWishlist] = useState(isInWishlist);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const actorId = accountType === "business" ? business?.id : user?.id;
  const wishlistRole: "user" | "business" =
    accountType === "business" ? "business" : "user";

  useEffect(() => {
    setInWishlist(Boolean(isInWishlist));
    setShowLoginPrompt(false);
  }, [isInWishlist, promotion?.id]);

  const websiteUrl = normalizeWebsiteUrl(
    promotion?.metadata?.websiteUrl || promotion?.business?.website || "",
  );

  const formatDate = (value?: string) => {
    if (!value) return "Not available";
    const parsed = parseDateOnlyToLocal(value);
    if (!parsed || Number.isNaN(parsed.getTime())) {
      return value.replace(/-/g, "/");
    }
    return parsed.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "2-digit",
    });
  };

  const formatTime = (value?: string) => {
    if (!value) return "Not available";

    const raw = String(value).trim();
    const match = raw.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/);
    if (match) {
      const hours24 = Number(match[1]);
      const minutes = match[2];
      const suffix = hours24 >= 12 ? "PM" : "AM";
      const hours12 = hours24 % 12 || 12;
      return `${hours12}:${minutes} ${suffix}`;
    }

    const parsed = new Date(raw);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
    }

    return raw;
  };

  const formatTimeRange = (start?: string, end?: string) => {
    if (!start && !end) return "Not available";
    if (start && end) return `${formatTime(start)} - ${formatTime(end)}`;
    return formatTime(start || end);
  };

  const handleSaveClick = useCallback(async () => {
    if (!promotion?.id) return;

    if (!actorId) {
      setShowLoginPrompt(true);
      return;
    }
    setLoading(true);
    try {
      if (inWishlist) {
        const res = await removeFromWishlist(promotion.id, wishlistRole);
        if (res?.success) {
          setInWishlist(false);
          onWishlistChange?.(promotion.id);
        }
      } else {
        const res = await addToWishlist(promotion.id, wishlistRole);
        if (res?.success) {
          setInWishlist(true);
          onWishlistChange?.(promotion.id);
        }
      }
    } finally {
      setLoading(false);
    }
  }, [actorId, inWishlist, onWishlistChange, promotion?.id, wishlistRole]);

  if (!promotion) return null;

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/60" />

        <Dialog.Content
          className="
            fixed left-1/2 top-1/2 z-50
            w-[90vw] md:h-[90vh] h-[90vh] md:w-[30vw] 
            -translate-x-1/2 -translate-y-1/2 
            bg-background shadow-xl overflow-hidden
          "
        >
          {/* Image Section */}
          <div className="relative h-[50%]">
            <PromotionVisualCard
              imageUrl={promotion.imageUrl}
              backgroundColor={promotion.backgroundColor}
              text={promotion.text}
              modal={true}
              className="h-full rounded-none border-0 bg-slate-700"
            />

            {!actorId && showLoginPrompt && (
              <div className="absolute bottom-3 left-1/2 z-40 -translate-x-1/2 rounded-lg bg-black/70 px-3 py-2 text-center text-xs text-white">
                <p>Please login to save this promotion.</p>
                <Link
                  href="/auth/login"
                  className="mt-2 inline-block rounded-md bg-white px-3 py-1 text-xs font-semibold text-black hover:bg-gray-100"
                >
                  Login
                </Link>
              </div>
            )}

            {/* Close */}
            <button
              onClick={() => onOpenChange(false)}
              className="absolute top-3 right-3 z-40 rounded-full bg-white/90 p-2 hover:bg-white"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Wishlist */}
            <button
              onClick={handleSaveClick}
              disabled={loading}
              className={`absolute top-3 left-3 z-40 flex items-center gap-1 rounded-full p-2 px-3 text-sm font-medium transition-colors ${
                inWishlist
                  ? "bg-red-600 text-white hover:bg-red-700"
                  : "bg-white text-gray-800 hover:bg-gray-100"
              }`}
            >
              {loading ? (
                <Spinner className="h-4 w-4 text-black" />
              ) : (
                <Heart
                  className={`h-4 w-4 ${inWishlist ? "fill-white" : ""}`}
                />
              )}
              {loading ? "" : inWishlist ? "Remove" : "Save"}
            </button>
          </div>

          {/* Details Section */}
          <div className="p-5 space-y-4 overflow-y-auto h-[50%]">
            <h2 className="text-lg font-semibold">
              {promotion.business?.name ||
                promotion?.metadata?.businessName ||
                "Promotion Details"}
            </h2>

            {/* Address */}
            <div className="flex gap-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4 mt-0.5 text-primary" />
              {promotion.business?.businessAddress ||
                promotion?.metadata?.businessAddress ||
                "Address not available"}
            </div>

            {/* Date Range */}
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-primary" />
              <span>
                <strong>Date :</strong> {formatDate(promotion?.runDate)} -{" "}
                {formatDate(promotion?.stopDate)}
              </span>
            </div>

            {/* Time Range */}
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-primary" />
              <span>
                <strong>Time :</strong>{" "}
                {formatTimeRange(promotion?.runTime, promotion?.stopTime)}
              </span>
            </div>

            {/* Description */}
            <div className="flex items-start w-full gap-2 text-xs">
              <FileText size={15} className="text-primary mt-0.5" />
              <span className="w-[90%] whitespace-pre-wrap break-words">
                {promotion?.metadata?.promotionDescription || "No description"}
              </span>
            </div>

            {websiteUrl ? (
              <a
                href={websiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex w-fit items-center gap-2 rounded-md border border-border bg-secondary/50 px-3 py-2 text-sm font-medium text-foreground hover:bg-secondary"
              >
                <Globe className="h-4 w-4 text-primary" />
                Website Link
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            ) : null}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default PromotionDetailModal;

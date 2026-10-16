"use client";
import * as Dialog from "@radix-ui/react-dialog";
import {
  Clock,
  MapPin,
  X,
  Heart,
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
import { formatCategoryLabel, getDealPrimaryCategory } from "@/lib/deal";

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

  const businessName =
    promotion.business?.name || promotion?.metadata?.businessName || "";
  const address =
    promotion.business?.businessAddress ||
    promotion?.metadata?.businessAddress ||
    "";
  const category = formatCategoryLabel(getDealPrimaryCategory(promotion));
  const description = promotion?.metadata?.promotionDescription || "";

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-[rgb(2_4_10/0.8)] backdrop-blur-sm data-[state=open]:animate-in data-[state=open]:fade-in-0" />

        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[min(92vw,30rem)] -translate-x-1/2 -translate-y-1/2 outline-none data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95">
          <div className="hd-ticket-frame">
            <div className="hd-ticket-card flex max-h-[90vh] flex-col border border-border/70">
              {/* Artwork */}
              <div className="relative shrink-0">
                <PromotionVisualCard
                  imageUrl={promotion.imageUrl}
                  backgroundColor={promotion.backgroundColor}
                  text={promotion.text}
                  modal={true}
                  className="aspect-[4/3] bg-secondary"
                />

                <Dialog.Close
                  aria-label="Close"
                  className="absolute right-3 top-3 z-40 grid h-9 w-9 place-items-center rounded-full border border-white/20 bg-[rgb(3_8_25/0.7)] text-white backdrop-blur-md transition-colors hover:border-gold/60 hover:text-gold"
                >
                  <X className="h-4 w-4" />
                </Dialog.Close>

                {category ? (
                  <span className="absolute left-3 top-3 z-40 rounded-full border border-white/15 bg-[rgb(3_8_25/0.72)] px-3 py-1 text-xs font-semibold text-white backdrop-blur-md">
                    {category}
                  </span>
                ) : null}
              </div>

              <div className="hd-ticket-tear shrink-0" aria-hidden="true" />

              {/* Stub */}
              <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-5">
                <div>
                  <Dialog.Title className="text-xl leading-snug text-foreground">
                    {businessName || "Deal details"}
                  </Dialog.Title>
                  {description ? (
                    <Dialog.Description className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-foreground/85">
                      {description}
                    </Dialog.Description>
                  ) : (
                    <Dialog.Description className="sr-only">
                      Deal details
                    </Dialog.Description>
                  )}
                </div>

                <dl className="grid gap-2.5 rounded-xl border border-border bg-secondary/40 p-3.5 text-sm">
                  <div className="flex gap-2.5">
                    <dt className="sr-only">Dates</dt>
                    <Calendar className="mt-0.5 h-4 w-4 shrink-0 text-gold" aria-hidden="true" />
                    <dd>
                      {formatDate(promotion?.runDate)} to {formatDate(promotion?.stopDate)}
                    </dd>
                  </div>
                  <div className="flex gap-2.5">
                    <dt className="sr-only">Hours</dt>
                    <Clock className="mt-0.5 h-4 w-4 shrink-0 text-gold" aria-hidden="true" />
                    <dd>{formatTimeRange(promotion?.runTime, promotion?.stopTime)}</dd>
                  </div>
                  <div className="flex gap-2.5">
                    <dt className="sr-only">Location</dt>
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gold" aria-hidden="true" />
                    <dd className="text-muted-foreground">
                      {address || "Address not listed"}
                    </dd>
                  </div>
                </dl>

                {!actorId && showLoginPrompt ? (
                  <div className="flex items-center justify-between gap-3 rounded-xl border border-gold/30 bg-gold/10 px-3.5 py-3 text-sm">
                    <p>Log in to save deals to your profile.</p>
                    <Link
                      href="/auth/login"
                      className="shrink-0 rounded-lg bg-gold px-3 py-1.5 text-xs font-semibold text-gold-foreground hover:brightness-110"
                    >
                      Log in
                    </Link>
                  </div>
                ) : null}

                <div className="flex flex-wrap gap-2 pt-1">
                  <button
                    onClick={handleSaveClick}
                    disabled={loading}
                    aria-pressed={inWishlist}
                    className={`inline-flex h-10 items-center gap-2 rounded-xl px-4 text-sm font-semibold transition-colors disabled:opacity-60 ${
                      inWishlist
                        ? "border border-primary/50 bg-primary/15 text-primary-light hover:bg-primary/25"
                        : "bg-primary text-primary-foreground shadow-glow hover:bg-primary-light"
                    }`}
                  >
                    {loading ? (
                      <Spinner className="h-4 w-4" />
                    ) : (
                      <Heart className={`h-4 w-4 ${inWishlist ? "fill-current" : ""}`} />
                    )}
                    {inWishlist ? "Saved" : "Save deal"}
                  </button>

                  {websiteUrl ? (
                    <a
                      href={websiteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex h-10 items-center gap-2 rounded-xl border border-input bg-card/40 px-4 text-sm font-semibold text-foreground transition-colors hover:border-gold/50 hover:bg-accent"
                    >
                      <Globe className="h-4 w-4 text-gold" />
                      Visit website
                      <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
                    </a>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default PromotionDetailModal;

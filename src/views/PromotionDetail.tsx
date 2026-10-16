"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  Clock,
  ExternalLink,
  Globe,
  MapPin,
  Share2,
  Store,
} from "lucide-react";
import Header from "@/components/homePage/Header";
import Footer from "@/components/homePage/Footer";
import { PromotionVisualCard } from "@/components/shared/PromotionVisualCard";
import { Button } from "@/components/ui/button";
import Spinner from "@/components/shared/Spinner";
import { normalizeWebsiteUrl } from "@/utils/websiteUrl";
import { parseDateOnlyToLocal } from "@/utils/dateOnly";
import {
  formatCategoryLabel,
  formatValidThrough,
  getDealAddress,
  getDealBusinessName,
  getDealDescription,
  getDealPrimaryCategory,
} from "@/lib/deal";
import { toast } from "react-toastify";

const formatDate = (value?: string) => {
  const parsed = parseDateOnlyToLocal(value);
  if (!parsed) return "";
  return parsed.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const formatTime = (value?: string) => {
  if (!value) return "";
  const match = String(value).match(/^(\d{1,2}):(\d{2})/);
  if (!match) return String(value);
  const hours = Number(match[1]);
  return `${hours % 12 || 12}:${match[2]} ${hours >= 12 ? "PM" : "AM"}`;
};

// Full-page view of one deal, laid out as a large coupon ticket.
const PromotionDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [promotion, setPromotion] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/promotions/${encodeURIComponent(id)}`,
        );
        const data = res.ok ? await res.json() : null;
        if (mounted) setPromotion(data?.promotion || data?.data || null);
      } catch {
        if (mounted) setPromotion(null);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [id]);

  const handleShare = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: getDealBusinessName(promotion), url });
      } else {
        await navigator.clipboard.writeText(url);
        toast.success("Link copied");
      }
    } catch {
      /* share sheet dismissed */
    }
  };

  const businessName = getDealBusinessName(promotion);
  const description = getDealDescription(promotion);
  const address = getDealAddress(promotion);
  const category = formatCategoryLabel(getDealPrimaryCategory(promotion));
  const websiteUrl = normalizeWebsiteUrl(
    promotion?.metadata?.websiteUrl || promotion?.business?.website || "",
  );

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="group mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-gold"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          Back to all deals
        </Link>

        {loading ? (
          <div className="flex min-h-[40vh] items-center justify-center">
            <Spinner />
          </div>
        ) : !promotion ? (
          <div className="hd-empty mx-auto max-w-xl">
            <h1 className="text-2xl text-foreground">
              This deal isn’t available
            </h1>
            <p className="max-w-sm text-sm text-muted-foreground">
              It may have ended or been taken down by the business. Browse
              what’s running near you instead.
            </p>
            <Button asChild className="mt-2">
              <Link href="/">See current deals</Link>
            </Button>
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-[1.15fr_1fr] lg:items-start">
            <div className="hd-ticket-frame">
              <div className="hd-ticket-card border border-border/70">
                <PromotionVisualCard
                  imageUrl={promotion.imageUrl}
                  backgroundColor={promotion.backgroundColor}
                  text={promotion.text}
                  modal
                  className="aspect-[4/3] bg-secondary"
                />
                <div className="hd-ticket-tear" aria-hidden="true" />
                <div className="flex items-center justify-between gap-3 px-5 py-4 text-sm">
                  <span className="font-medium text-gold">
                    {formatValidThrough(promotion.stopDate)}
                  </span>
                  {category ? (
                    <span className="rounded-full border border-border bg-secondary/60 px-3 py-1 text-xs font-semibold">
                      {category}
                    </span>
                  ) : null}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <span className="grid h-12 w-12 place-items-center overflow-hidden rounded-full border border-gold/30 bg-gold/10 text-gold">
                  {promotion?.business?.logoUrl ? (
                    <img
                      src={promotion.business.logoUrl}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <Store className="h-5 w-5" />
                  )}
                </span>
                <h1 className="text-2xl text-foreground sm:text-3xl">
                  {businessName || "Local deal"}
                </h1>
              </div>

              {description ? (
                <p className="whitespace-pre-wrap break-words text-base leading-7 text-foreground/85">
                  {description}
                </p>
              ) : null}

              <dl className="hd-panel grid gap-4 p-5 text-sm">
                <div className="flex gap-3">
                  <Calendar className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
                  <div>
                    <dt className="text-muted-foreground">Runs</dt>
                    <dd className="font-medium">
                      {formatDate(promotion.runDate)} to{" "}
                      {formatDate(promotion.stopDate)}
                    </dd>
                  </div>
                </div>
                {promotion.runTime || promotion.stopTime ? (
                  <div className="flex gap-3">
                    <Clock className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
                    <div>
                      <dt className="text-muted-foreground">Hours</dt>
                      <dd className="font-medium">
                        {formatTime(promotion.runTime)} to{" "}
                        {formatTime(promotion.stopTime)}
                      </dd>
                    </div>
                  </div>
                ) : null}
                <div className="flex gap-3">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
                  <div>
                    <dt className="text-muted-foreground">Where</dt>
                    <dd className="font-medium">
                      {address || "Address not listed"}
                    </dd>
                  </div>
                </div>
              </dl>

              <div className="flex flex-wrap gap-3">
                {websiteUrl ? (
                  <Button asChild size="lg">
                    <a href={websiteUrl} target="_blank" rel="noopener noreferrer">
                      <Globe className="h-4 w-4" />
                      Visit website
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </Button>
                ) : null}
                <Button variant="outline" size="lg" onClick={handleShare}>
                  <Share2 className="h-4 w-4" />
                  Share deal
                </Button>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default PromotionDetail;

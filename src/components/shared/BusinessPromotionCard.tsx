"use client";
import Link from "next/link";
import { format } from "date-fns";
import {
  Calendar,
  Clock,
  Edit,
  Eye,
  Globe,
  HelpCircle,
  MapPin,
  Power,
  PowerOff,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PromotionVisualCard } from "@/components/shared/PromotionVisualCard";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import Spinner from "@/components/shared/Spinner";
import { parseDateOnlyToLocal } from "@/utils/dateOnly";

interface BusinessPromotionCardProps {
  promotion: any;
  onClick?: () => void;
  onActivate?: (e: React.MouseEvent, promotionId: string) => void;
  onDeactivate?: (e: React.MouseEvent, promotionId: string) => void;
  actioningId?: string | null;
  activateDisabled?: boolean;
  activateDisabledReason?: string;
  className?: string;
}

const getPromotionLocationSummary = (promotion: any) => {
  const cityMap = new Map<
    string,
    { name: string; state_code?: string | null }
  >();
  const stateMap = new Map<string, { name: string; code?: string | null }>();

  const cities = Array.isArray(promotion?.cities) ? promotion.cities : [];
  const states = Array.isArray(promotion?.states) ? promotion.states : [];
  const locations = Array.isArray(promotion?.locations)
    ? promotion.locations
    : [];

  for (const city of cities) {
    const name = String(city?.name || city?.city_name || "").trim();
    if (!name) continue;
    const stateCode =
      String(city?.state_code || "")
        .trim()
        .toUpperCase() || null;
    const countryCode =
      String(city?.country_code || "")
        .trim()
        .toUpperCase() || null;
    const key = `${name.toLowerCase()}|${stateCode || ""}|${countryCode || ""}`;
    if (!cityMap.has(key)) {
      cityMap.set(key, { name, state_code: stateCode });
    }
  }

  for (const state of states) {
    const name = String(
      state?.name || state?.state_name || state?.code || "",
    ).trim();
    if (!name) continue;
    const stateCode =
      String(state?.state_code || state?.code || "")
        .trim()
        .toUpperCase() || null;
    const countryCode =
      String(state?.country_code || "")
        .trim()
        .toUpperCase() || null;
    const key = `${stateCode || name.toLowerCase()}|${countryCode || ""}`;
    if (!stateMap.has(key)) {
      stateMap.set(key, { name, code: stateCode });
    }
  }

  for (const loc of locations) {
    if (!loc || typeof loc !== "object") continue;

    if (loc.type === "city" && loc.city_name) {
      const name = String(loc.city_name).trim();
      if (!name) continue;
      const stateCode =
        String(loc.state_code || "")
          .trim()
          .toUpperCase() || null;
      const countryCode =
        String(loc.country_code || "")
          .trim()
          .toUpperCase() || null;
      const key = `${name.toLowerCase()}|${stateCode || ""}|${countryCode || ""}`;
      if (!cityMap.has(key)) {
        cityMap.set(key, { name, state_code: stateCode });
      }
    }

    if (loc.type === "state" && (loc.state_name || loc.state_code)) {
      const name = String(loc.state_name || loc.state_code || "").trim();
      if (!name) continue;
      const stateCode =
        String(loc.state_code || "")
          .trim()
          .toUpperCase() || null;
      const countryCode =
        String(loc.country_code || "")
          .trim()
          .toUpperCase() || null;
      const key = `${stateCode || name.toLowerCase()}|${countryCode || ""}`;
      if (!stateMap.has(key)) {
        stateMap.set(key, { name, code: stateCode });
      }
    }
  }

  return {
    cities: Array.from(cityMap.values()),
    states: Array.from(stateMap.values()),
  };
};

const getCompactLocationText = (items: Array<{ name: string }>) => {
  if (!items.length) return null;
  return items.length === 1
    ? items[0].name
    : `${items[0].name} +${items.length - 1} more`;
};

const getStatusBadgeVariant = (status: string) => {
  if (status === "active") return "default";
  if (status === "pending") return "secondary";
  return "outline";
};

const getPromotionTitle = (promotion: any) => {
  if (Array.isArray(promotion?.categories) && promotion.categories.length > 0) {
    return String(promotion.categories[0] || "")
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  }
  if (promotion?.category) return String(promotion.category);
  return "Promotion";
};

const formatDateRange = (runDate: any, stopDate: any) => {
  const start = parseDateOnlyToLocal(runDate);
  const end = parseDateOnlyToLocal(stopDate);
  if (
    !start ||
    !end ||
    Number.isNaN(start.getTime()) ||
    Number.isNaN(end.getTime())
  ) {
    return "-";
  }
  return `${format(start, "MMM d")} - ${format(end, "MMM d, yyyy")}`;
};

const formatTimeInViewerTimezone = (utcTimestamp: string | Date) => {
  if (!utcTimestamp) return "-";

  try {
    const date = new Date(utcTimestamp);
    if (Number.isNaN(date.getTime())) return "-";

    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  } catch (error) {
    return "-";
  }
};

export const BusinessPromotionCard = ({
  promotion,
  onClick,
  onActivate,
  onDeactivate,
  actioningId,
  activateDisabled = false,
  activateDisabledReason,
  className,
}: BusinessPromotionCardProps) => {
  const status = String(promotion?.status || "inactive").toLowerCase();
  const promotionId = String(promotion?.id || "");
  const locationSummary = getPromotionLocationSummary(promotion);
  const citiesText = getCompactLocationText(locationSummary.cities);
  const statesText = getCompactLocationText(locationSummary.states);

  return (
    <div
      className={cn(
        "bg-card border rounded overflow-hidden hover:shadow-lg transition-all",
        onClick ? "cursor-pointer" : "",
        className,
      )}
      onClick={onClick}
    >
      <PromotionVisualCard
        imageUrl={promotion?.imageUrl}
        backgroundColor={promotion?.backgroundColor}
        text={promotion?.text}
        className="aspect-video rounded-none border-b"
        showOverlay={false}
      >
        <div className="absolute top-3 left-3 flex gap-2">
          {promotion?.scheduleEnabled && (
            <Badge variant="secondary" className="gap-1">
              <Clock className="h-3 w-3" />
              Scheduled
            </Badge>
          )}
        </div>
        <div className="absolute top-3 right-3 flex items-center gap-1">
          <Badge variant={getStatusBadgeVariant(status)} className="capitalize">
            {status}
          </Badge>
          {status === "pending" && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    aria-label="Pending promotion info"
                    className="inline-flex h-6 w-6 items-center justify-center rounded-full border bg-background/90 text-muted-foreground transition-colors hover:text-foreground"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <HelpCircle className="h-3.5 w-3.5" />
                  </button>
                </TooltipTrigger>
                <TooltipContent
                  side="left"
                  className="max-w-xs text-xs font-normal leading-relaxed"
                >
                  This promotion stays pending until admin approval. If admin
                  takes no action, it auto-approves after 24 hours.
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      </PromotionVisualCard>

      <div className="p-4">
        <h3 className="font-bold truncate mb-2">
          {getPromotionTitle(promotion)}
        </h3>

        <div className="space-y-2 text-sm text-muted-foreground mb-4">
          <div className="flex flex-wrap gap-3">
            {citiesText && (
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                <span>{citiesText}</span>
              </div>
            )}
            {statesText && (
              <div className="flex items-center gap-1">
                <Globe className="h-4 w-4" />
                <span>{statesText}</span>
              </div>
            )}
            {!citiesText && !statesText && (
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                <span>No target locations</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            {formatDateRange(promotion?.runDate, promotion?.stopDate)}
          </div>

          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            {formatTimeInViewerTimezone(promotion?.scheduleStartAt)} -{" "}
            {formatTimeInViewerTimezone(promotion?.scheduleEndAt)}
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm mb-4 border-b pb-4">
          <Eye className="h-4 w-4 text-primary" />
          <span className="font-medium">{Number(promotion?.views || 0)}</span>
          <span className="text-muted-foreground">views</span>
        </div>

        {(status === "active" || status === "inactive") && (
          <div className="flex gap-2 pt-2 border-t border-border">
            <Button
              size="sm"
              variant="outline"
              asChild
              onClick={(e) => e.stopPropagation()}
              className="flex-1 gap-1"
            >
              <Link href={`/business/edit-promotion/${promotionId}`}>
                <Edit className="h-4 w-4" />
                Edit
              </Link>
            </Button>

            {status === "active" && (
              <Button
                size="sm"
                variant="ghost"
                onClick={(e) => onDeactivate?.(e, promotionId)}
                disabled={actioningId === promotionId}
                className="gap-1 text-orange-600 hover:bg-orange-50"
              >
                {actioningId === promotionId ? (
                  <Spinner className="animate-spin" />
                ) : (
                  <PowerOff className="h-4 w-4" />
                )}
                Deactivate
              </Button>
            )}

            {status === "inactive" && (
              <Button
                size="sm"
                variant="ghost"
                onClick={(e) => onActivate?.(e, promotionId)}
                disabled={actioningId === promotionId}
                aria-disabled={activateDisabled}
                title={activateDisabled ? activateDisabledReason : undefined}
                className={cn(
                  "gap-1 text-green-600 hover:bg-green-50",
                  activateDisabled ? "opacity-60 cursor-not-allowed" : "",
                )}
              >
                {actioningId === promotionId ? (
                  <Spinner className="animate-spin" />
                ) : (
                  <Power className="h-4 w-4" />
                )}
                Activate
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default BusinessPromotionCard;

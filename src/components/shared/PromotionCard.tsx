"use client";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { PromotionVisualCard } from "../shared/PromotionVisualCard";
import { cn } from "@/lib/utils";
import { useState } from "react";

export interface TextItem {
  id: string;
  content: string;
  color: string;
  fontSize: string;
  x: number;
  y: number;
}

interface PromotionTextCardProps {
  promotionId: string;
  imageUrl: string;
  backgroundColor: string;
  textItems: TextItem[];
  showOverlay: boolean;
  isActive: boolean;
  onStatusChange?: (status: boolean) => void;
  className?: string;
}

export const PromotionCard = ({
  promotionId,
  imageUrl,
  backgroundColor,
  textItems,
  showOverlay,
  isActive,
  onStatusChange,
  className,
}: PromotionTextCardProps) => {
  const [loading, setLoading] = useState(false);
  const [active, setActive] = useState(isActive);

  const handleToggleStatus = async () => {
    try {
      setLoading(true);

      const response = await fetch(
        `/api/promotions/${promotionId}/${active ? "inactive" : "active"}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update promotion status");
      }

      setActive(!active);
      onStatusChange?.(!active);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={cn("rounded-xl border border-border p-4 space-y-4", className)}
    >
      {/* Preview */}
      <PromotionVisualCard
        imageUrl={imageUrl}
        backgroundColor={backgroundColor}
        text={textItems}
        showOverlay={showOverlay}
        className="aspect-video shadow-md"
      />

      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Checkbox
            checked={active}
            onCheckedChange={handleToggleStatus}
            disabled={loading}
          />
          <span className="text-sm font-medium">
            {active ? "Active" : "Inactive"}
          </span>
        </div>

        <Button
          size="sm"
          variant={active ? "destructive" : "default"}
          onClick={handleToggleStatus}
          disabled={loading}
        >
          {loading ? "Updating..." : active ? "Deactivate" : "Activate"}
        </Button>
      </div>
    </div>
  );
};

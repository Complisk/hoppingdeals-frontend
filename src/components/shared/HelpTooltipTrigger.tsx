"use client";
import { HelpCircle } from "lucide-react";
import type { MouseEvent } from "react";
import { TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface HelpTooltipTriggerProps {
  ariaLabel?: string;
  onClick?: (e: MouseEvent<HTMLButtonElement>) => void;
  className?: string;
  iconSize?: number;
}

const HelpTooltipTrigger = ({
  ariaLabel = "Help",
  onClick,
  className,
  iconSize = 22,
}: HelpTooltipTriggerProps) => {
  return (
    <TooltipTrigger asChild>
      <button
        type="button"
        aria-label={ariaLabel}
        className={cn(
          "ml-1 inline-flex h-9 w-9 items-center justify-center rounded-full text-gold/80 transition-colors duration-200 hover:bg-gold/10 hover:text-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          className,
        )}
        onClick={onClick}
      >
        <HelpCircle size={iconSize} />
      </button>
    </TooltipTrigger>
  );
};

export default HelpTooltipTrigger;

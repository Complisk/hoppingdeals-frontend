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
  iconSize = 38,
}: HelpTooltipTriggerProps) => {
  return (
    <TooltipTrigger asChild>
      <button
        type="button"
        aria-label={ariaLabel}
        className={cn(
          "ml-2 inline-flex h-8 w-8 md:h-11 md:w-11 items-center justify-center rounded-full text-blue-500 transition-colors duration-200",
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

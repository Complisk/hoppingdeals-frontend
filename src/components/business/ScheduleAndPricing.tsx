"use client";

import { useCallback, useState } from "react";
import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import HelpTooltipTrigger from "@/components/shared/HelpTooltipTrigger";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip";
import DatePicker from "react-datepicker";
import { parseDateOnlyToLocal } from "@/utils/dateOnly";
import "react-datepicker/dist/react-datepicker.css";

interface ScheduleAndPricingProps {
  selectedTemplate: string | null;
  customImage: string | null;
  selectedCitiesCount: number;
  selectedStatesCount: number;
  startDate: Date | null;
  startTime: string;
  endDate: Date | null;
  endTime: string;
  selectedEndDate?: string;
  freeStatesIncluded?: number;
  stateUnitPrice?: number;
  isLoading?: boolean;
  scheduleEnabled: boolean;
  scheduleToggleDisabled?: boolean;
  scheduleToggleHelpText?: string;
  onScheduleEnabledChange: (enabled: boolean) => void;
  onStartDateChange: (date: Date) => void;
  onStartTimeChange: (time: string) => void;
  onEndDateChange: (date: Date) => void;
  onEndTimeChange: (time: string) => void;
  onRunPromotion: () => void;
  theme?: "light" | "dark";
}

export const ScheduleAndPricing = ({
  selectedStatesCount,
  startDate,
  startTime,
  endDate,
  endTime,
  selectedEndDate,
  freeStatesIncluded = 0,
  stateUnitPrice = 500,
  isLoading = false,
  scheduleEnabled,
  scheduleToggleDisabled = false,
  scheduleToggleHelpText,
  onScheduleEnabledChange,
  onStartDateChange,
  onStartTimeChange,
  onEndDateChange,
  onEndTimeChange,
  onRunPromotion,
  theme = "light",
}: ScheduleAndPricingProps) => {
  const dark = theme === "dark";
  const includedStates = Math.max(0, Number(freeStatesIncluded || 0));
  const perStatePrice = Math.max(0, Number(stateUnitPrice || 0));
  const extraStates = Math.max(0, selectedStatesCount - includedStates);
  const stateCost = extraStates * perStatePrice;
  const totalCost = stateCost;
  const maxDate = parseDateOnlyToLocal(selectedEndDate) || undefined;
  const [isScheduleTooltipOpen, setIsScheduleTooltipOpen] = useState(false);
  const [isPricingTooltipOpen, setIsPricingTooltipOpen] = useState(false);

  const handleScheduleTooltipClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      setIsScheduleTooltipOpen((prev) => !prev);
    },
    [],
  );

  const handlePricingTooltipClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      setIsPricingTooltipOpen((prev) => !prev);
    },
    [],
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <span
          className={cn(
            "text-sm font-medium px-3 py-1 rounded-full",
            dark ? "bg-card/10 text-muted-foreground/60" : "bg-secondary text-muted-foreground",
          )}
        >
          Step 4
        </span>
        <h3
          className={cn(
            "text-lg font-semibold flex items-center gap-2",
            dark ? "text-white" : "text-foreground",
          )}
        >
          <Clock className={cn("h-5 w-5", dark ? "text-[#FF6B6F]" : "text-primary")} />
          Schedule & Review Pricing
          <TooltipProvider delayDuration={0} skipDelayDuration={0}>
            <Tooltip
              open={isScheduleTooltipOpen}
              onOpenChange={(nextOpen) => {
                if (!nextOpen) setIsScheduleTooltipOpen(false);
              }}
            >
              <HelpTooltipTrigger
                ariaLabel="Schedule and pricing help"
                onClick={handleScheduleTooltipClick}
                className="ml-1"
                iconSize={28}
              />
              <TooltipContent
                sideOffset={10}
                className="w-[calc(100vw-2rem)] max-w-sm text-left text-xs sm:text-base font-normal leading-relaxed bg-[rgb(2_4_10/0.90)] text-white border-white/20 backdrop-blur-[1px] animate-none data-[state=closed]:animate-none"
                onEscapeKeyDown={() => setIsScheduleTooltipOpen(false)}
              >
                Our suggestion is to run your promotion a bit earlier than the
                actual start time (e.g., 1–5 PM today only), should run well
                before 1:00 pm that day.
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </h3>
      </div>

      <div
        className={cn(
          "rounded-lg border px-4 py-3",
          dark
            ? "border-white/10 bg-white/[0.03]"
            : "border-border bg-muted/30",
        )}
      >
        <label className="flex items-center justify-between gap-3">
          <span
            className={cn(
              "text-sm font-medium",
              dark ? "text-white" : undefined,
            )}
          >
            Enable Auto Schedule
          </span>
          <input
            type="checkbox"
            checked={scheduleEnabled}
            onChange={(e) => onScheduleEnabledChange(e.target.checked)}
            className={cn(
              "h-4 w-4",
              dark ? "accent-[#E31E24]" : undefined,
            )}
            disabled={scheduleToggleDisabled}
          />
        </label>
        <p
          className={cn(
            "mt-2 text-xs",
            dark ? "text-muted-foreground/80" : "text-muted-foreground",
          )}
        >
          {scheduleToggleHelpText ||
            "When enabled, promotion starts and expires automatically at the selected date/time."}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Start Date/Time */}
        <div
          className={cn(
            "rounded-2xl p-6 space-y-4",
            dark
              ? "border border-white/10 bg-[#0A1120]/60"
              : "bg-card border border-border",
          )}
        >
          {/* <h4 className="font-medium text-foreground">Start Promotion Date</h4> */}
          <div className="space-y-2">
            <Label className={dark ? "text-white" : undefined}>
              Start Promotion Date{" "}
            </Label>
            <div className="relative">
              <DatePicker
                selected={startDate}
                onChange={(date: Date) => onStartDateChange(date)}
                selectsStart
                startDate={startDate}
                endDate={endDate}
                maxDate={maxDate}
                minDate={new Date()}
                className={cn(
                  "w-full rounded-lg p-2 focus:ring-2 focus:border-transparent transition-all",
                  dark
                    ? "border border-white/10 bg-[#0A1120] text-white placeholder:text-muted-foreground focus:ring-[#E31E24]"
                    : "border border-border bg-background text-foreground focus:ring-primary",
                )}
                placeholderText="Select start date"
                dateFormat="MMM dd, yyyy"
                calendarClassName={cn(
                  "!bg-card !border-border !text-foreground",
                  dark && "!bg-[#0A1120] !border-white/10 !text-white",
                )}
                wrapperClassName="w-full"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label className={dark ? "text-white" : undefined}>
              Start Promotion Time{" "}
            </Label>
            <Input
              type="time"
              value={startTime}
              onChange={(e) => onStartTimeChange(e.target.value)}
              className={cn(
                "transition-all focus:ring-2",
                dark
                  ? "border-white/10 bg-[#0A1120] text-white focus:ring-[#E31E24]"
                  : "focus:ring-primary",
              )}
            />
          </div>
        </div>

        {/* End Date/Time */}
        <div
          className={cn(
            "rounded-2xl p-6 space-y-4",
            dark
              ? "border border-white/10 bg-[#0A1120]/60"
              : "bg-card border border-border",
          )}
        >
          <div className="space-y-2">
            <Label className={dark ? "text-white" : undefined}>
              End Promotion Date{" "}
            </Label>
            <div className="relative">
              <DatePicker
                selected={endDate}
                onChange={(date: Date) => onEndDateChange(date)}
                selectsEnd
                startDate={startDate}
                endDate={endDate}
                maxDate={maxDate}
                minDate={startDate || new Date()}
                className={cn(
                  "w-full rounded-lg p-2 focus:ring-2 focus:border-transparent transition-all",
                  dark
                    ? "border border-white/10 bg-[#0A1120] text-white placeholder:text-muted-foreground focus:ring-[#E31E24]"
                    : "border border-border bg-background text-foreground focus:ring-primary",
                )}
                placeholderText="Select end date"
                dateFormat="MMM dd, yyyy"
                calendarClassName={cn(
                  "!bg-card !border-border !text-foreground",
                  dark && "!bg-[#0A1120] !border-white/10 !text-white",
                )}
                wrapperClassName="w-full"
                highlightDates={startDate ? [startDate] : []}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label className={dark ? "text-white" : undefined}>
              End Promotion Time{" "}
            </Label>
            <Input
              type="time"
              value={endTime}
              onChange={(e) => onEndTimeChange(e.target.value)}
              className={cn(
                "transition-all focus:ring-2",
                dark
                  ? "border-white/10 bg-[#0A1120] text-white focus:ring-[#E31E24]"
                  : "focus:ring-primary",
              )}
            />
          </div>
        </div>

        {/* Pricing Summary */}
        <div
          className={cn(
            "rounded-2xl p-6 space-y-4",
            dark
              ? "relative overflow-hidden border border-[#E31E24]/30 bg-gradient-to-br from-[#E31E24]/15 via-[#0A1120]/70 to-[#7C3AED]/10 shadow-[0_0_50px_rgb(227_30_36/0.1)]"
              : "bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20",
          )}
        >
          {dark && (
            <div
              aria-hidden
              className="pointer-events-none absolute -top-16 left-1/2 h-32 w-64 -translate-x-1/2 rounded-full bg-[#E31E24]/20 blur-3xl"
            />
          )}
          <h4
            className={cn(
              "font-semibold flex items-center gap-2 relative",
              dark ? "text-white" : "text-foreground",
            )}
          >
            Pricing Breakdown
            <TooltipProvider delayDuration={0} skipDelayDuration={0}>
              <Tooltip
                open={isPricingTooltipOpen}
                onOpenChange={(nextOpen) => {
                  if (!nextOpen) setIsPricingTooltipOpen(false);
                }}
              >
                <HelpTooltipTrigger
                  ariaLabel="Pricing breakdown help"
                  onClick={handlePricingTooltipClick}
                  className="ml-0"
                  iconSize={24}
                />
                <TooltipContent
                  sideOffset={10}
                  className="w-[calc(100vw-2rem)] max-w-sm text-left text-xs sm:text-base font-normal leading-relaxed bg-[rgb(2_4_10/0.90)] text-white border-white/20 backdrop-blur-[1px] animate-none data-[state=closed]:animate-none"
                  onEscapeKeyDown={() => setIsPricingTooltipOpen(false)}
                >
                  Additional charges apply only if state(s) are added to this
                  promotion. The state plan starts and ends after 30 calendar
                  days. Otherwise, your promotion is covered by the plan you
                  chose. Just click the “Run it” button to go live (first
                  promotion will take around an hour to be approved by the
                  system; afterward your next promotion should be
                  instantaneous).
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </h4>

          <div className="space-y-3 text-sm relative">
            <div className="flex justify-between items-center text-xs">
              <span
                className={cn(
                  dark ? "text-muted-foreground/80" : "text-muted-foreground",
                )}
              >
                Free city included
              </span>
            </div>

            {stateCost > 0 && (
              <div className="flex justify-between items-center text-xs">
                <span
                  className={cn(
                    dark ? "text-muted-foreground/80" : "text-muted-foreground",
                  )}
                >
                  {extraStates} Additional State{extraStates !== 1 ? "s" : ""} @
                  ${perStatePrice}/each
                </span>
                <span
                  className={cn(
                    "font-medium",
                    dark ? "text-white" : "text-foreground",
                  )}
                >
                  ${stateCost}
                </span>
              </div>
            )}
            {stateCost === 0 && (
              <div className="flex justify-between items-center text-xs">
                <span
                  className={cn(
                    dark ? "text-muted-foreground/80" : "text-muted-foreground",
                  )}
                >
                  Additional state charges
                </span>
                <span
                  className={cn(
                    "font-medium",
                    dark ? "text-white" : "text-foreground",
                  )}
                >
                  $0
                </span>
              </div>
            )}

            <div
              className={cn(
                "border-t pt-3 mt-3",
                dark ? "border-white/10" : "border-border",
              )}
            />

            <div className="flex justify-between items-center">
              <span
                className={cn(
                  "font-semibold",
                  dark ? "text-white" : "text-foreground",
                )}
              >
                Total:
              </span>
              <span
                className={cn(
                  "font-bold",
                  dark
                    ? "text-3xl font-black text-[#FF6B6F] drop-shadow-[0_0_14px_rgb(227_30_36/0.45)]"
                    : "text-lg text-primary",
                )}
              >
                ${totalCost}
              </span>
            </div>
          </div>

          {/* Run Button */}
          <Button
            onClick={onRunPromotion}
            disabled={isLoading}
            className={cn(
              "w-full mt-6",
              dark &&
                "bv-glow bg-[#E31E24] py-6 text-base font-black uppercase tracking-wider text-white hover:bg-[#b91621] transition-all duration-200 active:scale-95",
            )}
          >
            {isLoading ? "Creating..." : "RUN IT"}
          </Button>
        </div>
      </div>
    </div>
  );
};

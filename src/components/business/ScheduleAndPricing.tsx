"use client";

import { useCallback, useState } from "react";
import { Clock } from "lucide-react";
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
}: ScheduleAndPricingProps) => {
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
        <span className="text-sm font-medium text-muted-foreground bg-secondary px-3 py-1 rounded-full">
          Step 4
        </span>
        <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <Clock className="h-5 w-5 text-primary" />
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
                className="w-[calc(100vw-2rem)] max-w-sm text-left text-xs sm:text-base font-normal leading-relaxed bg-black/90 text-white border-white/20 backdrop-blur-[1px] animate-none data-[state=closed]:animate-none"
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

      <div className="rounded-lg border border-border bg-muted/30 px-4 py-3">
        <label className="flex items-center justify-between gap-3">
          <span className="text-sm font-medium">Enable Auto Schedule</span>
          <input
            type="checkbox"
            checked={scheduleEnabled}
            onChange={(e) => onScheduleEnabledChange(e.target.checked)}
            className="h-4 w-4"
            disabled={scheduleToggleDisabled}
          />
        </label>
        <p className="mt-2 text-xs text-muted-foreground">
          {scheduleToggleHelpText ||
            "When enabled, promotion starts and expires automatically at the selected date/time."}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Start Date/Time */}
        <div className="bg-card rounded-2xl p-6 border border-border space-y-4">
          {/* <h4 className="font-medium text-foreground">Start Promotion Date</h4> */}
          <div className="space-y-2">
            <Label>Start Promotion Date </Label>
            <div className="relative">
              <DatePicker
                selected={startDate}
                onChange={(date: Date) => onStartDateChange(date)}
                selectsStart
                startDate={startDate}
                endDate={endDate}
                maxDate={maxDate}
                minDate={new Date()}
                className="w-full rounded-lg border border-border p-2 bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                placeholderText="Select start date"
                dateFormat="MMM dd, yyyy"
                calendarClassName="!bg-card !border-border !text-foreground"
                wrapperClassName="w-full"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Start Promotion Time </Label>
            <Input
              type="time"
              value={startTime}
              onChange={(e) => onStartTimeChange(e.target.value)}
              className="transition-all focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        {/* End Date/Time */}
        <div className="bg-card rounded-2xl p-6 border border-border space-y-4">
          <div className="space-y-2">
            <Label>End Promotion Date </Label>
            <div className="relative">
              <DatePicker
                selected={endDate}
                onChange={(date: Date) => onEndDateChange(date)}
                selectsEnd
                startDate={startDate}
                endDate={endDate}
                maxDate={maxDate}
                minDate={startDate || new Date()}
                className="w-full rounded-lg border border-border p-2 bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                placeholderText="Select end date"
                dateFormat="MMM dd, yyyy"
                calendarClassName="!bg-card !border-border !text-foreground"
                wrapperClassName="w-full"
                highlightDates={startDate ? [startDate] : []}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>End Promotion Time </Label>
            <Input
              type="time"
              value={endTime}
              onChange={(e) => onEndTimeChange(e.target.value)}
              className="transition-all focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        {/* Pricing Summary */}
        <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl p-6 border border-primary/20 space-y-4">
          <h4 className="font-semibold text-foreground flex items-center gap-2">
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
                  className="w-[calc(100vw-2rem)] max-w-sm text-left text-xs sm:text-base font-normal leading-relaxed bg-black/90 text-white border-white/20 backdrop-blur-[1px] animate-none data-[state=closed]:animate-none"
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

          <div className="space-y-3 text-sm">
            <div className="flex justify-between items-center text-xs">
              <span className="text-muted-foreground">Free city included</span>
            </div>

            {stateCost > 0 && (
              <div className="flex justify-between items-center text-xs">
                <span className="text-muted-foreground">
                  {extraStates} Additional State{extraStates !== 1 ? "s" : ""} @
                  ${perStatePrice}/each
                </span>
                <span className="text-foreground font-medium">
                  ${stateCost}
                </span>
              </div>
            )}
            {stateCost === 0 && (
              <div className="flex justify-between items-center text-xs">
                <span className="text-muted-foreground">
                  Additional state charges
                </span>
                <span className="text-foreground font-medium">$0</span>
              </div>
            )}

            <div className="border-t border-border pt-3 mt-3" />

            <div className="flex justify-between items-center">
              <span className="text-foreground font-semibold">Total:</span>
              <span className="text-lg font-bold text-primary">
                ${totalCost}
              </span>
            </div>
          </div>

          {/* Run Button */}
          <Button
            onClick={onRunPromotion}
            disabled={isLoading}
            className="w-full mt-6"
          >
            {isLoading ? "Creating..." : "RUN IT"}
          </Button>
        </div>
      </div>
    </div>
  );
};

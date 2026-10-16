"use client";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Clock } from "lucide-react";
import { parseDateOnlyToLocal } from "@/utils/dateOnly";

interface AdminScheduleProps {
  runDate: Date | null;
  stopDate: Date | null;
  runTime: string;
  stopTime: string;
  onRunDateChange: (date: Date | null) => void;
  onStopDateChange: (date: Date | null) => void;
  onRunTimeChange: (time: string) => void;
  onStopTimeChange: (time: string) => void;
  isLoading?: boolean;
  selectedEndDate?: string;
}

export const AdminSchedule = ({
  runDate,
  stopDate,
  runTime,
  stopTime,
  onRunDateChange,
  onStopDateChange,
  onRunTimeChange,
  onStopTimeChange,
  isLoading = false,
  selectedEndDate,
}: AdminScheduleProps) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-sm font-medium text-muted-foreground bg-secondary px-3 py-1 rounded-full">
          Step 4
        </span>
        <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <Clock className="h-5 w-5 text-primary" /> Start And End
        </h3>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card rounded-2xl p-6 border border-border space-y-4">
          <h4 className="font-medium text-foreground">Start</h4>
          <div className="space-y-2">
            <Label>Date</Label>
            <div className="relative">
              <DatePicker
                selected={runDate}
                onChange={(date: Date | null) => onRunDateChange(date)}
                selectsStart
                startDate={runDate}
                endDate={stopDate}
                maxDate={stopDate || parseDateOnlyToLocal(selectedEndDate) || undefined}
                disabled={isLoading}
                className="w-full rounded-lg border border-border p-2 bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                placeholderText="Select start date"
                dateFormat="MMM dd, yyyy"
                calendarClassName="!bg-card !border-border !text-foreground"
                wrapperClassName="w-full"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Time</Label>
            <Input
              type="time"
              value={runTime}
              onChange={(e) => onRunTimeChange(e.target.value)}
              disabled={isLoading}
              className="transition-all focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        <div className="bg-card rounded-2xl p-6 border border-border space-y-4">
          <h4 className="font-medium text-foreground">End</h4>
          <div className="space-y-2">
            <Label>Date</Label>
            <div className="relative">
              <DatePicker
                selected={stopDate}
                onChange={(date: Date | null) => onStopDateChange(date)}
                selectsEnd
                startDate={runDate}
                endDate={stopDate}
                minDate={runDate || undefined}
                disabled={isLoading}
                className="w-full rounded-lg border border-border p-2 bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                placeholderText="Select end date"
                dateFormat="MMM dd, yyyy"
                calendarClassName="!bg-card !border-border !text-foreground"
                wrapperClassName="w-full"
                highlightDates={runDate ? [runDate] : []}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Time</Label>
            <Input
              type="time"
              value={stopTime}
              onChange={(e) => onStopTimeChange(e.target.value)}
              disabled={isLoading}
              className="transition-all focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSchedule;

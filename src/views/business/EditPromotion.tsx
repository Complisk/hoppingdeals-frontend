"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { usePromotionService } from "@/services/promotionService";
import { useTemplateService } from "@/services/templateService";
import { useSubscriptionService } from "@/services/subscriptionService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { PromotionVisualCard } from "@/components/shared/PromotionVisualCard";
import { TextCustomizer } from "@/components/business/TextCustomizer";
import {
  TemplateSelector, type TemplateSelection, } from "@/components/business/TemplateSelector";
import PromotionLocationEditor from "@/components/business/PromotionLocationEditor";
import OptimizeImage from "@/components/shared/OptimizeImage";
import {
  Calendar, Clock, MapPin, Globe, ChevronLeft, Copy, Check, Edit3, AlertTriangle } from "lucide-react";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import DatePicker from "react-datepicker";
import { toast } from "react-toastify";
import Spinner from "@/components/shared/Spinner";
import { normalizeWebsiteUrl } from "@/utils/websiteUrl";
import { parseDateOnlyToLocal } from "@/utils/dateOnly";

interface TextItem {
  id: string;
  content: string;
  color: string;
  fontSize: string;
  x: number;
  y: number;
}

interface EditPromotionProps {
  isVisitor?: boolean;
}

interface ScheduleConflictState {
  message: string;
  conflictPromotionId: string | null;
}

interface ConflictPromotionSchedule {
  id: string;
  runDate: string;
  runTime: string;
  stopDate: string;
  stopTime: string;
}

const formatLocalDateOnly = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const combineDateAndTime = (date: Date, time: string) => {
  const [hoursText, minutesText] = String(time || "").split(":");
  const hours = Number(hoursText);
  const minutes = Number(minutesText);

  if (!Number.isInteger(hours) || !Number.isInteger(minutes)) {
    return null;
  }

  const combined = new Date(date);
  combined.setHours(hours, minutes, 0, 0);
  return Number.isNaN(combined.getTime()) ? null : combined;
};

const EditPromotion = ({ isVisitor = false }: EditPromotionProps) => {
  const { promotionId } = useParams<{ promotionId: string }>();
  const router = useRouter();
  const { getPromotionById, updatePromotion } = usePromotionService();
  const { getTemplates } = useTemplateService();
  const { getActive } = useSubscriptionService();

  const [promotion, setPromotion] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [activeSubscription, setActiveSubscription] = useState<any>(null);
  const [subscriptionLoading, setSubscriptionLoading] = useState(true);
  const [isEditingLocations, setIsEditingLocations] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(
    null,
  );
  const [customImage, setCustomImage] = useState<string | null>(null);
  const [templateColors, setTemplateColors] = useState<string[] | null>(null);
  const [uploadedTemplates, setUploadedTemplates] = useState<any[]>([]);
  const [loadingTemplates, setLoadingTemplates] = useState(false);

  // Editable fields
  const [textItems, setTextItems] = useState<any[]>([]);
  const [backgroundColor, setBackgroundColor] = useState("");
  const [runTime, setRunTime] = useState("");
  const [stopTime, setStopTime] = useState("");
  const [promotionDescription, setPromotionDescription] = useState<string>("");
  const [websiteUrl, setWebsiteUrl] = useState<string>("");
  const [scheduleEnabled, setScheduleEnabled] = useState(false);
  const [scheduleConflict, setScheduleConflict] =
    useState<ScheduleConflictState | null>(null);
  const [conflictPromotionSchedule, setConflictPromotionSchedule] =
    useState<ConflictPromotionSchedule | null>(null);

  // Location editing state
  const [editedStates, setEditedStates] = useState<any[]>([]);
  const [editedCities, setEditedCities] = useState<any[]>([]);
  const [lockedStates, setLockedStates] = useState<any[]>([]);

  // Date editing state
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  const normalizeLocationId = (location: any): string =>
    String(location?.placeId || location?.id || "").trim();

  const cityKey = (location: any): string =>
    [
      String(location?.name || "")
        .trim()
        .toLowerCase(),
      String(location?.state_code || "")
        .trim()
        .toUpperCase(),
      String(location?.country_code || "")
        .trim()
        .toUpperCase(),
    ].join("|") || normalizeLocationId(location);

  const stateKey = (location: any): string =>
    [
      String(location?.state_code || location?.code || "")
        .trim()
        .toUpperCase(),
      String(location?.country_code || "")
        .trim()
        .toUpperCase(),
    ].join("|") || normalizeLocationId(location);

  const dedupeBy = (items: any[], getKey: (item: any) => string) => {
    const seen = new Set<string>();
    const result: any[] = [];
    for (const item of items || []) {
      const key = getKey(item);
      if (!key || seen.has(key)) continue;
      seen.add(key);
      result.push(item);
    }
    return result;
  };
  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        setSubscriptionLoading(true);
        const sub = await getActive();
        setActiveSubscription(sub);
      } catch (err) {
        console.debug("No active subscription", err);
        setActiveSubscription(null);
      } finally {
        setSubscriptionLoading(false);
      }
    };
    fetchSubscription();
  }, []);

  useEffect(() => {
    if (!subscriptionLoading && !activeSubscription && scheduleEnabled) {
      setScheduleEnabled(false);
    }
  }, [subscriptionLoading, activeSubscription, scheduleEnabled]);

  useEffect(() => {
    const fetchPromotion = async () => {
      try {
        setLoading(true);
        const { response, error } = await getPromotionById(promotionId!);

        if (error || !response) {
          toast.error(error);
          router.push("/business/promotions");
          return;
        }
        setPromotion(response);
        setCustomImage(response.imageUrl);
        setSelectedTemplateId(response.templateId || null);
        setSelectedTemplate(response.templateId || null);
        setTextItems(response.text || []);
        setBackgroundColor(response.backgroundColor || "");
        setRunTime(response.runTime || "");
        setStopTime(response.stopTime || "");

        // Promotion description from metadata
        setPromotionDescription(response.metadata?.promotionDescription || "");
        setWebsiteUrl(String(response.metadata?.websiteUrl || ""));
        setTemplateColors(
          Array.isArray(response.metadata?.templateColors)
            ? response.metadata.templateColors
            : null,
        );

        // Initialize edited locations with current promotion data
        const initialStates = dedupeBy(response.states || [], stateKey);
        setLockedStates(initialStates);
        setEditedStates(initialStates);
        setEditedCities(response.cities || []);

        // Initialize edited dates
        if (response.runDate) {
          setStartDate(parseDateOnlyToLocal(response.runDate));
        }
        if (response.stopDate) {
          setEndDate(parseDateOnlyToLocal(response.stopDate));
        }
        setScheduleEnabled(Boolean(response.scheduleEnabled));
      } catch (error) {
        toast.error("Failed to load promotion");
      } finally {
        setLoading(false);
      }
    };

    if (promotionId) {
      fetchPromotion();
    }
  }, [promotionId]);

  useEffect(() => {
    setScheduleConflict(null);
    setConflictPromotionSchedule(null);
  }, [startDate, endDate, runTime, stopTime, scheduleEnabled]);

  const loadConflictPromotionSchedule = async (conflictPromotionId: string) => {
    const { response } = await getPromotionById(conflictPromotionId);
    if (!response) {
      setConflictPromotionSchedule(null);
      return;
    }

    setConflictPromotionSchedule({
      id: String(response.id),
      runDate: String(response.runDate || ""),
      runTime: String(response.runTime || "").slice(0, 5),
      stopDate: String(response.stopDate || ""),
      stopTime: String(response.stopTime || "").slice(0, 5),
    });
  };

  // Template & Image handlers
  const handleTemplateSelect = (template: TemplateSelection) => {
    setSelectedTemplate(template.id);
    setCustomImage(template.imageUrl);
    const resolvedTemplateId =
      template.templateId === undefined ? template.id : template.templateId;
    setSelectedTemplateId(resolvedTemplateId);
    setTemplateColors(template.colors ?? null);
  };

  const handleImageUpload = async (imageData: string) => {
    setCustomImage(imageData);
    setSelectedTemplate(null);
    setSelectedTemplateId(null);
    setTemplateColors(null);
  };

  const handleSave = async () => {
    if (!promotionId) {
      toast.error("Promotion ID not found");
      return;
    }

    if (!customImage) {
      toast.error("Please select an image");
      return;
    }

    try {
      setSaving(true);
      setScheduleConflict(null);
      setConflictPromotionSchedule(null);
      const startLocalDateTime =
        startDate && runTime ? combineDateAndTime(startDate, runTime) : null;
      const endLocalDateTime =
        endDate && stopTime ? combineDateAndTime(endDate, stopTime) : null;

      if (!startLocalDateTime || !endLocalDateTime) {
        toast.error("Please provide valid start/end date and time");
        return;
      }

      const normalizedWebsiteUrl = normalizeWebsiteUrl(websiteUrl);
      if (websiteUrl.trim() && !normalizedWebsiteUrl) {
        toast.error("Please enter a valid website URL.");
        return;
      }

      const updateData: any = {
        templateId: selectedTemplateId || undefined,
        imageUrl: customImage,
        text: textItems,
        backgroundColor,
        runTime,
        stopTime,
        runDate: formatLocalDateOnly(startLocalDateTime),
        stopDate: formatLocalDateOnly(endLocalDateTime),
        scheduleEnabled: activeSubscription ? scheduleEnabled : false,
        scheduleTimezone:
          Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
        states: dedupeBy(editedStates, stateKey),
        cities: dedupeBy(editedCities, cityKey),
      };

      // Merge metadata preserving existing metadata, update description
      const nextMetadata: any = {
        ...(promotion?.metadata || {}),
        promotionDescription,
        ...(normalizedWebsiteUrl ? { websiteUrl: normalizedWebsiteUrl } : {}),
      };
      if (!normalizedWebsiteUrl) {
        delete nextMetadata.websiteUrl;
      }
      if (templateColors?.length) {
        nextMetadata.templateColors = templateColors;
      } else {
        delete nextMetadata.templateColors;
      }
      updateData.metadata = nextMetadata;

      const response = await updatePromotion(promotionId, updateData);
      setScheduleConflict(null);
      setConflictPromotionSchedule(null);
      router.push("/business/promotions");
    } catch (error) {
      const err: any = error;
      const conflictPromotionId = String(
        err?.conflictPromotionId ||
          err?.raw?.conflictPromotionId ||
          err?.response?.data?.conflictPromotionId ||
          "",
      ).trim();
      const conflictCode = String(
        err?.code || err?.raw?.code || err?.response?.data?.code || "",
      ).trim();
      const backendMessage = String(
        err?.message || err?.raw?.message || "Schedule conflict detected.",
      ).trim();
      const selectedStartIsToday =
        startDate &&
        formatLocalDateOnly(startDate) === formatLocalDateOnly(new Date());

      const isScheduleConflict =
        conflictCode === "SCHEDULE_CONFLICT" ||
        Boolean(conflictPromotionId) ||
        /schedule conflict|overlaps this request/i.test(backendMessage);

      if (isScheduleConflict) {
        toast.error("You already have a scheduled promotion at this time.");
        const userMessage = selectedStartIsToday
          ? "You already have a scheduled promotion for today in this selected time. Please update that promotion first."
          : backendMessage;
        setScheduleConflict({
          message: userMessage,
          conflictPromotionId: conflictPromotionId || null,
        });
        if (conflictPromotionId) {
          await loadConflictPromotionSchedule(conflictPromotionId);
        }
      } else {
        toast.error((error as any)?.message || "Failed to update promotion");
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner className="h-8 w-8 animate-spin text-primary"  />
      </div>
    );
  }

  if (!promotion) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Promotion not found</p>
      </div>
    );
  }

  const promotionRunDate = parseDateOnlyToLocal(promotion.runDate);
  const promotionStopDate = parseDateOnlyToLocal(promotion.stopDate);

  return (
    <div className="w-full space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push("/business/promotions")}
          className="gap-2"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to Promotions
        </Button>
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">Edit Promotion</h1>
        </div>
      </div>

      {/* Promotion Info (Read-Only) */}
      <div className="bg-card rounded-2xl border border-border p-4 sm:p-6 space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h3 className="font-semibold text-lg">
              Promotion Details (Read-Only)
            </h3>
          </div>
          {
            <Button
              onClick={() => setIsEditingLocations(true)}
              variant="outline"
              size="sm"
              className="gap-2"
            >
              <Edit3 className="h-4 w-4" />
              Edit Locations
            </Button>
          }
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Status Badge */}
          <div className="bg-muted/30 rounded-lg p-4">
            <p className="text-xs text-muted-foreground mb-2 uppercase font-semibold">
              Status
            </p>
            <Badge
              variant={
                promotion.status === "active"
                  ? "default"
                  : promotion.status === "pending"
                    ? "secondary"
                    : "outline"
              }
              className="capitalize"
            >
              {promotion.status}
            </Badge>
          </div>
          {/* Duration */}
          <div className="bg-muted/30 rounded-lg p-4 col-span-1">
            <p className="text-xs text-muted-foreground mb-2 uppercase font-semibold flex items-center gap-1">
              <Calendar className="h-3 w-3" /> Duration
            </p>
            <p className="font-medium text-sm">
              {promotionRunDate ? format(promotionRunDate, "MMM d") : "-"} -{" "}
              {promotionStopDate
                ? format(promotionStopDate, "MMM d, yyyy")
                : "-"}
            </p>
          </div>

          {/* States */}
          <div className="bg-muted/30 rounded-lg p-4">
            <p className="text-xs text-muted-foreground mb-2 uppercase font-semibold flex items-center gap-1">
              <Globe className="h-3 w-3" /> States
            </p>
            <div className="flex items-center gap-2">
              <p className="font-medium text-lg">{editedStates?.length || 0}</p>
              <p className="text-xs text-muted-foreground">selected</p>
            </div>
          </div>

          {/* Cities */}
          <div className="bg-muted/30 rounded-lg p-4">
            <p className="text-xs text-muted-foreground mb-2 uppercase font-semibold flex items-center gap-1">
              <MapPin className="h-3 w-3" /> Cities
            </p>
            <div className="flex items-center gap-2">
              <p className="font-medium text-lg">{editedCities?.length || 0}</p>
              <p className="text-xs text-muted-foreground">selected</p>
            </div>
          </div>
        </div>

        {/* Selected Locations Details */}
        {(editedStates?.length > 0 || editedCities?.length > 0) && (
          <div className="mt-6 pt-6 border-t border-border">
            <h4 className="font-semibold text-sm mb-4">Selected Locations</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {editedStates?.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-muted-foreground mb-2">
                    STATES ({editedStates.length})
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {editedStates.map((state: any) => (
                      <Badge key={state.id} variant="secondary">
                        {state.state_name || state.name || state.code}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              {editedCities?.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-muted-foreground mb-2">
                    CITIES ({editedCities.length})
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {editedCities.map((city: any) => (
                      <Badge key={city.id} variant="secondary">
                        {city.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Step 1: Template Selection */}
      <section className="bg-card rounded-2xl border border-border p-4 sm:p-6">
        <div className="mb-6">
          <h3 className="font-semibold text-lg">Select or Upload Image</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Choose from predefined templates or upload your custom image
          </p>
        </div>
        <TemplateSelector
          selectedTemplate={selectedTemplate}
          customImage={customImage}
          onTemplateSelect={handleTemplateSelect}
          onImageUpload={handleImageUpload}
        />
      </section>

      {/* Step 2: Live Preview with Editable Fields */}

      {/* Step 3: Text Customizer */}
      <section className="bg-card rounded-2xl border border-border p-4 sm:p-6">
        <div className="mb-6">
          <h3 className="font-semibold text-lg">Customize Text</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Add, edit, and position text on your promotion
          </p>
        </div>
        <TextCustomizer
          selectedTemplate={selectedTemplate}
          customImage={customImage}
          promotionText={textItems}
          backgroundColor={backgroundColor}
          onTextChange={(text) => {
            if (Array.isArray(text)) {
              setTextItems(text);
            }
          }}
          onImageUpload={handleImageUpload}
          onBackgroundColorChange={(color) =>
            setBackgroundColor(String(color))
          }
          promotionDescription={promotionDescription}
          onPromotionDescriptionChange={setPromotionDescription}
          websiteUrl={websiteUrl}
          onWebsiteUrlChange={setWebsiteUrl}
        />
      </section>

      {scheduleConflict && (
        <section className="rounded-lg border border-red-300 bg-red-50 px-4 py-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-start gap-2">
              <AlertTriangle className="mt-0.5 h-4 w-4 text-red-600" />
              <div className="space-y-1">
                <p className="text-sm text-red-700">
                  {scheduleConflict.message}
                </p>
                {conflictPromotionSchedule && (
                  <p className="text-xs text-red-700">
                    Existing schedule: Start {conflictPromotionSchedule.runDate}{" "}
                    {conflictPromotionSchedule.runTime} and End{" "}
                    {conflictPromotionSchedule.stopDate}{" "}
                    {conflictPromotionSchedule.stopTime}
                  </p>
                )}
              </div>
            </div>
            {scheduleConflict.conflictPromotionId && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="border-red-300 bg-white text-red-700 hover:bg-red-100"
                onClick={() =>
                  router.push(
                    `/business/edit-promotion/${scheduleConflict.conflictPromotionId}`,
                  )
                }
              >
                Edit Conflicting Promotion
              </Button>
            )}
          </div>
        </section>
      )}

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="lg:col-span-2 rounded-lg border border-border bg-muted/30 px-4 py-3">
          <label className="flex items-center justify-between gap-3">
            <span className="text-sm font-medium">Enable Auto Schedule</span>
            <input
              type="checkbox"
              checked={scheduleEnabled}
              onChange={(e) => setScheduleEnabled(e.target.checked)}
              className="h-4 w-4"
              disabled={!activeSubscription}
            />
          </label>
          <p className="mt-2 text-xs text-muted-foreground">
            {!activeSubscription
              ? "Auto schedule is disabled until you have an active subscription."
              : "If enabled, this promotion will auto-activate and auto-expire by schedule."}
          </p>
        </div>

        <div className="p-6 border rounded-2xl">
          <h4 className="font-semibold mb-4">Start</h4>

          <Label>Date</Label>
          <DatePicker
            selected={startDate}
            onChange={(date) => setStartDate(date as Date)}
            minDate={new Date()}
            maxDate={
              parseDateOnlyToLocal(activeSubscription?.endDate) || undefined
            }
            className="w-full rounded-lg border border-border p-2 bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            placeholderText="Select end date"
            dateFormat="MMM dd, yyyy"
            calendarClassName="!bg-card !border-border !text-foreground"
            wrapperClassName="w-full"
          />

          <Label className="mt-4 block">Time</Label>
          <Input
            type="time"
            value={runTime}
            onChange={(e) => setRunTime(e.target.value)}
          />
        </div>

        <div className="p-6 border rounded-2xl">
          <h4 className="font-semibold mb-4">End</h4>

          <Label>Date</Label>
          <DatePicker
            selected={endDate}
            onChange={(date) => setEndDate(date as Date)}
            minDate={startDate || new Date()}
            maxDate={
              parseDateOnlyToLocal(activeSubscription?.endDate) || undefined
            }
            className="w-full rounded-lg border border-border p-2 bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            placeholderText="Select end date"
            dateFormat="MMM dd, yyyy"
            calendarClassName="!bg-card !border-border !text-foreground"
            wrapperClassName="w-full"
          />

          <Label className="mt-4 block">Time</Label>
          <Input
            type="time"
            value={stopTime}
            onChange={(e) => setStopTime(e.target.value)}
          />
        </div>
      </section>
      {/* Action Buttons */}
      <div className="sticky bottom-0 flex flex-col gap-3 border-t border-border bg-background pt-4 sm:flex-row sm:justify-end">
        <Button
          variant="outline"
          onClick={() => router.push("/business/promotions")}
          disabled={saving || uploadingImage}
          className="w-full sm:w-auto"
        >
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          disabled={saving || uploadingImage || !customImage}
          className="w-full gap-2 sm:w-auto"
        >
          {saving ? (
            <>
              <Spinner className="h-4 w-4 animate-spin"  />
              Saving...
            </>
          ) : (
            <>
              <Check className="h-4 w-4" />
              Save Changes
            </>
          )}
        </Button>
      </div>

      {/* Location Editing Dialog */}
      <Dialog open={isEditingLocations} onOpenChange={setIsEditingLocations}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Promotion Locations</DialogTitle>
          </DialogHeader>

          <div className="py-4">
            {subscriptionLoading ? (
              <div className="flex justify-center items-center h-64">
                <Spinner className="h-8 w-8 animate-spin"  />
              </div>
            ) : (
              <PromotionLocationEditor
                states={editedStates}
                cities={editedCities}
                lockedStates={lockedStates}
                enforceExistingStatesOnly={true}
                subscription={activeSubscription?.template}
                onStatesChange={setEditedStates}
                onCitiesChange={setEditedCities}
                hasExistingLocations={Number(lockedStates.length || 0)}
              />
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditingLocations(false)}
            >
              Done Editing
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EditPromotion;

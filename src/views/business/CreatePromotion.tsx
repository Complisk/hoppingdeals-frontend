"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAppDispatch } from "@/hooks/use-redux";
import { usePromotionService } from "@/services/promotionService";
import { useSubscriptionService } from "@/services/subscriptionService";
import { useBusinessPromotionTemplateService } from "@/services/businessPromotionTemplateService";
import {
  TemplateSelector,
  type TemplateSelection,
} from "@/components/business/TemplateSelector";
import { TextCustomizer } from "@/components/business/TextCustomizer";
import { LocationTargeter } from "@/components/business/LocationTargeter";
import { ScheduleAndPricing } from "@/components/business/ScheduleAndPricing";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
import { toast } from "react-toastify";
import Spinner from "@/components/shared/Spinner";
import { normalizeWebsiteUrl } from "@/utils/websiteUrl";

interface LocationItem {
  id?: string | number;
  placeId?: string | number;
  name: string;
  type: "city" | "state";
  state_name?: string;
  state_code?: string;
  country_code?: string;
  country_name?: string;
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

const CreatePromotion = ({ isVisitor = false }) => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeSubscriptionLoading, setActiveSubscriptionLoading] =
    useState(!isVisitor);
  const [loading, setLoading] = useState(false);
  const { createPromotion, getPromotionById } = usePromotionService();
  const { getActive, getCachedActive } = useSubscriptionService();
  const { getTemplateById } = useBusinessPromotionTemplateService();
  const [activeSubscription, setActiveSubscription] = useState<any>(null);
  const [selectedBusinessTemplateId, setSelectedBusinessTemplateId] = useState<
    string | null
  >(null);
  const [loadingBusinessTemplate, setLoadingBusinessTemplate] = useState(false);
  const [shouldScrollToCustomization, setShouldScrollToCustomization] =
    useState(false);
  const customizationSectionRef = useRef<HTMLElement | null>(null);
  const businessTemplateIdFromQuery = String(
    searchParams.get("businessTemplateId") || "",
  ).trim();
  useEffect(() => {
    const load = async () => {
      if (isVisitor) return;
      setActiveSubscriptionLoading(true);
      const cachedSubscription = getCachedActive();
      if (cachedSubscription) {
        setActiveSubscription(cachedSubscription);
        setActiveSubscriptionLoading(false);
      }
      try {
        const sub = await getActive();
        setActiveSubscription(sub);
        setActiveSubscriptionLoading(false);
      } catch (err) {
        console.debug("No active subscription", err);
        setActiveSubscriptionLoading(false);
      }
    };
    load();
  }, []);

  const hasActiveSubscription = Boolean(activeSubscription);

  useEffect(() => {
    if (!hasActiveSubscription) {
      setScheduleEnabled(false);
    }
  }, [hasActiveSubscription]);

  useEffect(() => {
    if (isVisitor) return;
    if (!businessTemplateIdFromQuery) {
      setSelectedBusinessTemplateId(null);
      setShouldScrollToCustomization(false);
      return;
    }
    if (activeSubscriptionLoading) return;

    if (!activeSubscription) {
      toast.info(
        "Active subscription is required before using a promotion template.",
      );
      router.push("/business/subscription");
      return;
    }

    let cancelled = false;
    const loadBusinessTemplate = async () => {
      try {
        setLoadingBusinessTemplate(true);
        const template = await getTemplateById(businessTemplateIdFromQuery);
        if (!template || cancelled) return;

        setSelectedBusinessTemplateId(template.id);
        setCustomImage(template.imageUrl || null);
        setSelectedTemplate(template.templateId || null);
        setSelectedTemplateId(template.templateId || null);
        setPromotionText(
          Array.isArray(template.text) && template.text.length
            ? template.text
            : [
                {
                  id: Date.now().toString(),
                  content: "",
                  color: "#ffffff",
                  fontSize: "24",
                  x: 50,
                  y: 50,
                },
              ],
        );
        setBackgroundColor(template.backgroundColor ?? null);
        setTemplateColors(
          Array.isArray(template?.metadata?.templateColors)
            ? template.metadata.templateColors
            : null,
        );
        setPromotionDescription(
          String(template?.metadata?.promotionDescription || ""),
        );
        setWebsiteUrl(String(template?.metadata?.websiteUrl || ""));
        setShouldScrollToCustomization(true);
      } catch (error: any) {
        toast.error(error?.message || "Failed to load promotion template");
        router.push("/business/promotion-templates");
      } finally {
        if (!cancelled) {
          setLoadingBusinessTemplate(false);
        }
      }
    };

    loadBusinessTemplate();
    return () => {
      cancelled = true;
    };
  }, [
    isVisitor,
    businessTemplateIdFromQuery,
    activeSubscriptionLoading,
    activeSubscription,
    router,
  ]);

  useEffect(() => {
    if (!shouldScrollToCustomization || loadingBusinessTemplate) return;

    const timeoutId = window.setTimeout(() => {
      customizationSectionRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
      setShouldScrollToCustomization(false);
    }, 150);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [shouldScrollToCustomization, loadingBusinessTemplate]);

  const maxAllowedCities = isVisitor
    ? 2
    : hasActiveSubscription
      ? Math.max(
          0,
          Number(
            activeSubscription?.template?.freeCities ??
              activeSubscription?.freeCities ??
              0,
          ),
        )
      : 2;
  const maxAllowedStates = isVisitor ? null : null;
  const freeStatesInPlan = Math.max(
    0,
    Number(
      hasActiveSubscription
        ? (activeSubscription?.template?.freeStates ??
            activeSubscription?.freeStates ??
            0)
        : 0,
    ),
  );

  // Template & Text State
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(
    null,
  );
  const [customImage, setCustomImage] = useState<string | null>(null);
  const [templateColors, setTemplateColors] = useState<string[] | null>(null);
  const [promotionText, setPromotionText] = useState<any[]>([
    {
      id: Date.now().toString(),
      content: "",
      color: "#ffffff",
      fontSize: "24",
      x: 50,
      y: 50,
    },
  ]);
  const [textPosition, setTextPosition] = useState({ x: 50, y: 50 });
  const [fontSize, setFontSize] = useState("24");
  const [textColor, setTextColor] = useState("#ffffff");
  const [backgroundColor, setBackgroundColor] = useState(null);
  const [showOverlay, setShowOverlay] = useState(true);
  const [promotionDescription, setPromotionDescription] = useState<string>("");
  const [websiteUrl, setWebsiteUrl] = useState<string>("");

  // Location State
  const [selectedCities, setSelectedCities] = useState<LocationItem[]>([]);
  const [selectedStates, setSelectedStates] = useState<LocationItem[]>([]);
  const [months, setMonths] = useState(1);

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
      String(location?.state_code || location?.name || "")
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

  // Schedule State
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [startTime, setStartTime] = useState<string>("");
  const [endTime, setEndTime] = useState<string>("");
  const [scheduleEnabled, setScheduleEnabled] = useState(false);
  const [scheduleConflict, setScheduleConflict] =
    useState<ScheduleConflictState | null>(null);
  const [conflictPromotionSchedule, setConflictPromotionSchedule] =
    useState<ConflictPromotionSchedule | null>(null);
  const handleStartDateChange = (date: Date) => {
    setStartDate(date);
  };

  const handleEndDateChange = (date: Date) => {
    setEndDate(date);
  };

  // Template & Image handlers
  const handleTemplateSelect = (template: TemplateSelection) => {
    setSelectedTemplate(template.id);
    setCustomImage(template.imageUrl);
    const resolvedTemplateId =
      template.templateId === undefined ? template.id : template.templateId;
    setSelectedTemplateId(resolvedTemplateId);
    setTemplateColors(template.colors ?? null);
    setSelectedBusinessTemplateId(null);
  };

  const handleImageUpload = (imageData: string) => {
    setCustomImage(imageData);
    setSelectedTemplate(null);
    setSelectedTemplateId(null);
    setTemplateColors(null);
    setSelectedBusinessTemplateId(null);
  };

  // Location handlers
  const handleAddCity = (location: LocationItem) => {
    if (maxAllowedCities <= 0) {
      toast.error("Your current subscription does not include city targeting.");
      return;
    }

    if (selectedCities.length >= maxAllowedCities) {
      toast.error(
        `Maximum ${maxAllowedCities} cities allowed in your subscription plan`,
      );
      return;
    }

    const normalizedLocation = {
      ...location,
      id: normalizeLocationId(location),
      placeId: normalizeLocationId(location),
    };

    setSelectedCities((prev) =>
      dedupeBy([...prev, normalizedLocation], cityKey).slice(
        0,
        maxAllowedCities,
      ),
    );
  };

  const handleRemoveCity = (id: string) =>
    setSelectedCities((prev) =>
      prev.filter((c) => normalizeLocationId(c) !== String(id)),
    );

  const handleAddState = (location: LocationItem) => {
    const normalizedLocation = {
      ...location,
      id: normalizeLocationId(location),
      placeId: normalizeLocationId(location),
    };

    setSelectedStates((prev) =>
      dedupeBy([...prev, normalizedLocation], stateKey),
    );
  };

  const handleRemoveState = (id: string) =>
    setSelectedStates((prev) =>
      prev.filter((s) => normalizeLocationId(s) !== String(id)),
    );

  useEffect(() => {
    setScheduleConflict(null);
    setConflictPromotionSchedule(null);
  }, [startDate, endDate, startTime, endTime, scheduleEnabled]);

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

  // Run Promotion handler
  const handleRunPromotion = async () => {
    if (isVisitor) {
      toast.error("You must be logged in to create promotions.");
      return;
    }
    if (!activeSubscription) {
      toast.error(
        "Active subscription required. Please subscribe before creating promotions.",
      );
      router.push("/business/subscription");
      return;
    }
    if (!selectedTemplate && !customImage) {
      toast.error("Please select a template or upload an image");
      return;
    }

    if (selectedCities.length === 0 && selectedStates.length === 0) {
      toast.error("Please add at least one state or city");
      return;
    }

    if (!startDate || !endDate || !startTime || !endTime) {
      toast.error("Please select start/end date and time");
      return;
    }

    const normalizedWebsiteUrl = normalizeWebsiteUrl(websiteUrl);
    if (websiteUrl.trim() && !normalizedWebsiteUrl) {
      toast.error("Please enter a valid website URL.");
      return;
    }

    const browserTimezone =
      Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
    const startLocalDateTime = combineDateAndTime(startDate, startTime);
    const endLocalDateTime = combineDateAndTime(endDate, endTime);

    if (!startLocalDateTime || !endLocalDateTime) {
      toast.error("Invalid start/end time");
      return;
    }

    setLoading(true);
    setScheduleConflict(null);
    setConflictPromotionSchedule(null);
    const payload: any = {
      templateId: selectedTemplateId || undefined,
      businessTemplateId: selectedBusinessTemplateId || undefined,
      imageUrl: customImage || selectedTemplateId || "",
      text: promotionText,
      backgroundColor,
      cities: dedupeBy(selectedCities, cityKey),
      states: dedupeBy(selectedStates, stateKey),
      runDate: formatLocalDateOnly(startLocalDateTime),
      stopDate: formatLocalDateOnly(endLocalDateTime),
      runTime: startTime,
      stopTime: endTime,
      scheduleEnabled: hasActiveSubscription ? scheduleEnabled : false,
      scheduleTimezone: browserTimezone,
      metadata: {
        promotionDescription,
        ...(normalizedWebsiteUrl ? { websiteUrl: normalizedWebsiteUrl } : {}),
        ...(templateColors?.length ? { templateColors } : {}),
      },
    };

    try {
      const { error } = await createPromotion(dispatch, payload);
      if (error) {
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
        }
        return;
      }
    } catch (err: any) {
      toast.error(err?.message || "Failed to create promotion");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full space-y-8 sm:space-y-12">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
            Create Promotion
          </h1>
          <p className="text-muted-foreground">
            Design, customize, and launch your promotion
          </p>
        </div>

        {!isVisitor &&
          (activeSubscriptionLoading ? (
            <div className="flex items-center gap-2">
              <Spinner className="animate-spin h-5 w-5 text-foreground" />
              <span className="text-sm text-foreground">
                Loading subscription...
              </span>
            </div>
          ) : (
            <div className="w-full sm:w-auto">
              {/* Subscription status label */}
              {activeSubscription && activeSubscription.endDate ? (
                (() => {
                  const end = new Date(activeSubscription.endDate);
                  const today = new Date();
                  if (end >= today) {
                    return (
                      <div className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-800">
                        Active until :{" "}
                        {new Date(
                          activeSubscription.endDate,
                        ).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long", // This shows the full month name, e.g., January
                          day: "numeric",
                        })}
                      </div>
                    );
                  }
                  return (
                    <a
                      href="/business/subscription"
                      className="block rounded-lg bg-yellow-50 px-3 py-2 text-sm text-yellow-800"
                    >
                      Subscription expired - renew
                    </a>
                  );
                })()
              ) : (
                <a
                  href="/business/subscription"
                  className="block rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800"
                >
                  No active subscription - subscribe
                </a>
              )}
            </div>
          ))}
      </div>

      {loadingBusinessTemplate && (
        <div className="rounded-lg border border-border bg-muted/30 px-3 py-2 text-sm text-muted-foreground">
          Loading your promotion template...
        </div>
      )}

      {/* Step 1: Template */}
      <section className="bg-card rounded-2xl border border-border p-4 sm:p-6">
        <TemplateSelector
          selectedTemplate={selectedTemplate}
          customImage={customImage}
          onTemplateSelect={handleTemplateSelect}
          onImageUpload={handleImageUpload}
        />
      </section>

      {/* Step 2: Text Customizer */}
      <section
        ref={customizationSectionRef}
        className="bg-card rounded-2xl border border-border p-4 sm:p-6"
      >
        <TextCustomizer
          selectedTemplate={selectedTemplate}
          customImage={customImage}
          promotionText={promotionText}
          backgroundColor={backgroundColor}
          onTextChange={(text) => {
            if (Array.isArray(text)) setPromotionText(text as any[]);
          }}
          promotionDescription={promotionDescription}
          websiteUrl={websiteUrl}
          onImageUpload={handleImageUpload}
          onPromotionDescriptionChange={(e) => setPromotionDescription(e)}
          onWebsiteUrlChange={setWebsiteUrl}
          onBackgroundColorChange={setBackgroundColor}
        />
      </section>

      {/* Step 3: Location */}
      <section className="bg-card rounded-2xl border border-border p-4 sm:p-6">
        <LocationTargeter
          maxCities={maxAllowedCities}
          maxStates={maxAllowedStates === null ? undefined : maxAllowedStates}
          hasActiveSubscription={isVisitor ? true : hasActiveSubscription}
          selectedCities={selectedCities}
          selectedStates={selectedStates}
          onAddCity={handleAddCity}
          onRemoveCity={handleRemoveCity}
          onAddState={handleAddState}
          onRemoveState={handleRemoveState}
        />
      </section>

      {/* Step 4: Schedule & Pricing */}
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
      <section className="bg-card rounded-2xl border border-border p-4 sm:p-6">
        <ScheduleAndPricing
          selectedTemplate={selectedTemplate}
          customImage={customImage}
          selectedCitiesCount={selectedCities.length}
          selectedStatesCount={selectedStates.length}
          startDate={startDate}
          startTime={startTime}
          endDate={endDate}
          endTime={endTime}
          freeStatesIncluded={freeStatesInPlan}
          onStartDateChange={(date: Date) => handleStartDateChange(date)}
          onStartTimeChange={setStartTime}
          onEndDateChange={(date: Date) => handleEndDateChange(date)}
          onEndTimeChange={setEndTime}
          scheduleEnabled={scheduleEnabled}
          onScheduleEnabledChange={setScheduleEnabled}
          scheduleToggleDisabled={!isVisitor && !hasActiveSubscription}
          scheduleToggleHelpText={
            !isVisitor && !hasActiveSubscription
              ? "Auto schedule is disabled until you have an active subscription."
              : undefined
          }
          onRunPromotion={handleRunPromotion}
          selectedEndDate={activeSubscription?.endDate}
          isLoading={loading}
        />
      </section>
    </div>
  );
};

export default CreatePromotion;

"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  TemplateSelector,
  type TemplateSelection,
} from "@/components/business/TemplateSelector";
import AdminSchedule from "@/components/admin/AdminSchedule";
import { TextCustomizer } from "@/components/business/TextCustomizer";
import adminService from "@/services/adminService";
import { Button } from "@/components/ui/button";
import { toast } from "react-toastify";
import { PermissionGuard } from "@/components/shared/PermissionGuard";
import Spinner from "@/components/shared/Spinner";
import PlaceSearch from "@/components/shared/PlaceSearch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Check, MapPin, X } from "lucide-react";
import { BUSINESS_CATEGORIES } from "@/constants";
import { cn } from "@/lib/utils";
import { normalizeWebsiteUrl } from "@/utils/websiteUrl";
import { parseDateOnlyToLocal } from "@/utils/dateOnly";

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

interface AdminLocationTargeterProps {
  selectedCities: any[];
  selectedStates: any[];
  onAddCity: (location: any) => void;
  onRemoveCity: (id: string) => void;
  onAddState: (location: any) => void;
  onRemoveState: (id: string) => void;
}

const AdminLocationTargeter = ({
  selectedCities,
  selectedStates,
  onAddCity,
  onRemoveCity,
  onAddState,
  onRemoveState,
}: AdminLocationTargeterProps) => {
  const handleSelectLocation = (place: any, type: "city" | "state") => {
    const location = {
      placeId: place.placeId,
      id: place.placeId,
      name: type === "city" ? place.city || place.name : place.state || place.name,
      state_name: place.state || "",
      state_code: place.state_code || "",
      country_code: place.country_code || "",
      country_name: place.country || "",
      lat: place.lat,
      lng: place.lng,
      formattedAddress: place.formattedAddress,
      type,
    };

    if (type === "city") onAddCity(location);
    else onAddState(location);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-sm font-medium text-muted-foreground bg-secondary px-3 py-1 rounded-full">
          Step 3
        </span>
        <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <MapPin className="h-5 w-5 text-primary" />
          Target Locations
        </h3>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card rounded-2xl p-6 border border-border space-y-4">
          <div className="mb-4">
            <h4 className="font-semibold text-foreground">Search Locations</h4>
            <p className="text-xs text-muted-foreground mt-1">
              Add unlimited cities and multiple states
            </p>
          </div>

          <div className="space-y-3">
            <div>
              <label>City</label>
              <PlaceSearch
                searchType="city"
                onSelectPlace={(place) => handleSelectLocation(place, "city")}
              />
            </div>

            <div>
              <label>State</label>
              <PlaceSearch
                searchType="state"
                onSelectPlace={(place) => handleSelectLocation(place, "state")}
              />
            </div>
          </div>
        </div>

        <div className="bg-card rounded-2xl p-6 border border-border space-y-4">
          <h4 className="font-semibold text-foreground">Selected Locations</h4>

          {selectedCities.length === 0 && selectedStates.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <MapPin className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No locations selected</p>
              <p className="text-sm">Search and select cities or states</p>
            </div>
          ) : (
            <div className="space-y-2">
              {selectedCities.map((city) => (
                <div
                  key={String(city.id || city.placeId || city.name)}
                  className="flex items-center justify-between px-4 py-2 bg-blue-100 rounded-lg"
                >
                  <div>
                    <span className="text-foreground font-medium">
                      {city.name}
                    </span>
                    <span className="text-xs text-muted-foreground ml-2">
                      {city.state_name} | City
                    </span>
                  </div>
                  <button
                    onClick={() => onRemoveCity(String(city.id || city.placeId || ""))}
                    className="text-xs text-muted-foreground hover:text-destructive"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}

              {selectedStates.map((state) => (
                <div
                  key={String(state.id || state.placeId || state.name)}
                  className="flex items-center justify-between px-4 py-2 bg-green-100 rounded-lg"
                >
                  <div>
                    <span className="text-foreground font-medium">
                      {state.name}
                    </span>
                    <span className="text-xs text-muted-foreground ml-2">
                      State
                    </span>
                  </div>
                  <button
                    onClick={() =>
                      onRemoveState(String(state.id || state.placeId || ""))
                    }
                    className="text-xs text-muted-foreground hover:text-destructive"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const AdminCreatePromotion = () => {
  const { promotionId: promotionIdParam } = useParams();
  const promotionId = promotionIdParam ? String(promotionIdParam) : undefined;
  const router = useRouter();
  const isEdit = !!promotionId;

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
  const [backgroundColor, setBackgroundColor] = useState<number | null>(null);
  const [businessName, setBusinessName] = useState<string>("");
  const [businessAddress, setBusinessAddress] = useState<string>("");
  const [promotionDescription, setPromotionDescription] = useState<string>("");
  const [websiteUrl, setWebsiteUrl] = useState<string>("");

  // Category Selection State
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [categorySearch, setCategorySearch] = useState("");
  const [keyboardNavIndex, setKeyboardNavIndex] = useState(-1);
  const [isSelectOpen, setIsSelectOpen] = useState(false);
  const categoryInputRef = useRef<HTMLInputElement>(null);

  const handleBackgroundColorChange = (val: string | number) =>
    setBackgroundColor(Number(val));

  // Location State
  const [selectedCities, setSelectedCities] = useState<any[]>([]);
  const [selectedStates, setSelectedStates] = useState<any[]>([]);
  const [runDate, setRunDate] = useState<Date | null>(new Date());
  const [stopDate, setStopDate] = useState<Date | null>(() => {
    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + 30);
    return nextDate;
  });
  const [runTime, setRunTime] = useState("00:00");
  const [stopTime, setStopTime] = useState("23:59");
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(false);

  const normalizeLocationId = (location: any): string =>
    String(location?.placeId || location?.id || "").trim();

  const cityKey = (location: any): string =>
    [
      String(location?.name || "").trim().toLowerCase(),
      String(location?.state_code || "").trim().toUpperCase(),
      String(location?.country_code || "").trim().toUpperCase(),
    ].join("|") || normalizeLocationId(location);

  const stateKey = (location: any): string =>
    [
      String(location?.state_code || location?.name || "")
        .trim()
        .toUpperCase(),
      String(location?.country_code || "").trim().toUpperCase(),
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

  // Load promotion if in edit mode
  useEffect(() => {
    const loadPromotion = async () => {
      if (!promotionId) return;
      setPageLoading(true);
      try {
        setLoading(true);
        const promo = await adminService.getPromotionById(promotionId);
        if (!promo) return;
        console.log(promo, "check promo data please");
        // Prefill fields
        setSelectedTemplate(promo.templateId || null);
        setSelectedTemplateId(promo.templateId || null);
        setCustomImage(promo.imageUrl || null);
        setPromotionText(promo.text || []);
        setBackgroundColor(promo.backgroundColor || null);
        setSelectedCities(dedupeBy(promo.cities || [], cityKey));
        setSelectedStates(dedupeBy(promo.states || [], stateKey));
        setSelectedCategories(promo.categories || []);
        setBusinessAddress(promo.metadata?.businessAddress || "");
        setBusinessName(promo.metadata?.businessName || "");
        setPromotionDescription(promo.metadata?.promotionDescription || "");
        setWebsiteUrl(String(promo.metadata?.websiteUrl || ""));
        setRunDate(
          promo.runDate ? parseDateOnlyToLocal(String(promo.runDate)) : null,
        );
        setStopDate(
          promo.stopDate ? parseDateOnlyToLocal(String(promo.stopDate)) : null,
        );
        setRunTime(String(promo.runTime || "").slice(0, 5) || "00:00");
        setStopTime(String(promo.stopTime || "").slice(0, 5) || "23:59");
        setTemplateColors(
          Array.isArray(promo.metadata?.templateColors)
            ? promo.metadata.templateColors
            : null,
        );
        setPageLoading(false);
      } catch (err) {
        console.error("Error loading promotion:", err);
        toast.error("Failed to load promotion");
      } finally {
        setLoading(false);
      }
    };

    loadPromotion();
  }, [promotionId]);
  // Filter categories based on search
  const filteredCategories = BUSINESS_CATEGORIES.filter((category) =>
    category.toLowerCase().includes(categorySearch.toLowerCase()),
  );

  // Handle keyboard navigation in category dropdown
  useEffect(() => {
    if (!isSelectOpen) {
      setKeyboardNavIndex(-1);
      setCategorySearch("");
      return;
    }
    setKeyboardNavIndex(-1);
  }, [isSelectOpen]);

  const handleCategoryKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setKeyboardNavIndex((prev) =>
        prev < filteredCategories.length - 1 ? prev + 1 : prev,
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setKeyboardNavIndex((prev) => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (
        keyboardNavIndex >= 0 &&
        keyboardNavIndex < filteredCategories.length
      ) {
        const category = filteredCategories[keyboardNavIndex];
        if (selectedCategories.includes(category)) {
          setSelectedCategories(
            selectedCategories.filter((c) => c !== category),
          );
        } else if (selectedCategories.length < 2) {
          setSelectedCategories([...selectedCategories, category]);
          setKeyboardNavIndex(-1);
          setCategorySearch("");
        } else {
          toast("You can select a maximum of 2 categories");
        }
      }
    } else if (e.key === "Escape") {
      e.preventDefault();
      setIsSelectOpen(false);
    }
  };

  const handleTemplateSelect = (template: TemplateSelection) => {
    setSelectedTemplate(template.id);
    setCustomImage(template.imageUrl);
    const resolvedTemplateId =
      template.templateId === undefined ? template.id : template.templateId;
    setSelectedTemplateId(resolvedTemplateId);
    setTemplateColors(template.colors ?? null);
  };

  const handleImageUpload = (imageData: string) => {
    setCustomImage(imageData);
    setSelectedTemplate(null);
    setSelectedTemplateId(null);
    setTemplateColors(null);
  };

  const handleAddCity = (location: any) => {
    const normalizedLocation = {
      ...location,
      id: normalizeLocationId(location),
      placeId: normalizeLocationId(location),
    };

    setSelectedCities((prev) =>
      dedupeBy([...prev, normalizedLocation], cityKey),
    );
  };

  const handleAddState = (location: any) => {
    const normalizedLocation = {
      ...location,
      id: normalizeLocationId(location),
      placeId: normalizeLocationId(location),
    };

    setSelectedStates((prev) => dedupeBy([...prev, normalizedLocation], stateKey));
  };

  // Text change wrapper to satisfy TextCustomizer prop types
  const handleTextChange = (text: string | any[]) => {
    if (typeof text === "string") {
      setPromotionText([
        {
          id: Date.now().toString(),
          content: text,
          color: "#ffffff",
          fontSize: "24",
          x: 50,
          y: 50,
        },
      ]);
    } else {
      setPromotionText(text);
    }
  };

  // City/State removal handlers accept id as string from LocationTargeter
  const handleRemoveCity = (id: string) =>
    setSelectedCities((prev) =>
      prev.filter((c) => normalizeLocationId(c) !== String(id)),
    );

  const handleRemoveState = (id: string) =>
    setSelectedStates((prev) =>
      prev.filter((s) => normalizeLocationId(s) !== String(id)),
    );

  const handleRunDateChange = (date: Date | null) => {
    setRunDate(date);
    if (date && stopDate && date > stopDate) {
      setStopDate(date);
    }
  };

  const handleRunPromotion = async () => {
    if (!selectedTemplate && !customImage) {
      toast.error("Please select a template or upload an image");
      return;
    }

    if (!runDate || !stopDate || !runTime || !stopTime) {
      toast.error("Please select start and end date and time");
      return;
    }

    const startDateTime = combineDateAndTime(runDate, runTime);
    const endDateTime = combineDateAndTime(stopDate, stopTime);

    if (!startDateTime || !endDateTime) {
      toast.error("Please enter valid start and end time");
      return;
    }

    if (endDateTime <= startDateTime) {
      toast.error("End date and time must be after start date and time");
      return;
    }

    setLoading(true);

    const normalizedWebsiteUrl = normalizeWebsiteUrl(websiteUrl);
    if (websiteUrl.trim() && !normalizedWebsiteUrl) {
      toast.error("Please enter a valid website URL");
      setLoading(false);
      return;
    }

    const payload: any = {
      templateId: selectedTemplateId || undefined,
      imageUrl: customImage || selectedTemplateId || "",
      text: promotionText,
      backgroundColor,
      cities: dedupeBy(selectedCities, cityKey),
      states: dedupeBy(selectedStates, stateKey),
      categories: selectedCategories,
      runDate: formatLocalDateOnly(startDateTime),
      stopDate: formatLocalDateOnly(endDateTime),
      runTime,
      stopTime,
      metadata: {
        businessName,
        businessAddress,
        promotionDescription,
        ...(normalizedWebsiteUrl ? { websiteUrl: normalizedWebsiteUrl } : {}),
        ...(templateColors?.length ? { templateColors } : {}),
      },
    };

    try {
      if (isEdit && promotionId) {
        await adminService.updatePromotion(promotionId, payload);
        toast.success("Promotion updated");
        router.push("/admin/promotions");
      } else {
        await adminService.createPromotionForBusiness(payload);
        toast.success("Promotion created");
        router.push("/admin/promotions");
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || "Failed to save promotion");
    } finally {
      setLoading(false);
    }
  };

  if (pageLoading)
    return (
      <div className=" w-[100%] h-full flex items-center justify-center">
        <Spinner />
      </div>
    );
  return (
    <PermissionGuard module="promotions" action="create">
      <div className="w-full space-y-12">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Create Promotion
            </h1>
          </div>
        </div>

        {/* Template */}
        {/* Business Info */}
        <section className="bg-card rounded-2xl p-6 border border-border">
          <h2 className="text-lg font-semibold mb-4">Business Information</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-1 block">
                Business Name
              </label>
              <Input
                placeholder="Enter business name"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">
                Business Address
              </label>
              <Input
                placeholder="Enter business address"
                value={businessAddress}
                onChange={(e) => setBusinessAddress(e.target.value)}
              />
            </div>
          </div>

          {/* Business Category Selection */}
          <div className="mt-6 space-y-3">
            <Label htmlFor="categories">
              Business Categories (Select up to 2)
            </Label>
            <div className="space-y-2">
              {/* Display selected categories as badges */}
              {selectedCategories.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {selectedCategories.map((category) => (
                    <div
                      key={category}
                      className="flex items-center gap-2 bg-primary/10 border border-primary rounded-lg px-3 py-2"
                    >
                      <span className="text-sm font-medium text-primary">
                        {category
                          ?.split("-")
                          ?.map(
                            (word) =>
                              word.charAt(0).toUpperCase() + word.slice(1),
                          )
                          ?.join(" ")}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          setSelectedCategories(
                            selectedCategories.filter((c) => c !== category),
                          )
                        }
                        className="text-primary hover:text-primary/80 font-bold"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Category selector with search */}
              <div className="relative">
                <Select open={isSelectOpen} onOpenChange={setIsSelectOpen}>
                  <SelectTrigger className="w-full">
                    <SelectValue
                      placeholder={
                        selectedCategories.length > 0
                          ? `${selectedCategories.length} category/categories selected`
                          : "Select a business category"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent className="max-h-64 p-0">
                    {/* Search Input */}
                    <div className="sticky top-0 p-2 border-b bg-background z-10">
                      <div className="relative">
                        <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <input
                          ref={categoryInputRef}
                          type="text"
                          placeholder="Search categories..."
                          value={categorySearch}
                          onChange={(e) => {
                            setCategorySearch(e.target.value);
                            setKeyboardNavIndex(-1);
                          }}
                          onKeyDown={handleCategoryKeyDown}
                          autoFocus
                          className="w-full pl-8 pr-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:border-primary bg-background"
                        />
                      </div>
                    </div>

                    {/* Category Options */}
                    <div className="max-h-56 overflow-y-auto">
                      {filteredCategories.length > 0 ? (
                        filteredCategories.map((category, index) => (
                          <button
                            key={category}
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              if (selectedCategories.includes(category)) {
                                setSelectedCategories(
                                  selectedCategories.filter(
                                    (c) => c !== category,
                                  ),
                                );
                              } else if (selectedCategories.length < 2) {
                                setSelectedCategories([
                                  ...selectedCategories,
                                  category,
                                ]);
                                setCategorySearch("");
                              } else {
                                toast(
                                  "You can select a maximum of 2 categories",
                                );
                              }
                            }}
                            className={cn(
                              "w-full text-left px-3 py-2 transition-colors flex items-center gap-2 border-l-4",
                              selectedCategories.includes(category)
                                ? "bg-primary/10 text-primary font-medium border-l-primary"
                                : keyboardNavIndex === index
                                  ? "bg-muted text-foreground border-l-muted-foreground"
                                  : "hover:bg-muted text-foreground border-l-transparent",
                            )}
                          >
                            <div
                              className={cn(
                                "w-4 h-4 rounded border-2 flex items-center justify-center transition-all",
                                selectedCategories.includes(category)
                                  ? "border-primary bg-primary"
                                  : "border-border",
                              )}
                            >
                              {selectedCategories.includes(category) && (
                                <Check className="h-3 w-3 text-primary-foreground" />
                              )}
                            </div>
                            <span className="flex-1">
                              {category
                                ?.split("-")
                                ?.map(
                                  (word) =>
                                    word.charAt(0).toUpperCase() +
                                    word.slice(1),
                                )
                                ?.join(" ")}
                            </span>
                            {keyboardNavIndex === index && (
                              <span className="text-xs text-muted-foreground">
                                ↵
                              </span>
                            )}
                          </button>
                        ))
                      ) : (
                        <div className="px-3 py-4 text-center text-sm text-muted-foreground">
                          No categories found
                        </div>
                      )}
                    </div>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-card rounded-2xl p-6 border border-border">
          <TemplateSelector
            selectedTemplate={selectedTemplate}
            customImage={customImage}
            onTemplateSelect={handleTemplateSelect}
            onImageUpload={handleImageUpload}
          />
        </section>

        {/* Text Customizer */}
        <section className="bg-card rounded-2xl p-6 border border-border">
          <TextCustomizer
            selectedTemplate={selectedTemplate}
            customImage={customImage}
            promotionText={promotionText}
            backgroundColor={
              backgroundColor !== null ? String(backgroundColor) : ""
            }
            onTextChange={handleTextChange}
            onImageUpload={handleImageUpload}
            onBackgroundColorChange={handleBackgroundColorChange}
            promotionDescription={promotionDescription}
            onPromotionDescriptionChange={setPromotionDescription}
            websiteUrl={websiteUrl}
            onWebsiteUrlChange={setWebsiteUrl}
          />
        </section>

        {/* Location */}
        <section className="bg-card rounded-2xl p-6 border border-border">
          <AdminLocationTargeter
            selectedCities={selectedCities}
            selectedStates={selectedStates}
            onAddCity={handleAddCity}
            onRemoveCity={handleRemoveCity}
            onAddState={handleAddState}
            onRemoveState={handleRemoveState}
          />
        </section>

        <section className="bg-card rounded-2xl p-6 border border-border">
          <AdminSchedule
            runDate={runDate}
            stopDate={stopDate}
            runTime={runTime}
            stopTime={stopTime}
            onRunDateChange={handleRunDateChange}
            onStopDateChange={setStopDate}
            onRunTimeChange={setRunTime}
            onStopTimeChange={setStopTime}
            isLoading={loading}
          />
        </section>

        <section className="bg-card rounded-2xl p-6 border border-border">
          <div className="pt-4 flex justify-end">
            <Button
              onClick={() => router.back()}
              variant="outline"
              className="mr-2"
            >
              Cancel
            </Button>
            <Button onClick={handleRunPromotion} disabled={loading}>
              {loading
                ? isEdit
                  ? "Editing..."
                  : "Creating..."
                : isEdit
                  ? "Update Promotion"
                  : "Create Promotion"}
            </Button>
          </div>
        </section>
      </div>
    </PermissionGuard>
  );
};

export default AdminCreatePromotion;

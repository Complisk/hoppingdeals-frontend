"use client";

import React, { useState, useRef, useEffect, useCallback, memo } from "react";
import { Check, Upload } from "lucide-react";
import { useTemplateService } from "@/services/templateService";
import { uploadPromotionImage } from "@/utils/promotionImageUpload";
import { uploadImageToCloudinary } from "@/utils/cloudinaryUtils";
import { cn } from "@/lib/utils";
import OptimizeImage from "../shared/OptimizeImage";
import Spinner from "@/components/shared/Spinner";
import HelpTooltipTrigger from "@/components/shared/HelpTooltipTrigger";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip";

const buildSolidColorDataUrl = (color: string) => {
  const encodedHex = String(color || "")
    .trim()
    .replace(/^#/, "%23");
  return `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1 1'><rect width='1' height='1' fill='${encodedHex}'/></svg>`;
};

const PRESET_COLOR_TEMPLATES = [
  {
    id: "preset-solid-green",
    name: "Solid Green",
    colors: ["#1ce96a"] as [string],
    imageUrl: buildSolidColorDataUrl("#1ce96a"),
  },
  {
    id: "preset-solid-blue",
    name: "Solid Blue",
    colors: ["#1f9bf9"] as [string],
    imageUrl: buildSolidColorDataUrl("#1f9bf9"),
  },
];

const UploadTemplateTooltip = () => {
  const [open, setOpen] = useState(false);

  const handleTriggerClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation();
      e.preventDefault();
      setOpen((prev) => !prev);
    },
    [],
  );

  return (
    <TooltipProvider delayDuration={0} skipDelayDuration={0}>
      <Tooltip
        open={open}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) setOpen(false);
        }}
      >
        <HelpTooltipTrigger
          ariaLabel="Template upload help"
          onClick={handleTriggerClick}
        />
        <TooltipContent
          side="bottom"
          align="start"
          sideOffset={10}
          onEscapeKeyDown={() => setOpen(false)}
          className="w-[calc(100vw-2rem)] max-w-xl p-4 text-left text-xs sm:text-base font-normal leading-relaxed bg-[rgb(2_4_10/0.90)] text-white border-white/20 backdrop-blur-[1px] animate-none data-[state=closed]:animate-none"
        >
          <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4">
            <img
              src="/new-assets/template-tooltip-image.png"
              loading="lazy"
              decoding="async"
              alt="Template tooltip preview"
              className="w-full sm:w-60 shrink-0 rounded object-cover"
            />
            <span>
              Choose a template and customize your banner by adding numerous
              text lines individually and adjusting color variations.
            </span>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

// ---- MEMOIZED TEMPLATE ITEM ----
interface TemplateItemProps {
  id: string;
  cloudinaryPublicId?: string;
  colors?: string[];
  isSelected: boolean;
  onSelectId: (id: string) => void;
  dark?: boolean;
}

const TemplateItem = memo(
  ({
    id,
    cloudinaryPublicId,
    colors,
    isSelected,
    onSelectId,
    dark = false,
  }: TemplateItemProps) => {
    const handleClick = useCallback(() => {
      onSelectId(id);
    }, [id, onSelectId]);

    return (
      <button
        onClick={handleClick}
        className={cn(
          "relative aspect-[4/3] overflow-hidden rounded-lg border transition-all",
          dark
            ? "border-white/10 hover:border-white/30"
            : "border-border hover:border-primary/50",
          isSelected
            ? dark
              ? "ring-2 ring-[#E31E24] ring-offset-2 ring-offset-[#0B1220]"
              : "ring-4 ring-primary ring-offset-2"
            : dark
              ? "hover:ring-2 hover:ring-[#E31E24]/50"
              : "hover:ring-2 hover:ring-primary/50",
        )}
      >
        {cloudinaryPublicId ? (
          <OptimizeImage publicId={cloudinaryPublicId} className=" " />
        ) : (
          <div
            className="w-full h-full"
            style={{
              backgroundColor: colors?.[0],
            }}
          />
        )}
        {isSelected && (
          <div className="absolute top-1 right-1 w-6 h-6 rounded-full bg-[#E31E24] flex items-center justify-center shadow-[0_2px_10px_rgb(227_30_36/0.6)]">
            <Check className="h-4 w-4 text-white" />
          </div>
        )}
      </button>
    );
  },
  (prev, next) => prev.isSelected === next.isSelected && prev.dark === next.dark,
);

// ---- TEMPLATE SELECTOR ----
interface Template {
  id: string;
  name: string;
  imageUrl: string;
  cloudinaryPublicId?: string;
}

export interface TemplateSelection {
  id: string;
  imageUrl: string;
  templateId?: string | null;
  colors?: string[];
}

interface TemplateSelectorProps {
  selectedTemplate: string | null;
  customImage: string | null;
  onTemplateSelect: (template: TemplateSelection) => void;
  onImageUpload: (imageData: any) => void;
  usePromotionUpload?: boolean;
  theme?: "light" | "dark";
}

export const TemplateSelector = memo(
  ({
    selectedTemplate,
    customImage,
    onTemplateSelect,
    onImageUpload,
    usePromotionUpload = false,
    theme = "light",
  }: TemplateSelectorProps) => {
    const dark = theme === "dark";
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { getTemplates } = useTemplateService();

    const [uploadedTemplates, setUploadedTemplates] = useState<Template[]>([]);
    const [loadingTemplates, setLoadingTemplates] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);

    // fetch templates once
    useEffect(() => {
      let canceled = false;
      const fetch = async () => {
        setLoadingTemplates(true);
        try {
          const res = await getTemplates();
          setUploadedTemplates(Array.isArray(res) ? res : []);
        } catch (err) {
          console.error(err);
        } finally {
          if (!canceled) setLoadingTemplates(false);
        }
      };
      fetch();
      return () => {
        canceled = true;
      };
    }, []);

    // isolate upload state
    const handleUpload = useCallback(
      async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploadingImage(true);
        try {
          const image = usePromotionUpload
            ? await uploadPromotionImage(file)
            : await uploadImageToCloudinary(file);
          onImageUpload(usePromotionUpload ? image : image.url);
        } catch (error: any) {
          console.error("Promotion image upload failed", error);
          window.alert(error?.message || "Image upload failed. Please try again.");
        } finally {
          setUploadingImage(false);
          if (fileInputRef.current) fileInputRef.current.value = "";
        }
      },
      [onImageUpload, usePromotionUpload],
    );

    // stable callback for selecting template
    const handleSelectId = useCallback(
      (id: string) => {
        const found = uploadedTemplates.find((t) => t.id === id);
        if (found) {
          onTemplateSelect({
            id: found.id,
            imageUrl: found.imageUrl,
            templateId: found.id,
          });
          return;
        }

        const preset = PRESET_COLOR_TEMPLATES.find(
          (template) => template.id === id,
        );
        if (preset) {
          onTemplateSelect({
            id: preset.id,
            imageUrl: preset.imageUrl,
            templateId: null,
            colors: [...preset.colors],
          });
        }
      },
      [uploadedTemplates, onTemplateSelect],
    );

    return (
      <div className="space-y-6">
        {/* UPLOAD AREA */}
        <input
          type="file"
          ref={fileInputRef}
          accept="image/jpeg,image/png,image/webp"
          onChange={handleUpload}
          className="hidden"
        />
        <div className="flex items-center">
          <div
            className={cn(
              "p-4 border-2 border-dashed cursor-pointer transition-all",
              dark
                ? cn(
                    "border-white/20 bg-white/[0.03] text-white hover:border-[#E31E24]/60",
                    customImage && "border-[#E31E24]/60",
                  )
                : cn(
                    "border-primary text-primary hover:border-primary/50",
                    customImage && "border-primary",
                  ),
              uploadingImage && "opacity-50 cursor-not-allowed",
            )}
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="flex items-center gap-4">
              {uploadingImage ? (
                <Spinner
                  className={cn(
                    "h-6 w-6 animate-spin",
                    dark ? "text-[#FF6B6F]" : "text-primary",
                  )}
                />
              ) : customImage ? (
                <>
                  <img
                    src={customImage}
                    loading="lazy"
                    decoding="async"
                    alt="Custom"
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                  <Upload className="h-6 w-6" />
                  <span className="font-medium">
                    Upload your custom template image
                  </span>
                </>
              ) : (
                <>
                  <Upload className="h-6 w-6" />
                  <span className="font-medium">
                    Upload your custom template image
                  </span>
                </>
              )}
            </div>
          </div>
          <p
            className={cn(
              "ml-3 text-xs",
              dark ? "text-muted-foreground/80" : "text-muted-foreground",
            )}
          >
            JPEG, PNG, or WebP · max 10 MB · minimum 900 px on the shortest side
          </p>
          <UploadTemplateTooltip />
        </div>

        {/* TEMPLATES GRID */}
        {loadingTemplates ? (
          <TemplateBoxSkeleton dark={dark} />
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
            {PRESET_COLOR_TEMPLATES.map((template) => (
              <TemplateItem
                key={template.id}
                id={template.id}
                colors={template.colors}
                isSelected={selectedTemplate === template.id}
                onSelectId={handleSelectId}
                dark={dark}
              />
            ))}
            {uploadedTemplates.map((template) => (
              <TemplateItem
                key={template.id}
                id={template.id}
                cloudinaryPublicId={template.cloudinaryPublicId}
                isSelected={selectedTemplate === template.id}
                onSelectId={handleSelectId}
                dark={dark}
              />
            ))}
          </div>
        )}
      </div>
    );
  },
);

// ---- MEMOIZED SKELETON ----
const TemplateBoxSkeletonComponent = ({
  count = 12,
  dark = false,
}: {
  count?: number;
  dark?: boolean;
}) => (
  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
    {[...Array(count)].map((_, i) => (
      <div
        key={i}
        className={cn(
          "aspect-[4/3] rounded-xl animate-pulse",
          dark ? "bg-white/[0.06]" : "bg-muted",
        )}
      />
    ))}
  </div>
);

export const TemplateBoxSkeleton = memo(TemplateBoxSkeletonComponent);
TemplateBoxSkeleton.displayName = "TemplateBoxSkeleton";

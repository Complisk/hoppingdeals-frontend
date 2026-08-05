"use client";

import React, { useState, useRef, useEffect, useCallback, memo } from "react";
import { Check, Upload } from "lucide-react";
import { useTemplateService } from "@/services/templateService";
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
          className="w-[calc(100vw-2rem)] max-w-xl p-4 text-left text-xs sm:text-base font-normal leading-relaxed bg-black/90 text-white border-white/20 backdrop-blur-[1px] animate-none data-[state=closed]:animate-none"
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
}

const TemplateItem = memo(
  ({
    id,
    cloudinaryPublicId,
    colors,
    isSelected,
    onSelectId,
  }: TemplateItemProps) => {
    const handleClick = useCallback(() => {
      onSelectId(id);
    }, [id, onSelectId]);

    return (
      <button
        onClick={handleClick}
        className={cn(
          "relative aspect-[4/3] overflow-hidden border border-border",
          isSelected
            ? "ring-4 ring-primary ring-offset-2"
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
          <div className="absolute top-1 right-1 w-6 h-6 rounded-full bg-primary flex items-center justify-center">
            <Check className="h-4 w-4 text-primary-foreground" />
          </div>
        )}
      </button>
    );
  },
  (prev, next) => prev.isSelected === next.isSelected,
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
  onImageUpload: (imageData: string) => void;
}

export const TemplateSelector = memo(
  ({
    selectedTemplate,
    customImage,
    onTemplateSelect,
    onImageUpload,
  }: TemplateSelectorProps) => {
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
          const imageUrl = await uploadImageToCloudinary(file);
          if (imageUrl) onImageUpload(imageUrl?.url);
        } finally {
          setUploadingImage(false);
          if (fileInputRef.current) fileInputRef.current.value = "";
        }
      },
      [onImageUpload],
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
          accept="image/*"
          onChange={handleUpload}
          className="hidden"
        />
        <div className=" flex items-center ">
          <div
            className={cn(
              "p-4 border-2  border-dashed cursor-pointer text-primary transition-all",
              customImage
                ? "border-primary "
                : "border-primary  hover:border-primary/50",
              uploadingImage && "opacity-50 cursor-not-allowed",
            )}
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="flex items-center gap-4">
              {uploadingImage ? (
                <Spinner className="h-6 w-6 text-primary animate-spin" />
              ) : customImage ? (
                <>
                  <img
                    src={customImage}
                    loading="lazy"
                    decoding="async"
                    alt="Custom"
                    className="w-16 h-16 object-cover"
                  />
                  <Upload className="h-6 w-6 " />
                  <span className="">Upload your custom template image</span>
                </>
              ) : (
                <>
                  <Upload className="h-6 w-6 " />
                  <span className="">Upload your custom template image</span>
                </>
              )}
            </div>
          </div>
          <UploadTemplateTooltip />
        </div>

        {/* TEMPLATES GRID */}
        {loadingTemplates ? (
          <TemplateBoxSkeleton />
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
            {PRESET_COLOR_TEMPLATES.map((template) => (
              <TemplateItem
                key={template.id}
                id={template.id}
                colors={template.colors}
                isSelected={selectedTemplate === template.id}
                onSelectId={handleSelectId}
              />
            ))}
            {uploadedTemplates.map((template) => (
              <TemplateItem
                key={template.id}
                id={template.id}
                cloudinaryPublicId={template.cloudinaryPublicId}
                isSelected={selectedTemplate === template.id}
                onSelectId={handleSelectId}
              />
            ))}
          </div>
        )}
      </div>
    );
  },
);

// ---- MEMOIZED SKELETON ----
const TemplateBoxSkeletonComponent = ({ count = 12 }) => (
  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
    {[...Array(count)].map((_, i) => (
      <div key={i} className="aspect-[4/3] bg-muted rounded-xl animate-pulse" />
    ))}
  </div>
);

export const TemplateBoxSkeleton = memo(TemplateBoxSkeletonComponent);
TemplateBoxSkeleton.displayName = "TemplateBoxSkeleton";

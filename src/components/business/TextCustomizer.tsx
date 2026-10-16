"use client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ArrowDown,
  Plus,
  Trash2,
  Crop,
  Image as ImageIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { PromotionVisualCard } from "../shared/PromotionVisualCard";
import { useEffect, useState } from "react";
import { Textarea } from "../ui/textarea";
import Cropper from "react-easy-crop";
import type { Area } from "react-easy-crop";
import {
  uploadPromotionImage,
  type PromotionImageAsset,
} from "@/utils/promotionImageUpload";
import { uploadImageToCloudinary } from "@/utils/cloudinaryUtils";
import { useIsMobile } from "@/hooks/use-mobile";
import Spinner from "@/components/shared/Spinner";
import { normalizeWebsiteUrl } from "@/utils/websiteUrl";

interface TextItem {
  id: string;
  content: string;
  color: string;
  fontSize: string;
  x: number;
  y: number;
}

interface TextCustomizerProps {
  selectedTemplate: string | null;
  customImage: string | null;
  promotionText: string | TextItem[];
  backgroundColor: string | number | null;
  onTextChange: (text: string | TextItem[]) => void;
  onBackgroundColorChange: (color: string | number) => void;
  onImageUpload?: (imageData: any) => void;
  usePromotionUpload?: boolean;
  promotionDescription?: string;
  onPromotionDescriptionChange?: (val: string) => void;
  websiteUrl?: string;
  onWebsiteUrlChange?: (val: string) => void;
  theme?: "light" | "dark";
}

export const TextCustomizer = ({
  customImage,
  promotionText,
  backgroundColor,
  onTextChange,
  onBackgroundColorChange,
  onImageUpload,
  usePromotionUpload = false,
  promotionDescription,
  onPromotionDescriptionChange,
  websiteUrl,
  onWebsiteUrlChange,
  theme = "light",
}: TextCustomizerProps) => {
  const dark = theme === "dark";
  const isMobile = useIsMobile();
  const canEditWebsiteUrl = typeof onWebsiteUrlChange === "function";
  const [textItems, setTextItems] = useState<TextItem[]>(
    Array.isArray(promotionText) ? promotionText : [],
  );
  const [selectedTextIndex, setSelectedTextIndex] = useState(0);
  const [previewImage, setPreviewImage] = useState<string | null>(customImage);
  const [originalCropSource, setOriginalCropSource] = useState<string | null>(
    customImage,
  );
  const [lastCroppedUrl, setLastCroppedUrl] = useState<string | null>(null);
  const [isCropOpen, setIsCropOpen] = useState(false);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [isApplyingCrop, setIsApplyingCrop] = useState(false);
  const [sourceAspect, setSourceAspect] = useState(4 / 3);
  const [cropMode, setCropMode] = useState<"original" | "4:3">("original");

  useEffect(() => {
    if (Array.isArray(promotionText)) {
      setTextItems(promotionText);
      if (
        promotionText.length > 0 &&
        selectedTextIndex >= promotionText.length
      ) {
        setSelectedTextIndex(Math.max(0, promotionText.length - 1));
      }
    }
  }, [promotionText, selectedTextIndex]);

  useEffect(() => {
    if (customImage) {
      setPreviewImage(customImage);
      if (customImage !== lastCroppedUrl) {
        setOriginalCropSource(customImage);
        setLastCroppedUrl(null);
      }
    } else {
      setPreviewImage(null);
      setOriginalCropSource(null);
      setLastCroppedUrl(null);
    }
  }, [customImage, lastCroppedUrl]);

  useEffect(() => {
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setRotation(0);
    setCroppedAreaPixels(null);
    setIsCropOpen(false);
  }, [customImage]);

  const handleAddText = () => {
    const newTextItem: TextItem = {
      id: Date.now().toString(),
      content: "",
      color: "#ffffff",
      fontSize: "24",
      x: 50,
      y: 50 + ((textItems.length * 10) % 40),
    };
    const newItems = [...textItems, newTextItem];
    setTextItems(newItems);
    setSelectedTextIndex(newItems.length - 1);
    onTextChange(newItems);
  };

  const handleDeleteText = (index: number) => {
    const newItems = textItems.filter((_, i) => i !== index);
    setTextItems(newItems);
    setSelectedTextIndex(Math.max(0, index - 1));
    onTextChange(newItems);
  };

  const handleUpdateText = (index: number, updates: Partial<TextItem>) => {
    const newItems = textItems.map((item, i) =>
      i === index ? { ...item, ...updates } : item,
    );
    setTextItems(newItems);
    onTextChange(newItems);
  };

  const handleMoveText = (direction: "left" | "right" | "up" | "down") => {
    if (textItems.length === 0) return;

    const currentItem = textItems[selectedTextIndex];
    const step = 5;

    const newX =
      direction === "left"
        ? Math.max(0, currentItem.x - step)
        : direction === "right"
          ? Math.min(100, currentItem.x + step)
          : currentItem.x;

    const newY =
      direction === "up"
        ? Math.max(0, currentItem.y - step)
        : direction === "down"
          ? Math.min(100, currentItem.y + step)
          : currentItem.y;

    handleUpdateText(selectedTextIndex, { x: newX, y: newY });
  };

  const currentText =
    textItems.length > 0 ? textItems[selectedTextIndex] : null;
  const activeImage = previewImage;
  const cropSourceImage = originalCropSource || previewImage;

  const handleStartCrop = async () => {
    if (!cropSourceImage) return;
    try {
      const source = await createImage(cropSourceImage);
      setSourceAspect(source.naturalWidth / source.naturalHeight);
    } catch {
      setSourceAspect(4 / 3);
    }
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setRotation(0);
    setCroppedAreaPixels(null);
    setIsCropOpen(true);
  };

  const createImage = (url: string) =>
    new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => resolve(img);
      img.onerror = (error) => reject(error);
      img.src = url;
    });

  const getRadianAngle = (degreeValue: number) => (degreeValue * Math.PI) / 180;

  const rotateSize = (
    width: number,
    height: number,
    rotationDeg: number,
  ): { width: number; height: number } => {
    const rotRad = getRadianAngle(rotationDeg);
    return {
      width:
        Math.abs(Math.cos(rotRad) * width) +
        Math.abs(Math.sin(rotRad) * height),
      height:
        Math.abs(Math.sin(rotRad) * width) +
        Math.abs(Math.cos(rotRad) * height),
    };
  };

  const getCroppedFile = async (
    imageSrc: string,
    pixelCrop: Area,
    rotationDeg: number,
  ): Promise<File> => {
    const image = await createImage(imageSrc);
    const rotRad = getRadianAngle(rotationDeg);
    const { width: bBoxWidth, height: bBoxHeight } = rotateSize(
      image.width,
      image.height,
      rotationDeg,
    );

    const canvas = document.createElement("canvas");
    canvas.width = Math.floor(bBoxWidth);
    canvas.height = Math.floor(bBoxHeight);
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      throw new Error("Unable to create crop context");
    }

    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate(rotRad);
    ctx.translate(-image.width / 2, -image.height / 2);
    ctx.drawImage(image, 0, 0);

    const croppedCanvas = document.createElement("canvas");
    croppedCanvas.width = Math.max(1, Math.floor(pixelCrop.width));
    croppedCanvas.height = Math.max(1, Math.floor(pixelCrop.height));
    const croppedCtx = croppedCanvas.getContext("2d");

    if (!croppedCtx) {
      throw new Error("Unable to create cropped canvas context");
    }

    const data = ctx.getImageData(
      Math.floor(pixelCrop.x),
      Math.floor(pixelCrop.y),
      Math.floor(pixelCrop.width),
      Math.floor(pixelCrop.height),
    );

    croppedCtx.putImageData(data, 0, 0);

    const blob = await new Promise<Blob | null>((resolve) =>
      croppedCanvas.toBlob(resolve, "image/jpeg", 0.95),
    );

    if (!blob) {
      throw new Error("Failed to generate cropped image");
    }

    return new File([blob], `promotion-crop-${Date.now()}.jpg`, {
      type: "image/jpeg",
    });
  };

  const handleCancelCrop = () => {
    setIsCropOpen(false);
  };

  const handleApplyCrop = async () => {
    if (!cropSourceImage || !croppedAreaPixels || isApplyingCrop) {
      return;
    }

    try {
      setIsApplyingCrop(true);
      const croppedFile = await getCroppedFile(
        cropSourceImage,
        croppedAreaPixels,
        rotation,
      );
      const image = usePromotionUpload
        ? await uploadPromotionImage(croppedFile)
        : await uploadImageToCloudinary(croppedFile);
      const imageUrl = usePromotionUpload
        ? (image as PromotionImageAsset).url
        : image.url;
      setPreviewImage(imageUrl);
      setLastCroppedUrl(imageUrl);
      onImageUpload?.(usePromotionUpload ? image : imageUrl);
      setIsCropOpen(false);
    } catch (error) {
      console.error("Crop/apply failed:", error);
    } finally {
      setIsApplyingCrop(false);
    }
  };

  const handleWebsiteBlur = () => {
    if (!canEditWebsiteUrl) return;
    const normalized = normalizeWebsiteUrl(websiteUrl);
    if (normalized && normalized !== (websiteUrl || "")) {
      onWebsiteUrlChange(normalized);
    }
  };

  const renderPreviewPanel = (stickyOnMobile = false) => (
    <div
      className={cn(
        "space-y-2",
        isMobile &&
          stickyOnMobile &&
          !isCropOpen &&
          cn(
            "sticky top-20 z-20 rounded-xl border p-3 shadow-lg backdrop-blur",
            dark
              ? "border-white/10 bg-[#0A1120]/95 supports-[backdrop-filter]:bg-[#0A1120]/80"
              : "border-border bg-background/95 shadow-sm supports-[backdrop-filter]:bg-background/80",
          ),
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <Label className={dark ? "text-white" : undefined}>Live Preview</Label>
        <Button
          type="button"
          size="sm"
          variant="outline"
          className={cn(
            "gap-1 shrink-0",
            dark &&
              "border-white/15 bg-transparent text-white hover:bg-card/10 hover:text-white",
          )}
          onClick={handleStartCrop}
          disabled={!activeImage}
        >
          <Crop className="h-4 w-4" />
          Crop Image
        </Button>
      </div>
      <PromotionVisualCard
        imageUrl={activeImage}
        backgroundColor={backgroundColor}
        text={textItems}
        className={cn(
          "w-full aspect-[4/3] rounded-lg overflow-hidden",
          dark
            ? "border border-white/10 bg-[#0A1120] shadow-[0_0_44px_rgb(0_0_0/0.45)]"
            : "bg-muted",
        )}
      >
        {!activeImage && (
          <div className="absolute inset-0 z-40 flex flex-col items-center justify-center gap-3 p-6 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05] shadow-inner">
              <ImageIcon className="h-6 w-6 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm font-semibold text-muted-foreground/60">
                Your promotion preview appears here
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Select a template or upload an image to get started
              </p>
            </div>
          </div>
        )}
      </PromotionVisualCard>
    </div>
  );

  const renderCropPanel = () =>
    isCropOpen && cropSourceImage ? (
      <div
        className={cn(
          "rounded-lg border p-3 space-y-3",
          dark ? "border-white/10 bg-[#0A1120]/60" : "border-border",
        )}
      >
        <div className="relative w-full aspect-[4/3] rounded-md overflow-hidden bg-black">
          <Cropper
            image={cropSourceImage}
            crop={crop}
            zoom={zoom}
            rotation={rotation}
            aspect={cropMode === "4:3" ? 4 / 3 : sourceAspect}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onRotationChange={setRotation}
            onCropComplete={(_, areaPixels) => setCroppedAreaPixels(areaPixels)}
          />
        </div>
        <div className="flex items-center gap-2">
          <Label className={cn("text-xs", dark && "text-white")}>
            Crop ratio
          </Label>
          <select
            value={cropMode}
            onChange={(event) => setCropMode(event.target.value as "original" | "4:3")}
            className={cn(
              "rounded-md border px-2 py-1 text-xs",
              dark
                ? "border-white/15 bg-[#0A1120] text-white"
                : "border-input bg-background",
            )}
          >
            <option value="original">Keep original ratio</option>
            <option value="4:3">4:3 card crop</option>
          </select>
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Zoom</Label>
          <input
            type="range"
            min={1}
            max={3}
            step={0.05}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="w-full accent-primary"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Rotation: {rotation} deg</Label>
          <input
            type="range"
            min={-180}
            max={180}
            step={1}
            value={rotation}
            onChange={(e) => setRotation(Number(e.target.value))}
            className="w-full accent-primary"
          />
        </div>
        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancelCrop}
            disabled={isApplyingCrop}
            className={
              dark
                ? "border-white/15 bg-transparent text-white hover:bg-card/10 hover:text-white"
                : undefined
            }
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleApplyCrop}
            disabled={!croppedAreaPixels || isApplyingCrop}
            className={dark ? "bg-[#E31E24] hover:bg-[#b91621] text-white" : undefined}
          >
            {isApplyingCrop && (
              <Spinner className="h-4 w-4 mr-2 animate-spin" />
            )}
            Apply
          </Button>
        </div>
      </div>
    ) : null;

  const renderDescriptionPanel = () => (
    <div className="space-y-4">
      <div>
        <Label className={dark ? "text-white" : undefined}>
          Promotion Description Text
        </Label>
        <Textarea
          maxLength={650}
          rows={7}
          value={promotionDescription || ""}
          onChange={(e) => onPromotionDescriptionChange?.(e.target.value)}
          placeholder="Short description for the promotion"
          className={cn(
            "w-full p-2 rounded-lg resize-y text-sm whitespace-pre-wrap",
            dark
              ? "border border-white/10 bg-[#0A1120] text-white placeholder:text-muted-foreground focus-visible:ring-[#E31E24]"
              : "border border-border",
          )}
        />
        <div
          className={cn(
            "w-full text-end mt-2 text-xs pointer-events-none",
            dark ? "text-muted-foreground/80" : "text-muted-foreground",
          )}
        >
          {(promotionDescription || "").length}/650
        </div>
      </div>

      {canEditWebsiteUrl && (
        <div>
          <Label className={dark ? "text-white" : undefined}>
            Company Website{" "}
          </Label>
          <Input
            type="text"
            value={websiteUrl || ""}
            onChange={(e) => {
              if (canEditWebsiteUrl) {
                onWebsiteUrlChange(e.target.value);
              }
            }}
            onBlur={handleWebsiteBlur}
            placeholder="https://your-business-website.com"
            className={cn(
              "w-full",
              dark &&
                "border-white/10 bg-[#0A1120] text-white placeholder:text-muted-foreground focus-visible:ring-[#E31E24]",
            )}
          />
        </div>
      )}
    </div>
  );

  const renderControlsPanel = () => (
    <>
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <Label className={dark ? "text-white" : undefined}>
            Text Elements ({textItems.length})
          </Label>
          <Button
            size="sm"
            variant="outline"
            onClick={handleAddText}
            className={cn(
              "gap-1",
              dark &&
                "border-white/15 bg-transparent text-white hover:bg-card/10 hover:text-white",
            )}
          >
            <Plus className="h-4 w-4" />
            Add Text
          </Button>
        </div>

        <div
          className={cn(
            "rounded-lg p-3 space-y-2 max-h-48 overflow-y-auto",
            dark ? "border border-white/10 bg-[#0A1120]/50" : "border border-border",
          )}
        >
          {textItems.length === 0 ? (
            <p
              className={cn(
                "text-sm text-center py-4",
                dark ? "text-muted-foreground/80" : "text-muted-foreground",
              )}
            >
              No text elements yet. Click "Add Text" to create one.
            </p>
          ) : (
            textItems.map((item, index) => (
              <div
                key={item.id}
                className={cn(
                  "p-2 rounded-lg border-2 cursor-pointer transition-all",
                  selectedTextIndex === index
                    ? dark
                      ? "border-[#E31E24] bg-[#E31E24]/10"
                      : "border-primary bg-primary/5"
                    : dark
                      ? "border-white/10 hover:border-[#E31E24]/50"
                      : "border-border hover:border-primary/50",
                )}
                onClick={() => setSelectedTextIndex(index)}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate text-white">
                      {item.content || "Empty text"}
                    </p>
                    <p
                      className={cn(
                        "text-xs",
                        dark ? "text-muted-foreground/80" : "text-muted-foreground",
                      )}
                    >
                      Position: ({item.x}, {item.y}) • Size: {item.fontSize}px
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteText(index);
                    }}
                    className={cn(
                      "text-destructive hover:bg-destructive/10",
                      dark && "text-[#FF6B6F]",
                    )}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {currentText && (
        <>
          <div className="space-y-2">
            <Label className={dark ? "text-white" : undefined}>
              Text Content
            </Label>
            <Textarea
              value={currentText.content}
              onChange={(e) =>
                handleUpdateText(selectedTextIndex, {
                  content: e.target.value,
                })
              }
              placeholder="Enter text"
              className={cn(
                "w-full p-2 rounded-lg resize-none text-lg",
                dark
                  ? "border border-white/10 bg-[#0A1120] text-white placeholder:text-muted-foreground focus-visible:ring-[#E31E24]"
                  : "border border-border",
              )}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label className={dark ? "text-white" : undefined}>
              Position (Use Arrows)
            </Label>
            <div className="flex items-center justify-center gap-2">
              <div className="grid grid-cols-3 gap-1">
                <div />
                <Button
                  variant="outline"
                  size="sm"
                  className={cn(
                    dark &&
                      "border-white/15 bg-transparent text-white hover:bg-card/10 hover:text-white",
                  )}
                  onClick={() => handleMoveText("up")}
                >
                  <ArrowUp className="h-4 w-4" />
                </Button>
                <div />
                <Button
                  variant="outline"
                  size="sm"
                  className={cn(
                    dark &&
                      "border-white/15 bg-transparent text-white hover:bg-card/10 hover:text-white",
                  )}
                  onClick={() => handleMoveText("left")}
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <div
                  className={cn(
                    "w-9 h-9 rounded border flex items-center justify-center text-xs",
                    dark
                      ? "border-white/15 text-muted-foreground/60"
                      : "border-border text-muted-foreground",
                  )}
                >
                  {currentText.x},{currentText.y}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className={cn(
                    dark &&
                      "border-white/15 bg-transparent text-white hover:bg-card/10 hover:text-white",
                  )}
                  onClick={() => handleMoveText("right")}
                >
                  <ArrowRight className="h-4 w-4" />
                </Button>
                <div />
                <Button
                  variant="outline"
                  size="sm"
                  className={cn(
                    dark &&
                      "border-white/15 bg-transparent text-white hover:bg-card/10 hover:text-white",
                  )}
                  onClick={() => handleMoveText("down")}
                >
                  <ArrowDown className="h-4 w-4" />
                </Button>
                <div />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label className={dark ? "text-white" : undefined}>
              Font Size: {currentText.fontSize}px
            </Label>
            <input
              type="range"
              min="16"
              max="48"
              value={currentText.fontSize}
              onChange={(e) =>
                handleUpdateText(selectedTextIndex, {
                  fontSize: e.target.value,
                })
              }
              className="w-full accent-[#E31E24]"
            />
          </div>

          <div className="space-y-2">
            <Label className={dark ? "text-white" : undefined}>
              Text Color
            </Label>
            <div className="flex gap-2">
              <input
                type="color"
                value={currentText.color}
                onChange={(e) =>
                  handleUpdateText(selectedTextIndex, {
                    color: e.target.value,
                  })
                }
                className="w-12 h-10 rounded-lg border cursor-pointer p-0.5"
              />
              <Input
                value={currentText.color}
                onChange={(e) =>
                  handleUpdateText(selectedTextIndex, {
                    color: e.target.value,
                  })
                }
                className={cn(
                  "flex-1",
                  dark &&
                    "border-white/10 bg-[#0A1120] text-white placeholder:text-muted-foreground focus-visible:ring-[#E31E24]",
                )}
              />
            </div>
          </div>
        </>
      )}

      <div className="space-y-2">
        <Label className={dark ? "text-white" : undefined}>
          Image Opacity
        </Label>
        <select
          value={backgroundColor ?? 0}
          onChange={(e) => onBackgroundColorChange(Number(e.target.value))}
          className={cn(
            "w-full rounded-lg p-2",
            dark
              ? "border border-white/15 bg-[#0A1120] text-white"
              : "border border-border bg-background",
          )}
        >
          <option value={0}>0%</option>
          <option value={50}>50%</option>
          <option value={70}>70%</option>
        </select>
      </div>
    </>
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
          Step 2
        </span>
        <h3
          className={cn(
            "text-lg font-semibold",
            dark ? "text-white" : "text-foreground",
          )}
        >
          Customize Text
        </h3>
      </div>

      {isMobile ? (
        <div className="space-y-6">
          {renderPreviewPanel(true)}
          {renderCropPanel()}
          {renderDescriptionPanel()}
          <div className="space-y-6">{renderControlsPanel()}</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="w-full">
            <div className="w-full md:w-[85%] space-y-5">
              {renderPreviewPanel()}
              {renderCropPanel()}
              {renderDescriptionPanel()}
            </div>
          </div>

          <div className="space-y-6">{renderControlsPanel()}</div>
        </div>
      )}
    </div>
  );
};

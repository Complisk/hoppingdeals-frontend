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
} from "lucide-react";
import { cn } from "@/lib/utils";
import { PromotionVisualCard } from "../shared/PromotionVisualCard";
import { useEffect, useState } from "react";
import { Textarea } from "../ui/textarea";
import Cropper from "react-easy-crop";
import type { Area } from "react-easy-crop";
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
  onImageUpload?: (imageUrl: string) => void;
  promotionDescription?: string;
  onPromotionDescriptionChange?: (val: string) => void;
  websiteUrl?: string;
  onWebsiteUrlChange?: (val: string) => void;
}

export const TextCustomizer = ({
  customImage,
  promotionText,
  backgroundColor,
  onTextChange,
  onBackgroundColorChange,
  onImageUpload,
  promotionDescription,
  onPromotionDescriptionChange,
  websiteUrl,
  onWebsiteUrlChange,
}: TextCustomizerProps) => {
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

  const handleStartCrop = () => {
    if (!cropSourceImage) return;
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
      const uploadedUrl = await uploadImageToCloudinary(croppedFile);
      setPreviewImage(uploadedUrl?.url);
      setLastCroppedUrl(uploadedUrl?.url);
      onImageUpload?.(uploadedUrl?.url);
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
          "sticky top-20 z-20 rounded-xl border border-border bg-background/95 p-3 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-background/80",
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <Label>Live Preview</Label>
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="gap-1 shrink-0"
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
        className="w-full aspect-[4/3] rounded-lg"
      />
    </div>
  );

  const renderCropPanel = () =>
    isCropOpen && cropSourceImage ? (
      <div className="rounded-lg border border-border p-3 space-y-3">
        <div className="relative w-full aspect-[4/3] rounded-md overflow-hidden bg-black">
          <Cropper
            image={cropSourceImage}
            crop={crop}
            zoom={zoom}
            rotation={rotation}
            aspect={4 / 3}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onRotationChange={setRotation}
            onCropComplete={(_, areaPixels) => setCroppedAreaPixels(areaPixels)}
          />
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
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleApplyCrop}
            disabled={!croppedAreaPixels || isApplyingCrop}
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
        <Label>Promotion Description Text</Label>
        <Textarea
          maxLength={650}
          rows={7}
          value={promotionDescription || ""}
          onChange={(e) => onPromotionDescriptionChange?.(e.target.value)}
          placeholder="Short description for the promotion"
          className="w-full p-2 border border-border rounded-lg resize-y text-sm whitespace-pre-wrap"
        />
        <div className="w-full text-end mt-2 text-xs text-muted-foreground pointer-events-none">
          {(promotionDescription || "").length}/650
        </div>
      </div>

      {canEditWebsiteUrl && (
        <div>
          <Label>Company Website </Label>
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
            className="w-full"
          />
        </div>
      )}
    </div>
  );

  const renderControlsPanel = () => (
    <>
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <Label>Text Elements ({textItems.length})</Label>
          <Button
            size="sm"
            variant="outline"
            onClick={handleAddText}
            className="gap-1"
          >
            <Plus className="h-4 w-4" />
            Add Text
          </Button>
        </div>

        <div className="border border-border rounded-lg p-3 space-y-2 max-h-48 overflow-y-auto">
          {textItems.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No text elements yet. Click "Add Text" to create one.
            </p>
          ) : (
            textItems.map((item, index) => (
              <div
                key={item.id}
                className={cn(
                  "p-2 rounded-lg border-2 cursor-pointer transition-all",
                  selectedTextIndex === index
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50",
                )}
                onClick={() => setSelectedTextIndex(index)}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {item.content || "Empty text"}
                    </p>
                    <p className="text-xs text-muted-foreground">
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
                    className="text-destructive hover:bg-destructive/10"
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
            <Label>Text Content</Label>
            <Textarea
              value={currentText.content}
              onChange={(e) =>
                handleUpdateText(selectedTextIndex, {
                  content: e.target.value,
                })
              }
              placeholder="Enter text"
              className="w-full p-2 border border-border rounded-lg resize-none text-lg"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>Position (Use Arrows)</Label>
            <div className="flex items-center justify-center gap-2">
              <div className="grid grid-cols-3 gap-1">
                <div />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleMoveText("up")}
                >
                  <ArrowUp className="h-4 w-4" />
                </Button>
                <div />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleMoveText("left")}
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <div className="w-9 h-9 rounded border border-border flex items-center justify-center text-xs text-muted-foreground">
                  {currentText.x},{currentText.y}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleMoveText("right")}
                >
                  <ArrowRight className="h-4 w-4" />
                </Button>
                <div />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleMoveText("down")}
                >
                  <ArrowDown className="h-4 w-4" />
                </Button>
                <div />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Font Size: {currentText.fontSize}px</Label>
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
              className="w-full accent-primary"
            />
          </div>

          <div className="space-y-2">
            <Label>Text Color</Label>
            <div className="flex gap-2">
              <input
                type="color"
                value={currentText.color}
                onChange={(e) =>
                  handleUpdateText(selectedTextIndex, {
                    color: e.target.value,
                  })
                }
                className="w-12 h-10 rounded-lg border border-border cursor-pointer p-0.5"
              />
              <Input
                value={currentText.color}
                onChange={(e) =>
                  handleUpdateText(selectedTextIndex, {
                    color: e.target.value,
                  })
                }
                className="flex-1"
              />
            </div>
          </div>
        </>
      )}

      <div className="space-y-2">
        <Label>Image Opacity</Label>
        <select
          value={backgroundColor ?? 0}
          onChange={(e) => onBackgroundColorChange(Number(e.target.value))}
          className="w-full border border-border rounded-lg p-2 bg-background"
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
        <span className="text-sm font-medium text-muted-foreground bg-secondary px-3 py-1 rounded-full">
          Step 2
        </span>
        <h3 className="text-lg font-semibold text-foreground">
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

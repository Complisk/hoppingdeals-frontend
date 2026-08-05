"use client";
import React from "react";
import { cn } from "@/lib/utils";
import OptimizeImage from "./OptimizeImage";
import { extractCloudinaryPublicId } from "@/utils/extractCloudinaryPublicId";

interface TextItem {
  content: string;
  color: string;
  fontSize: string;
  x: number;
  y: number;
}

interface ImageTransform {
  focalX: number;
  focalY: number;
  zoom: number;
}

interface PromotionVisualCardProps {
  imageUrl?: string | null;
  backgroundColor?: string | number;
  text?: TextItem | TextItem[];
  showOverlay?: boolean;
  imageTransform?: ImageTransform;
  modal?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export const PromotionVisualCard = ({
  imageUrl,
  backgroundColor,
  text = [],
  showOverlay = true,
  imageTransform,
  className,
  modal = false,

  children,
}: PromotionVisualCardProps) => {
  const cloudinaryPublicId = imageUrl
    ? extractCloudinaryPublicId(imageUrl)
    : null;
  const textItems = Array.isArray(text) ? text : text ? [text] : [];
  const bgBrightness = Number(backgroundColor);

  return (
    <div
      className={cn("relative w-full overflow-hidden bg-muted  ", className)}
    >
      {/* Image Layer */}
      {imageUrl && (
        <div
          className="w-full h-full"
          style={{
            filter:
              bgBrightness === 50
                ? "brightness(50%)"
                : bgBrightness === 70
                  ? "brightness(30%)"
                  : bgBrightness === 100
                    ? "brightness(0%)"
                    : "brightness(100%)",
          }}
        >
          {cloudinaryPublicId ? (
            <OptimizeImage
              publicId={cloudinaryPublicId}
              className="w-full h-full "
            />
          ) : (
            <img
              src={imageUrl}
              alt="Promotion"
              loading="lazy"
              decoding="async"
              className="w-full h-full object-cover"
              style={{
                objectPosition: `${imageTransform?.focalX ?? 50}% ${imageTransform?.focalY ?? 50}%`,
                transform: `scale(${imageTransform?.zoom ?? 1})`,
                transformOrigin: "center center",
              }}
            />
          )}
        </div>
      )}
      {textItems.length > 0 && (
        <div className="absolute left-0 right-0 inset-0 z-30 pointer-events-none ">
          {textItems.map((textItem, index) => (
            <span
              key={index}
              style={{
                position: "absolute",
                left: `${textItem.x}%`,
                top: `${textItem.y}%`,
                transform: "translate(-50%, -50%)",
                // fontSize: `${textItem.fontSize}px`,
                fontSize: modal
                  ? `clamp(11px, ${Number(textItem.fontSize) / 6}vw, ${textItem.fontSize}px)`
                  : `clamp(11px, ${Number(textItem.fontSize) / 12}vw, ${textItem.fontSize}px)`,
                color: textItem.color,
                lineHeight: 1.3,
                whiteSpace: "pre-wrap", // ✅ this preserves line breaks
                textAlign: "center",
                wordBreak: "break-word",
                width: "100%",
              }}
              className="font-bold drop-shadow-lg"
            >
              {textItem.content}
            </span>
          ))}
        </div>
      )}

      {/* Custom Children (Badges etc) */}
      {children}
    </div>
  );
};

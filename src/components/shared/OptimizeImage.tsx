"use client";
import React from "react";

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "dgdfenqsv";

// Lazy check: never throw at module scope (breaks SSR/builds when the env
// var is missing). Falls back to the raw URL instead of crashing.

/**
 * Generate optimized Cloudinary URL
 */
export const getCloudinaryUrl = (
  publicId: string,
  width?: number,
  height?: number,
): string => {
  if (!CLOUD_NAME) return publicId;
  const transformations = [
    "f_auto", // auto format (webp/avif)
    "q_auto", // auto quality
    width && height ? "c_fill" : "c_limit", // crop only if both exist
    width ? `w_${width}` : null,
    height ? `h_${height}` : null,
  ]
    .filter(Boolean)
    .join(",");

  return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/${transformations}/${publicId}`;
};

/**
 * Generate responsive srcSet
 */
export const getCloudinarySrcSet = (
  publicId: string,
  height?: number,
): string => {
  if (!CLOUD_NAME) return "";
  const sizes = [320, 480, 768, 1024, 1280];

  return sizes
    .map((size) => `${getCloudinaryUrl(publicId, size, height)} ${size}w`)
    .join(", ");
};

interface Props {
  publicId: string;
  alt?: string;
  className?: string;
  width?: number;
  height?: number;
  style?: React.CSSProperties;
}

const OptimizeImage: React.FC<Props> = ({
  publicId,
  alt = "",
  className,
  width,
  height,
  style,
}) => {
  const src = getCloudinaryUrl(publicId, width, height);
  const srcSet = getCloudinarySrcSet(publicId, height);

  return (
    <img
      src={src}
      srcSet={srcSet || undefined}
      sizes="(max-width: 768px) 100vw, 33vw"
      alt={alt}
      className={className}
      loading="lazy"
      decoding="async"
      width={width}
      height={height}
      style={style}
    />
  );
};

export default React.memo(OptimizeImage);

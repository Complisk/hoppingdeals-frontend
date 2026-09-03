import fetchData from "@/utils/apiAction";

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const MIN_SHORTEST_EDGE = 900;
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

export interface PromotionImageAsset {
  url: string;
  publicId: string;
  width: number;
  height: number;
  format: "jpeg" | "png" | "webp";
  bytes: number;
  aspectRatio: number;
}

const getImageDimensions = (file: File) =>
  new Promise<{ width: number; height: number }>((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve({ width: image.naturalWidth, height: image.naturalHeight });
    };
    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("We could not read that image file."));
    };
    image.src = objectUrl;
  });

export const uploadPromotionImage = async (
  file: File,
): Promise<PromotionImageAsset> => {
  if (!ALLOWED_TYPES.has(file.type)) {
    throw new Error("Use a JPEG, PNG, or WebP image.");
  }
  if (file.size > MAX_FILE_SIZE) {
    throw new Error("Image must be 10 MB or smaller.");
  }

  const { width, height } = await getImageDimensions(file);
  if (Math.min(width, height) < MIN_SHORTEST_EDGE) {
    throw new Error("Image must be at least 900 px on its shortest side.");
  }

  const formData = new FormData();
  formData.append("image", file);
  const { response, error } = await fetchData(
    "/business/promotion-image",
    { method: "POST", data: formData },
    () => {},
    "business",
  );

  if (error || !response?.image?.url) {
    throw new Error(error?.message || "Promotion image upload failed.");
  }
  return response.image as PromotionImageAsset;
};

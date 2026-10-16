"use client";
/**
 * Upload image directly to Cloudinary from frontend
 * User selects image → uploadImageToCloudinary(file) → POST to Cloudinary API → Get back secure_url
 */

const CLOUDINARY_CLOUD_NAME = "dgdfenqsv";
const CLOUDINARY_UPLOAD_PRESET = "file upload";

export interface CloudinaryUploadResult {
  url: string;
  publicId: string;
}

export const uploadImageToCloudinary = async (file: File): Promise<CloudinaryUploadResult> => {
  try {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    if (!response.ok) {
      throw new Error(`Upload failed with status ${response.status}`);
    }

    const data = await response.json();

    // Return both the secure_url and public_id from Cloudinary response
    return {
      url: data.secure_url,
      publicId: data.public_id,
    };
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    throw error;
  }
};

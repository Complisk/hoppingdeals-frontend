"use client";
/**
 * Extracts the Cloudinary public ID from a delivery URL.
 * Example:
 *   https://res.cloudinary.com/cloudname/image/upload/v1234567890/mypublicid.png
 * returns:
 *   "mypublicid"
 */
export function extractCloudinaryPublicId(url: string): string | null {
  try {
    const parsed = new URL(url);
    const parts = parsed.pathname.split("/");

    // Cloudinary URLs include a version like /v12345/ before the public ID
    const versionIndex = parts.findIndex((p) => p.startsWith("v"));

    if (versionIndex > -1 && parts.length > versionIndex + 1) {
      // remove file extension
      const filename = parts[versionIndex + 1];
      const publicId = filename.split(".")[0];
      return publicId;
    }
    return null;
  } catch (err) {
    console.error("Invalid URL:", err);
    return null;
  }
}

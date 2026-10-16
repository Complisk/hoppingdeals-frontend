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
      // A public ID may include one or more folders. Keep every path segment
      // after the delivery version and remove only its final extension.
      return parts
        .slice(versionIndex + 1)
        .join("/")
        .replace(/\.[^/.]+$/, "");
    }
    return null;
  } catch (err) {
    console.error("Invalid URL:", err);
    return null;
  }
}

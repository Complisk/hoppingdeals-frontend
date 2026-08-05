import type { Metadata } from "next";
import { getPublicPhotos } from "@/lib/data/publicData";
import { SITE_URL, toAbsoluteUrl } from "@/lib/seo";
import JsonLd from "@/components/seo/JsonLd";
import Photos from "@/views/Photos";

export const metadata: Metadata = {
  title: "Complisk Photos Gallery",
  description:
    "Browse Complisk photos and images of our app, guides, and promotional materials.",
  alternates: {
    canonical: "/photos",
  },
  openGraph: {
    title: "Complisk Photos Gallery",
    description:
      "Browse Complisk photos and images of our app, guides, and promotional materials.",
    url: `${SITE_URL}/photos`,
    siteName: "Complisk",
    type: "website",
  },
};

/**
 * Server Component: photos are fetched server-side through the ISR data layer
 * (cache tag: photos, lifetime: hours) and passed to the client gallery as
 * initial data — no client round-trip on first paint.
 */
export default async function PhotosPage() {
  const photos = await getPublicPhotos();

  const imageObjects = photos.map((photo) => ({
    "@type": "ImageObject",
    contentUrl: toAbsoluteUrl(photo.imageUrl),
    name: photo.title,
    description: photo.description || undefined,
  }));

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "ImageGallery",
          name: "Complisk Photos Gallery",
          url: `${SITE_URL}/photos`,
          image: imageObjects,
        }}
      />
      <Photos initialPhotos={photos} />
    </>
  );
}

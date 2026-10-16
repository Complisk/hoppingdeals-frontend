"use client";
import Header from "@/components/homePage/Header";
import PageHero from "@/components/public/PageHero";
import Footer from "@/components/homePage/Footer";
import OptimizeImage from "@/components/shared/OptimizeImage";
import Spinner from "@/components/shared/Spinner";
import Seo from "@/components/seo/Seo";
import { SITE_URL } from "@/lib/seo";
import { photoService, type PhotoItem } from "@/services/photoService";
import { useEffect, useState } from "react";

interface PhotosProps {
  /** Server-side fetched photos (from the cached server data layer) */
  initialPhotos?: PhotoItem[];
}

const Photos = ({ initialPhotos }: PhotosProps = {}) => {
  const [photos, setPhotos] = useState<PhotoItem[]>(initialPhotos ?? []);
  const [loading, setLoading] = useState(initialPhotos ? false : true);

  useEffect(() => {
    // When the server already delivered photos, skip the client fetch
    if (initialPhotos && initialPhotos.length > 0) return;

    let mounted = true;

    const loadPhotos = async () => {
      try {
        const data = await photoService.getPublicPhotos();
        if (mounted) {
          setPhotos(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        console.error("Failed to load public photos:", error);
        if (mounted) {
          setPhotos([]);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadPhotos();

    return () => {
      mounted = false;
    };
  }, [initialPhotos]);

  return (
    <div className="min-h-screen flex flex-col">
      <Seo
        title="Hopping Deals Photos Gallery"
        description="Browse Hopping Deals photos and images of our app, guides, and promotional materials."
        structuredData={[
          {
            "@context": "https://schema.org",
            "@type": "WebPage",
            name: "Hopping Deals Photos",
            url: `${SITE_URL}/photos`,
          },
        ]}
      />
      <Header />
      <main className="flex-grow">
        <PageHero
          scene="gallery"
          title="Photo gallery"
          description="Screens from the app, how-to guides and promotional materials from the Hopping Deals team."
          crumbs={[{ label: "Home", href: "/" }, { label: "Photo gallery" }]}
        />
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          {loading ? (
            <div className="flex min-h-[320px] items-center justify-center">
              <Spinner className="h-8 w-8" />
            </div>
          ) : photos.length === 0 ? (
            <div className="hd-empty">
              <h2 className="text-xl text-foreground">No photos yet</h2>
              <p className="max-w-sm text-sm text-muted-foreground">
                The gallery is empty for now. Check back soon.
              </p>
            </div>
          ) : (
            <div className="columns-1 gap-6 sm:columns-2 lg:columns-3">
              {photos.map((photo) => (
                <figure
                  key={photo.id}
                  className="hd-panel mb-6 break-inside-avoid overflow-hidden"
                >
                  <div className="overflow-hidden bg-secondary">
                    {photo.cloudinaryPublicId ? (
                      <OptimizeImage
                        publicId={photo.cloudinaryPublicId}
                        alt={photo.altText || photo.title}
                        className="h-auto w-full"
                      />
                    ) : (
                      <img
                        src={photo.imageUrl}
                        alt={photo.altText || photo.title}
                        className="h-auto w-full"
                        loading="lazy"
                      />
                    )}
                  </div>
                  {photo.title || photo.description ? (
                    <figcaption className="space-y-1.5 p-5">
                      {photo.title ? (
                        <h3 className="text-base font-semibold text-foreground">
                          {photo.title}
                        </h3>
                      ) : null}
                      {photo.description ? (
                        <p className="text-sm leading-relaxed text-muted-foreground">
                          {photo.description}
                        </p>
                      ) : null}
                    </figcaption>
                  ) : null}
                </figure>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Photos;

"use client";
import Header from "@/components/homePage/Header";
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
        title="Complisk Photos Gallery"
        description="Browse Complisk photos and images of our app, guides, and promotional materials."
        structuredData={[
          {
            "@context": "https://schema.org",
            "@type": "WebPage",
            name: "Complisk Photos",
            url: `${SITE_URL}/photos`,
          },
        ]}
      />
      <Header />
      <main className="flex-grow">
        <div className="w-full bg-gradient-to-br py-12 px-4 sm:px-8">
          <div className="max-w-6xl mx-auto">
            {loading ? (
              <div className="flex min-h-[320px] items-center justify-center">
                <Spinner className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : photos.length === 0 ? (
              <div className="rounded-2xl border border-dashed bg-white/70 px-6 py-16 text-center">
                <h2 className="text-2xl font-semibold text-gray-900">
                  No photos available right now
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-gray-600">
                  The Complisk admin team has not published any gallery items
                  yet.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 mb-12">
                {photos.map((photo) => (
                  <div
                    key={photo.id}
                    className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-black/5"
                  >
                    <div className="aspect-square overflow-hidden bg-gray-100">
                      {photo.cloudinaryPublicId ? (
                        <OptimizeImage
                          publicId={photo.cloudinaryPublicId}
                          alt={photo.altText || photo.title}
                          className="h-full w-full "
                        />
                      ) : (
                        <img
                          src={photo.imageUrl}
                          alt={photo.altText || photo.title}
                          className="h-full w-full object-cover"
                          loading="lazy"
                        />
                      )}
                    </div>
                    <div className="py-4 px-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {photo.title}
                      </h3>
                      <p className="text-gray-700 text-sm leading-relaxed">
                        {photo.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Photos;

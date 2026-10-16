import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Note: Cache Components ("use cache") is intentionally NOT enabled.
  // It forbids `force-dynamic` and empty `generateStaticParams`, which this
  // app needs for its authenticated dynamic-param routes. Caching is instead
  // handled with classic ISR (fetch revalidate) + revalidateTag.
  // The app already serves optimized Cloudinary/static imagery via <img>
  images: {
    unoptimized: true,
  },
};

export default nextConfig;

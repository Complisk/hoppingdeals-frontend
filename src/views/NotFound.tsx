import { SceneBackdrop } from "@/components/art/Scene";
/**
 * 404 page — pure Server Component.
 * SEO (noindex) is handled by `src/app/not-found.tsx` via the Metadata API.
 */
const NotFound = () => {
  return (
    <main className="relative isolate flex min-h-screen items-center justify-center overflow-hidden px-6">
      <SceneBackdrop name="lost" fade="bottom" />
      <div className="hd-panel max-w-md bg-card/80 px-8 py-10 text-center backdrop-blur-md">
        <img
          src="/logo.png"
          alt="Hopping Deals"
          className="mx-auto mb-6 h-20 w-auto drop-shadow-[0_10px_20px_rgb(0_0_0/0.6)]"
        />
        <p className="font-display text-6xl font-bold text-gold">404</p>
        <h1 className="mt-4 text-2xl text-white">
          This page hopped off the map
        </h1>
        <p className="mt-3 text-white/75">
          The link may be old or mistyped. Head back and pick up the deals from
          the home page.
        </p>
        <a
          href="/"
          className="mt-8 inline-flex h-11 items-center rounded-xl bg-primary px-6 text-sm font-semibold text-primary-foreground shadow-glow transition-colors hover:bg-primary-light"
        >
          Back to home
        </a>
      </div>
    </main>
  );
};

export default NotFound;

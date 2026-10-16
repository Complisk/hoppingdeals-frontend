"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { SceneBackdrop } from "@/components/art/Scene";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global error:", error);
  }, [error]);

  return (
    <main className="relative isolate flex min-h-screen flex-col items-center justify-center gap-4 overflow-hidden p-8 text-center">
      <SceneBackdrop name="lost" fade="bottom" />
      <div className="hd-panel flex max-w-md flex-col items-center gap-4 bg-card/80 px-8 py-10 backdrop-blur-md">
      <img src="/logo.png" alt="" className="mb-2 h-20 w-auto" />
      <h1 className="text-3xl text-white">This page didn’t load</h1>
      <p className="max-w-md text-white/75">
        Something broke while loading it. Try again, and if it keeps happening,
        message support from the page footer.
      </p>
      <div className="mt-2 flex flex-wrap justify-center gap-3">
        <Button variant="hero" onClick={() => reset()}>
          Try again
        </Button>
        <Button asChild variant="glass">
          <a href="/">Back to home</a>
        </Button>
      </div>
      </div>
    </main>
  );
}

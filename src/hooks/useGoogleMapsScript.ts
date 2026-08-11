"use client";

import { useEffect, useState } from "react";

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";

const SCRIPT_ID = "google-maps-js-api";
const CALLBACK_NAME = "__hoppingdealsGoogleMapsInit";

export type GoogleMapsLoadState =
  | { status: "loading" }
  | { status: "ready" }
  | { status: "error"; error: string };

// Module-level singleton: the Google Maps script is injected only once,
// no matter how many components use this hook.
let loadPromise: Promise<void> | null = null;

function injectGoogleMapsScript(): Promise<void> {
  if (typeof window === "undefined") {
    return Promise.reject(
      new Error("Google Maps can only be loaded in the browser."),
    );
  }

  // Already loaded.
  if (window.google?.maps?.places) return Promise.resolve();

  // A load is already in progress — share the same promise.
  if (loadPromise) return loadPromise;

  loadPromise = new Promise<void>((resolve, reject) => {
    if (!GOOGLE_MAPS_API_KEY) {
      reject(
        new Error(
          "Google Maps API key is missing. Add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to your .env.local file and restart the dev server.",
        ),
      );
      return;
    }

    let pollTimer: number | null = null;
    let timeoutTimer: number | null = null;

    const finish = (err?: string) => {
      if (pollTimer !== null) window.clearInterval(pollTimer);
      if (timeoutTimer !== null) window.clearTimeout(timeoutTimer);
      if (err) reject(new Error(err));
      else resolve();
    };

    // Poll as a safety net in case the callback fires before we can observe
    // window.google (or the script was already injected by another page).
    pollTimer = window.setInterval(() => {
      if (window.google?.maps?.places) finish();
    }, 250);

    // Hard timeout so the UI never hangs on "loading" forever.
    timeoutTimer = window.setTimeout(() => {
      finish(
        "Timed out while loading Google Maps. Check your API key, billing, and internet connection.",
      );
    }, 20000);

    // If a <script> tag already exists but google isn't ready yet, just poll.
    if (document.getElementById(SCRIPT_ID)) return;

    // Set the global callback BEFORE injecting the script.
    (window as any)[CALLBACK_NAME] = () => {
      if (window.google?.maps?.places) finish();
    };

    const script = document.createElement("script");
    script.id = SCRIPT_ID;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(
      GOOGLE_MAPS_API_KEY,
    )}&libraries=places&callback=${CALLBACK_NAME}`;
    script.async = true;
    script.onerror = () =>
      finish(
        "Failed to load Google Maps. Check that your API key is valid and the Places API is enabled for it.",
      );
    document.head.appendChild(script);
  });

  // If a load attempt fails, allow future attempts to retry (e.g. after the
  // API key is added to .env.local) instead of caching the failure forever.
  loadPromise.catch(() => {
    loadPromise = null;
  });

  return loadPromise;
}

/**
 * Loads the Google Maps JavaScript API (Places library) exactly once and
 * reports whether the Autocomplete/Places services are ready to use.
 *
 * Use it like:
 *   const { status, error } = useGoogleMapsScript();
 *   const ready = status === "ready";
 */
export function useGoogleMapsScript(): GoogleMapsLoadState {
  const [state, setState] = useState<GoogleMapsLoadState>(() =>
    typeof window !== "undefined" && window.google?.maps?.places
      ? { status: "ready" }
      : { status: "loading" },
  );

  useEffect(() => {
    let active = true;

    injectGoogleMapsScript()
      .then(() => {
        if (active) setState({ status: "ready" });
      })
      .catch((err: Error) => {
        if (active) {
          setState({ status: "error", error: err.message || String(err) });
        }
      });

    return () => {
      active = false;
    };
  }, []);

  return state;
}

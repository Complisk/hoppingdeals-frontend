// frontend/src/lib/stripe.ts
import { loadStripe, type Stripe } from "@stripe/stripe-js";

const STRIPE_PUBLISHABLE_KEY =
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "";

let stripePromise: Promise<Stripe | null> | null = null;

/**
 * Lazily loads Stripe.js in the browser only (SSR-safe).
 * `Elements` accepts the returned promise directly.
 */
export const getStripe = () => {
  if (typeof window === "undefined") return null;
  if (!stripePromise) {
    stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY);
  }
  return stripePromise;
};

/** Stripe Elements appearance matching the Moon Market theme. */
export const stripeAppearance = {
  theme: "night" as const,
  variables: {
    colorPrimary: "#F7C948",
    colorBackground: "#1F2860",
    colorText: "#EDF0FF",
    colorTextSecondary: "#97A3CC",
    colorDanger: "#F05252",
    borderRadius: "12px",
    fontFamily: "Outfit, system-ui, sans-serif",
  },
  rules: {
    ".Input": { border: "1px solid #34407a" },
    ".Input:focus": {
      border: "1px solid #F7C948",
      boxShadow: "0 0 0 3px rgba(245, 197, 92, 0.25)",
    },
    ".Tab": { border: "1px solid #34407a" },
    ".Tab--selected": { borderColor: "#F7C948" },
  },
};

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

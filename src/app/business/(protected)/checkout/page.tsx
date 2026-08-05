import type { Metadata } from "next";
import { Suspense } from "react";
import PromotionCheckoutPage from "@/views/business/PromotionCheckoutPage";
import PageLoader from "@/app/_components/Loader";

export const metadata: Metadata = {
  title: "Checkout",
  robots: { index: false, follow: false },
};

export default function CheckoutPage() {
  return (
    <Suspense fallback={<PageLoader />}>
      <PromotionCheckoutPage />
    </Suspense>
  );
}

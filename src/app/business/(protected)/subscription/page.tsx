import type { Metadata } from "next";
import { Suspense } from "react";
import SubscriptionPage from "@/views/business/SubscriptionPage";
import PageLoader from "@/app/_components/Loader";

export const metadata: Metadata = {
  title: "Subscription",
  robots: { index: false, follow: false },
};

export default function SubscriptionRoutePage() {
  return (
    <Suspense fallback={<PageLoader />}>
      <SubscriptionPage />
    </Suspense>
  );
}

import type { Metadata } from "next";
import { Suspense } from "react";
import SubscriptionSuccess from "@/views/business/SubscriptionSuccess";
import PageLoader from "@/app/_components/Loader";

export const metadata: Metadata = {
  title: "Subscription confirmed",
  robots: { index: false, follow: false },
};

export default function SubscriptionSuccessPage() {
  return (
    <Suspense fallback={<PageLoader />}>
      <SubscriptionSuccess />
    </Suspense>
  );
}

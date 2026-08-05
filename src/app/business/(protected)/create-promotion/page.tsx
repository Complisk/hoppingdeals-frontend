import type { Metadata } from "next";
import { Suspense } from "react";
import CreatePromotion from "@/views/business/CreatePromotion";
import PageLoader from "@/app/_components/Loader";

export const metadata: Metadata = {
  title: "Create Promotion",
  robots: { index: false, follow: false },
};

export default function CreatePromotionPage() {
  return (
    <Suspense fallback={<PageLoader />}>
      <CreatePromotion />
    </Suspense>
  );
}

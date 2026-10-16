import type { Metadata } from "next";
import { Suspense } from "react";
import PaymentSuccess from "@/views/business/PaymentSuccess";
import PageLoader from "@/app/_components/Loader";

export const metadata: Metadata = {
  title: "Payment successful",
  robots: { index: false, follow: false },
};

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={<PageLoader />}>
      <PaymentSuccess />
    </Suspense>
  );
}

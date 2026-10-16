import type { Metadata } from "next";
import { Suspense } from "react";
import BusinessRegister from "@/views/business/BusinessRegister";
import PageLoader from "@/app/_components/Loader";

export const metadata: Metadata = {
  title: "Register your business",
  robots: { index: false, follow: false },
};

export default function BusinessRegisterPage() {
  return (
    <Suspense fallback={<PageLoader />}>
      <BusinessRegister />
    </Suspense>
  );
}

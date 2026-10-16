import type { Metadata } from "next";
import { Suspense } from "react";
import ResetPassword from "@/views/auth/ResetPassword";
import PageLoader from "@/app/_components/Loader";

export const metadata: Metadata = {
  title: "Reset password",
  robots: { index: false, follow: false },
};

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<PageLoader />}>
      <ResetPassword />
    </Suspense>
  );
}

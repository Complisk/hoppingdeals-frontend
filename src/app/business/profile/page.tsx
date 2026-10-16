import type { Metadata } from "next";
import BusinessProfile from "@/views/business/BusinessProfile";
import RouteGuard from "@/app/_components/RouteGuard";

export const metadata: Metadata = {
  title: "Business Profile",
  robots: { index: false, follow: false },
};

export default function BusinessProfilePage() {
  return (
    <RouteGuard requiredRole="business">
      <BusinessProfile />
    </RouteGuard>
  );
}

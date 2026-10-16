"use client";
import RouteGuard from "@/app/_components/RouteGuard";
import BusinessLayout from "@/components/layouts/BusinessLayout";

export default function BusinessProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RouteGuard requiredRole="business">
      <BusinessLayout>{children}</BusinessLayout>
    </RouteGuard>
  );
}

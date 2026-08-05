"use client";
import RouteGuard from "@/app/_components/RouteGuard";
import AdminLayout from "@/components/layouts/AdminLayout";

export default function AdminProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RouteGuard requiredRole="admin">
      <AdminLayout>{children}</AdminLayout>
    </RouteGuard>
  );
}

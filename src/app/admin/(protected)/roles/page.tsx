import type { Metadata } from "next";
import AdminRoles from "@/views/admin/AdminRoles";

export const metadata: Metadata = {
  title: "Roles & Permissions",
  robots: { index: false, follow: false },
};

export default function AdminRolesPage() {
  return <AdminRoles />;
}

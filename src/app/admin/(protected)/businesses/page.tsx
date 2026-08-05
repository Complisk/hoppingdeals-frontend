import type { Metadata } from "next";
import AdminBusinesses from "@/views/admin/AdminBusinesses";

export const metadata: Metadata = {
  title: "Manage Businesses",
  robots: { index: false, follow: false },
};

export default function AdminBusinessesPage() {
  return <AdminBusinesses />;
}

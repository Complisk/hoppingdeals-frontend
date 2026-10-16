import type { Metadata } from "next";
import AdminSupportMessages from "@/views/admin/AdminSupportMessages";

export const metadata: Metadata = {
  title: "Support Messages",
  robots: { index: false, follow: false },
};

export default function AdminSupportMessagesPage() {
  return <AdminSupportMessages />;
}

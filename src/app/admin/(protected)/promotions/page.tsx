import type { Metadata } from "next";
import AdminPromotions from "@/views/admin/AdminPromotions";

export const metadata: Metadata = {
  title: "Manage Promotions",
  robots: { index: false, follow: false },
};

export default function AdminPromotionsPage() {
  return <AdminPromotions />;
}

import type { Metadata } from "next";
import AdminCreatePromotion from "@/views/admin/AdminCreatePromotion";

export const metadata: Metadata = {
  title: "Edit Promotion",
  robots: { index: false, follow: false },
};

export default function AdminEditPromotionPage() {
  return <AdminCreatePromotion />;
}

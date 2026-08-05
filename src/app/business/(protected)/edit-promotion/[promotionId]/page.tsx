import type { Metadata } from "next";
import EditPromotion from "@/views/business/EditPromotion";

export const metadata: Metadata = {
  title: "Edit Promotion",
  robots: { index: false, follow: false },
};

export default function EditPromotionPage() {
  return <EditPromotion />;
}

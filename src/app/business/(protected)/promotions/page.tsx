import type { Metadata } from "next";
import BusinessPromotions from "@/views/business/BusinessPromotions";

export const metadata: Metadata = {
  title: "My Promotions",
  robots: { index: false, follow: false },
};

export default function BusinessPromotionsPage() {
  return <BusinessPromotions />;
}

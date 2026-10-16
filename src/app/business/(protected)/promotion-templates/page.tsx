import type { Metadata } from "next";
import PromotionTemplates from "@/views/business/PromotionTemplates";

export const metadata: Metadata = {
  title: "Saved Templates",
  robots: { index: false, follow: false },
};

export default function PromotionTemplatesPage() {
  return <PromotionTemplates />;
}

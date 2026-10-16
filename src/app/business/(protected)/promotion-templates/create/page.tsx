import type { Metadata } from "next";
import PromotionTemplateEditor from "@/views/business/PromotionTemplateEditor";

export const metadata: Metadata = {
  title: "Create Template",
  robots: { index: false, follow: false },
};

export default function CreateTemplatePage() {
  return <PromotionTemplateEditor />;
}

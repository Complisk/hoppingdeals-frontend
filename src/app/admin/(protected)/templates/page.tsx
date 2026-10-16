import type { Metadata } from "next";
import AdminTemplateUpload from "@/components/admin/AdminTemplateUpload";

export const metadata: Metadata = {
  title: "Templates",
  robots: { index: false, follow: false },
};

export default function AdminTemplatesPage() {
  return <AdminTemplateUpload />;
}

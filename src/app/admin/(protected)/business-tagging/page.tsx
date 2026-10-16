import type { Metadata } from "next";
import AdminBusinessTagging from "@/views/admin/AdminBusinessTagging";

export const metadata: Metadata = {
  title: "Business Tagging",
  robots: { index: false, follow: false },
};

export default function AdminBusinessTaggingPage() {
  return <AdminBusinessTagging />;
}

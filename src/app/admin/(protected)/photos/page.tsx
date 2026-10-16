import type { Metadata } from "next";
import AdminPhotos from "@/views/admin/AdminPhotos";

export const metadata: Metadata = {
  title: "Photos",
  robots: { index: false, follow: false },
};

export default function AdminPhotosPage() {
  return <AdminPhotos />;
}

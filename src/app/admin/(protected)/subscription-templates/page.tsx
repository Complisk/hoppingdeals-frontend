import type { Metadata } from "next";
import AdminSubscriptionTemplates from "@/views/admin/AdminSubscriptionTemplates";

export const metadata: Metadata = {
  title: "Subscription Templates",
  robots: { index: false, follow: false },
};

export default function AdminSubscriptionTemplatesPage() {
  return <AdminSubscriptionTemplates />;
}

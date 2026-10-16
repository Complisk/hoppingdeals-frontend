import type { Metadata } from "next";
import BusinessDashboard from "@/views/business/BusinessDashboard";

export const metadata: Metadata = {
  title: "Business Dashboard",
  robots: { index: false, follow: false },
};

export default function BusinessDashboardPage() {
  return <BusinessDashboard />;
}

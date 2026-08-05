import type { Metadata } from "next";
import BusinessLogin from "@/views/business/BusinessLogin";

export const metadata: Metadata = {
  title: "Business sign in",
  robots: { index: false, follow: false },
};

export default function BusinessLoginPage() {
  return <BusinessLogin />;
}

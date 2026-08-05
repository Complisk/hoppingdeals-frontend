import type { Metadata } from "next";
import BusinessVisitor from "@/views/business/BusinessVisitor";

export const metadata: Metadata = {
  title: "Business visitor",
  robots: { index: false, follow: false },
};

export default function BusinessVisitorPage() {
  return <BusinessVisitor />;
}

import type { Metadata } from "next";
import CompliskBusinessDirectory from "@/views/CompliskBusinessDirectory";

export const metadata: Metadata = {
  title: "Hopping Deals Business Directory",
  description:
    "Support local with Hopping Deals and discover businesses powering our platform.",
  robots: { index: false, follow: false },
};

export default function BusinessDirectoryAliasPage() {
  return <CompliskBusinessDirectory />;
}

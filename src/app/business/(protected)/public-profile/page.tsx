import type { Metadata } from "next";
import BusinessPublicProfile from "@/views/business/BusinessPublicProfile";

export const metadata: Metadata = {
  title: "Public Profile",
  robots: { index: false, follow: false },
};

export default function BusinessPublicProfilePage() {
  return <BusinessPublicProfile />;
}

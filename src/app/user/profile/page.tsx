import type { Metadata } from "next";
import UserProfile from "@/views/UserProfile";
import RouteGuard from "@/app/_components/RouteGuard";

export const metadata: Metadata = {
  title: "My Profile",
  robots: { index: false, follow: false },
};

export default function UserProfilePage() {
  return (
    <RouteGuard requiredRole="user">
      <UserProfile />
    </RouteGuard>
  );
}

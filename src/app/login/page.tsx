import type { Metadata } from "next";
import UserLogin from "@/views/auth/UserLogin";

export const metadata: Metadata = {
  title: "Sign in",
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return <UserLogin />;
}

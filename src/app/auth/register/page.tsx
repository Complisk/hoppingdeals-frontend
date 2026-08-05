import type { Metadata } from "next";
import UserRegister from "@/views/auth/UserRegister";

export const metadata: Metadata = {
  title: "Create account",
  robots: { index: false, follow: false },
};

export default function RegisterPage() {
  return <UserRegister />;
}

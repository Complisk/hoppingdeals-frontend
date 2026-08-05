"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/hooks/use-redux";

interface RouteGuardProps {
  requiredRole: "user" | "business" | "admin";
  children: React.ReactNode;
}

/**
 * Client-side route guard that mirrors the old react-router PrivateRoute:
 * redirects unauthenticated / wrong-role visitors to the matching login page.
 */
export default function RouteGuard({ requiredRole, children }: RouteGuardProps) {
  const router = useRouter();
  const {
    businessToken,
    userToken,
    accountType,
    business,
    user,
    adminToken,
    adminUser,
  } = useAppSelector((state) => state.auth);

  let authorized: boolean;
  let redirectTo: string;

  if (requiredRole === "business") {
    authorized = !!(businessToken && business && accountType === "business");
    redirectTo = "/business/login";
  } else if (requiredRole === "admin") {
    authorized = !!(adminToken && adminUser);
    redirectTo = "/admin/login";
  } else {
    authorized = !!(userToken && user);
    redirectTo = "/login";
  }

  useEffect(() => {
    if (!authorized) {
      router.replace(redirectTo);
    }
  }, [authorized, redirectTo, router]);

  if (!authorized) return null;

  return <>{children}</>;
}

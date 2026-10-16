"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useLocation } from "@/hooks/useLocation";
import { Lock } from "lucide-react";
import { toast } from "react-toastify";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import AuthShell, { AuthLink } from "@/components/shared/AuthShell";
import Seo from "@/components/seo/Seo";
import { useAuthService } from "@/services/authService";

const ResetPassword = () => {
  const location = useLocation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { resetPassword } = useAuthService();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const accountType = useMemo(
    () => (location.pathname.startsWith("/business") ? "business" : "user"),
    [location.pathname],
  );
  const loginPath = accountType === "business" ? "/business/login" : "/auth/login";
  const forgotPath =
    accountType === "business" ? "/business/forgot-password" : "/auth/forgot-password";

  const token = searchParams.get("token") || "";

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!token) {
      toast.error("Invalid reset link.");
      return;
    }

    if (!password || password.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await resetPassword({
        token,
        password,
        accountType,
      });
      toast.success(response?.message || "Password reset successfully.");
      router.push(loginPath);
    } catch (error: any) {
      toast.error(error?.message || "Unable to reset password.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Seo
        title="Reset password"
        description="Choose a new password for your Hopping Deals account."
        pathname={location.pathname}
        noindex
      />
      <AuthShell
        title="Choose a new password"
        subtitle={`This updates the password on your ${accountType} account.`}
        aside={{
          scene: "orbit",
          eyebrow: "Account recovery",
          title: "Almost done.",
          points: [
            "Use at least 6 characters.",
            "After saving, log in with your new password.",
          ],
        }}
        footer={
          <p>
            Remembered it? <AuthLink href={loginPath}>Back to log in</AuthLink>
          </p>
        }
      >
        {!token ? (
          <div className="rounded-xl border border-destructive/40 bg-destructive/10 p-4 text-sm">
            <p className="font-medium text-foreground">
              This reset link is missing or broken.
            </p>
            <p className="mt-1 text-muted-foreground">
              Request a new one and use the latest email we send.
            </p>
            <Link
              href={forgotPath}
              className="mt-3 inline-block font-semibold text-gold underline-offset-4 hover:underline"
            >
              Send a new reset link
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="password">New password</Label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3.5 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="password"
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10"
                placeholder="At least 6 characters"
                disabled={isSubmitting}
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm-password">Confirm new password</Label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3.5 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="confirm-password"
                type="password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="pl-10"
                placeholder="Repeat new password"
                disabled={isSubmitting}
                required
              />
            </div>
          </div>

            <Button
              type="submit"
              variant="hero"
              size="lg"
              className="w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Saving…" : "Save new password"}
            </Button>
          </form>
        )}
      </AuthShell>
    </>
  );
};

export default ResetPassword;

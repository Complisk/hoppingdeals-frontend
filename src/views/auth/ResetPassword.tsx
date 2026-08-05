"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useLocation } from "@/hooks/useLocation";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BadgeCheck,
  KeyRound,
  Lock,
  ShieldCheck,
  TriangleAlert,
} from "lucide-react";
import { toast } from "react-toastify";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Logo from "@/components/shared/Logo";
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
    <div className="relative min-h-screen flex overflow-hidden bg-background">
      <Seo
        title="Reset password"
        description="Set a new password for your Complisk account."
        pathname={location.pathname}
        noindex
      />

      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-16 right-8 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -bottom-20 left-10 h-64 w-64 rounded-full bg-accent/20 blur-3xl" />
      </div>

      <div className="relative z-10 flex-1 flex items-center justify-center p-6 sm:p-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full max-w-md"
        >
          <div className="mb-8">
            <Logo size="lg" />
          </div>

          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium text-primary mb-4">
            <ShieldCheck className="h-3.5 w-3.5" />
            Password Reset
          </div>

          <h1 className="text-3xl font-bold text-foreground mb-2">Reset Password</h1>
          <p className="text-muted-foreground mb-6">
            Enter your new password to complete reset.
          </p>

          {!token ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-5 space-y-3">
              <p className="text-sm text-red-700 flex items-center gap-2">
                <TriangleAlert className="h-4 w-4" />
                This reset link is invalid or incomplete.
              </p>
              <Link href={forgotPath} className="text-primary hover:underline font-medium text-sm">
                Request a new reset link
              </Link>
            </div>
          ) : (
            <div className="rounded-2xl border border-border/70 bg-card/80 backdrop-blur-sm p-5 sm:p-6 shadow-xl shadow-primary/5">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="password">New password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 h-12"
                      placeholder="At least 6 characters"
                      disabled={isSubmitting}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="confirm-password"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="pl-10 h-12"
                      placeholder="Repeat your password"
                      disabled={isSubmitting}
                      required
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  variant="hero"
                  size="lg"
                  className="w-full h-12"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Updating..." : "Update Password"}
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
              </form>

              <div className="mt-4 rounded-xl border border-border/70 bg-background/70 p-3">
                <p className="text-xs text-muted-foreground flex items-center gap-2">
                  <BadgeCheck className="h-4 w-4 text-primary" />
                  Use a unique password you do not use on other platforms.
                </p>
              </div>
            </div>
          )}

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              <Link href={loginPath} className="text-primary hover:underline font-medium">
                Back to sign in
              </Link>
            </p>
          </div>
        </motion.div>
      </div>

      <div className="hidden lg:flex relative z-10 flex-1 bg-gradient-to-br from-accent via-primary to-primary items-center justify-center p-12 text-primary-foreground overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-24 right-20 h-40 w-40 rounded-full border border-white/20" />
          <div className="absolute bottom-12 left-14 h-24 w-24 rounded-full border border-white/20" />
        </div>
        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="relative text-center max-w-md"
        >
          <KeyRound className="h-24 w-24 mx-auto mb-8 opacity-90" />
          <h2 className="text-3xl font-bold mb-4">Create a Strong Password</h2>
          <p className="text-lg opacity-90 leading-relaxed">
            Choose a new password and restore secure access to your Complisk{" "}
            {accountType} account.
          </p>

          <div className="mt-10 space-y-4 text-left bg-white/10 rounded-2xl border border-white/20 p-5 backdrop-blur-sm">
            <p className="text-sm flex items-center gap-2">
              <BadgeCheck className="h-4 w-4" />
              At least 6 characters
            </p>
            <p className="text-sm flex items-center gap-2">
              <ShieldCheck className="h-4 w-4" />
              Keep it private and unique
            </p>
            <p className="text-sm flex items-center gap-2">
              <Lock className="h-4 w-4" />
              Confirm password must match
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ResetPassword;

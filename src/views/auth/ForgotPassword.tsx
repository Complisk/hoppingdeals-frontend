"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { useLocation } from "@/hooks/useLocation";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Clock3,
  KeyRound,
  Mail,
  MailCheck,
  ShieldCheck,
} from "lucide-react";
import { toast } from "react-toastify";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Logo from "@/components/shared/Logo";
import Seo from "@/components/seo/Seo";
import { useAuthService } from "@/services/authService";

const ForgotPassword = () => {
  const location = useLocation();
  const { requestPasswordReset } = useAuthService();
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [requestSent, setRequestSent] = useState(false);

  const accountType = useMemo(
    () => (location.pathname.startsWith("/business") ? "business" : "user"),
    [location.pathname],
  );
  const loginPath =
    accountType === "business" ? "/business/login" : "/auth/login";
  const registerPath =
    accountType === "business" ? "/business/register" : "/auth/register";

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!email.trim()) {
      toast.error("Please enter your email address.");
      return;
    }

    const emailRegex = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
    // if (!emailRegex.test(email.trim())) {
    //   toast.error("Please enter a valid email address.");
    //   return;
    // }

    setIsSubmitting(true);
    try {
      const response = await requestPasswordReset({
        email: email.trim(),
        accountType,
      });
      toast.success(
        response?.message ||
          "If that email exists, a password reset link has been sent.",
      );
      setRequestSent(true);
    } catch (error: any) {
      toast.error(error?.message || "Failed to send reset email.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen flex overflow-hidden bg-background">
      <Seo
        title="Forgot password"
        description="Request a secure password reset link for your Hopping Deals account."
        pathname={location.pathname}
        noindex
      />

      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -bottom-20 left-1/4 h-64 w-64 rounded-full bg-accent/15 blur-3xl" />
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
            Account Recovery
          </div>

          <h1 className="text-3xl font-bold text-foreground mb-2">
            Forgot Password
          </h1>
          <p className="text-muted-foreground mb-6">
            Enter your email and we will send a secure reset link for your{" "}
            {accountType} account.
          </p>

          <div className="rounded-2xl border border-border/70 bg-card/80 backdrop-blur-sm p-5 sm:p-6 shadow-xl shadow-primary/5">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 h-12"
                    placeholder={
                      accountType === "business"
                        ? "business@example.com"
                        : "you@example.com"
                    }
                    disabled={isSubmitting}
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                size="lg"
                className="w-full h-12"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Sending..." : "Send Reset Link"}
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </form>
          </div>

          {requestSent && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-3"
            >
              <p className="text-sm text-emerald-800 flex items-center gap-2">
                <MailCheck className="h-4 w-4" />
                Check your inbox and spam folder for the reset email.
              </p>
            </motion.div>
          )}

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Remember your password?{" "}
              <Link
                href={loginPath}
                className="text-primary hover:underline font-medium"
              >
                Back to sign in
              </Link>
            </p>
          </div>

          <div className="mt-3 text-center">
            <p className="text-sm text-muted-foreground">
              Need an account?{" "}
              <Link
                href={registerPath}
                className="text-primary hover:underline font-medium"
              >
                Register
              </Link>
            </p>
          </div>
        </motion.div>
      </div>

      <div className="hidden lg:flex relative z-10 flex-1 bg-gradient-to-br from-primary/90 via-primary to-accent items-center justify-center p-12 text-primary-foreground overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 h-36 w-36 rounded-full border border-white/20" />
          <div className="absolute bottom-14 right-12 h-24 w-24 rounded-full border border-white/20" />
        </div>
        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="relative text-center max-w-md"
        >
          <KeyRound className="h-24 w-24 mx-auto mb-8 opacity-90" />
          <h2 className="text-3xl font-bold mb-4">Secure Password Recovery</h2>
          <p className="text-lg opacity-90 leading-relaxed">
            We use one-time reset links so you can recover access quickly while
            keeping your account protected.
          </p>

          <div className="mt-10 space-y-4 text-left bg-white/10 rounded-2xl border border-white/20 p-5 backdrop-blur-sm">
            <p className="text-sm flex items-center gap-2">
              <ShieldCheck className="h-4 w-4" />
              One-time reset links
            </p>
            <p className="text-sm flex items-center gap-2">
              <MailCheck className="h-4 w-4" />
              Email delivery with clear instructions
            </p>
            <p className="text-sm flex items-center gap-2">
              <Clock3 className="h-4 w-4" />
              Automatic expiry for safety
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ForgotPassword;

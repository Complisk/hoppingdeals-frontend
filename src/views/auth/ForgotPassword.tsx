"use client";
import { useMemo, useState } from "react";
import { useLocation } from "@/hooks/useLocation";
import { Mail, MailCheck } from "lucide-react";
import { toast } from "react-toastify";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import AuthShell, { AuthLink } from "@/components/shared/AuthShell";
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
    <>
      <Seo
        title="Forgot password"
        description="Request a secure password reset link for your Hopping Deals account."
        pathname={location.pathname}
        noindex
      />
      <AuthShell
        title="Reset your password"
        subtitle={`Enter the email on your ${accountType} account and we’ll send you a reset link.`}
        aside={{
          scene: "orbit",
          eyebrow: "Account recovery",
          title: "Back in within a minute.",
          points: [
            "The reset link works once, then expires.",
            "Check your spam folder if it doesn’t arrive.",
            "Your saved deals and settings stay as they are.",
          ],
        }}
        footer={
          <>
            <p>
              Remembered it? <AuthLink href={loginPath}>Back to log in</AuthLink>
            </p>
            <p>
              Need an account? <AuthLink href={registerPath}>Register</AuthLink>
            </p>
          </>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3.5 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10"
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
            variant="hero"
            size="lg"
            className="w-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Sending…" : "Send reset link"}
          </Button>
        </form>

        {requestSent && (
          <div
            role="status"
            className="mt-5 flex items-start gap-2.5 rounded-xl border border-success/40 bg-success/10 px-4 py-3 text-sm text-success"
          >
            <MailCheck className="mt-0.5 h-4 w-4 shrink-0" />
            Reset link sent. Check your inbox and spam folder.
          </div>
        )}
      </AuthShell>
    </>
  );
};

export default ForgotPassword;

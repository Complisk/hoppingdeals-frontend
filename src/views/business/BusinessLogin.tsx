"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Lock, ArrowLeft, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import AuthShell, { AuthLink } from "@/components/shared/AuthShell";
import { useAppDispatch, useAppSelector } from "@/hooks/use-redux";
import { useAuthService } from "@/services/authService";
import Seo from "@/components/seo/Seo";

const BusinessLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { isLoading, error } = useAppSelector((state) => state.auth);
  const { loginBusiness } = useAuthService();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await loginBusiness(dispatch, { email, password });
      if (response && response.business && response.token) {
      }
    } catch (err) {
      console.error("Login failed:", err);
      // Error is already mapped to Redux state and displayed via error state
    }
  };
  return (
    <>
      <Seo
        title="Business sign in"
        description="Sign in to your Hopping Deals business account to manage promotions and campaign performance."
        pathname="/business/login"
        noindex
      />
      <AuthShell
        title="Business portal"
        subtitle="Log in to create deals, manage templates and see how your promotions are doing."
        aside={{
          scene: "storefront",
          eyebrow: "For business owners",
          title: "Your deal, in front of the neighbors who’ll use it.",
          points: [
            "Design a coupon from a template or your own artwork.",
            "Pick the cities and dates it runs.",
            "See views and who tagged your business.",
          ],
        }}
        footer={
          <>
            <p>
              New to Hopping Deals? <AuthLink href="/business/register">Create a business account</AuthLink>
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 pt-2 transition-colors hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to the shopper site
            </Link>
          </>
        }
      >
        <form onSubmit={handleLogin} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="email">Business email</Label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3.5 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="business@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10"
                disabled={isLoading}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <Link
                href="/business/forgot-password"
                className="text-sm font-medium text-gold underline-offset-4 hover:underline"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3.5 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                placeholder="Your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10"
                disabled={isLoading}
                required
              />
            </div>
          </div>

          {error && (
            <div
              role="alert"
              className="flex gap-3 rounded-xl border border-destructive/40 bg-destructive/10 p-4"
            >
              <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-destructive" />
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">
                  Couldn’t log in
                </p>
                <p className="mt-1 text-sm text-muted-foreground">{error}</p>
              </div>
            </div>
          )}

          <Button
            type="submit"
            variant="hero"
            size="lg"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? "Logging in…" : "Log in"}
          </Button>
        </form>
      </AuthShell>
    </>
  );
};

export default BusinessLogin;

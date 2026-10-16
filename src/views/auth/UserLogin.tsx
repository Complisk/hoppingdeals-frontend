"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Lock, ArrowLeft } from "lucide-react";
import { toast } from "react-toastify";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import AuthShell, { AuthLink } from "@/components/shared/AuthShell";
import { useAppDispatch, useAppSelector } from "@/hooks/use-redux";
import { useAuthService } from "@/services/authService";
import Seo from "@/components/seo/Seo";

const UserLogin = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { isLoading } = useAppSelector((state) => state.auth);
  const { loginUser } = useAuthService();

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  // Validate form
  const validateForm = (): boolean => {
    const { email, password } = formData;

    if (!email.trim()) {
      toast.error("Please enter your email");
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email address");
      return false;
    }

    if (!password) {
      toast.error("Please enter your password");
      return false;
    }

    return true;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await loginUser(dispatch, {
        email: formData.email.trim(),
        password: formData.password,
      });

      if (response) {
        // Clear form
        setFormData({
          email: "",
          password: "",
        });

        if (response.accountType === "business") {
          router.push("/business/dashboard");
        } else if (response.accountType === "admin") {
          router.push("/admin/dashboard");
        } else {
          router.push("/");
        }
      } else {
        toast.error("Login failed. Please try again.");
      }
    } catch (err: any) {
      const errorMessage =
        err?.message ||
        err?.response?.data?.message ||
        "Login failed. Please try again.";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isLoaderActive = isLoading || isSubmitting;

  return (
    <>
      <Seo
        title="User sign in"
        description="Sign in to your Hopping Deals account to save favorite promotions and discover local deals."
        pathname="/auth/login"
        noindex
      />
      <AuthShell
        title="Welcome back"
        subtitle="Log in to save deals and tag your favorite local spots."
        aside={{
          scene: "bags",
          eyebrow: "For shoppers",
          title: "Local deals, straight from the owners.",
          points: [
            "Save the deals you want to use later.",
            "Tag businesses you’d like to see on Hopping Deals.",
            "Set your city once and see what’s running nearby.",
          ],
        }}
        footer={
          <>
            <p>
              New here? <AuthLink href="/auth/register">Create an account</AuthLink>
            </p>
            <p>
              Own a business? <AuthLink href="/business/login">Log in to the business portal</AuthLink>
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 pt-2 transition-colors hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              Keep browsing without an account
            </Link>
          </>
        }
      >
        <form onSubmit={handleLogin} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3.5 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleInputChange}
                className="pl-10"
                disabled={isLoaderActive}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <Link
                href="/auth/forgot-password"
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
                value={formData.password}
                onChange={handleInputChange}
                className="pl-10"
                disabled={isLoaderActive}
                required
              />
            </div>
          </div>

          <Button
            type="submit"
            variant="hero"
            size="lg"
            className="w-full"
            disabled={isLoaderActive}
          >
            {isLoaderActive ? "Logging in…" : "Log in"}
          </Button>
        </form>
      </AuthShell>
    </>
  );
};

export default UserLogin;

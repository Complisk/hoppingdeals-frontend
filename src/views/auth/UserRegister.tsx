"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Lock, ArrowLeft, User } from "lucide-react";
import { toast } from "react-toastify";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import AuthShell, { AuthLink } from "@/components/shared/AuthShell";
import { useAppDispatch, useAppSelector } from "@/hooks/use-redux";
import { useAuthService } from "@/services/authService";
import Seo from "@/components/seo/Seo";

const UserRegister = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { isLoading } = useAppSelector((state) => state.auth);
  const { registerUser } = useAuthService();

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
    const { fullName, email, password, confirmPassword } = formData;

    if (!fullName.trim()) {
      toast.error("Please enter your full name");
      return false;
    }

    if (fullName.trim().length < 3) {
      toast.error("Full name must be at least 3 characters");
      return false;
    }

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
      toast.error("Please enter a password");
      return false;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return false;
    }

    if (!confirmPassword) {
      toast.error("Please confirm your password");
      return false;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return false;
    }

    return true;
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await registerUser(dispatch, {
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        password: formData.password,
      });

      if (response && response.user) {
        // Clear form
        setFormData({
          fullName: "",
          email: "",
          password: "",
          confirmPassword: "",
        });
        router.push("/");
      } else {
        toast.error("Registration failed. Please try again.");
      }
    } catch (err: any) {
      const errorMessage =
        err?.message ||
        err?.response?.data?.message ||
        "Registration failed. Please try again.";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isLoaderActive = isLoading || isSubmitting;

  return (
    <>
      <Seo
        title="Create your account"
        description="Create a Hopping Deals account to follow local businesses and discover nearby promotions."
        pathname="/auth/register"
        noindex
      />
      <AuthShell
        title="Create your account"
        subtitle="Free for shoppers. Save deals and tag the places you love."
        aside={{
          scene: "bags",
          eyebrow: "For shoppers",
          title: "Never miss a deal from the places around you.",
          points: [
            "Save deals to your profile and come back to them later.",
            "Tag businesses so our team invites them to post deals.",
            "Browse by category, city or the business directory.",
          ],
        }}
        footer={
          <>
            <p>
              Already have an account? <AuthLink href="/auth/login">Log in</AuthLink>
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
        <form onSubmit={handleRegister} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full name</Label>
              <div className="relative">
                <User className="pointer-events-none absolute left-3.5 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="fullName"
                  autoComplete="name"
                  placeholder="Jordan Lee"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  className="pl-10"
                  disabled={isLoaderActive}
                  required
                />
              </div>
            </div>

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

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3.5 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  autoComplete="new-password"
                  placeholder="At least 6 characters"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="pl-10"
                  disabled={isLoaderActive}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm password</Label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3.5 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  placeholder="Repeat password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="pl-10"
                  disabled={isLoaderActive}
                  required
                />
              </div>
            </div>
          </div>

          <Button
            type="submit"
            variant="hero"
            size="lg"
            className="w-full"
            disabled={isLoaderActive}
          >
            {isLoaderActive ? "Creating account…" : "Create account"}
          </Button>
        </form>
      </AuthShell>
    </>
  );
};

export default UserRegister;

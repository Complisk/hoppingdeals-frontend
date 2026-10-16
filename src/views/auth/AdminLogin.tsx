"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, Lock, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import AuthShell, { AuthLink } from "@/components/shared/AuthShell";
import { useToast } from "@/hooks/use-toast";
import { useAppDispatch, useAppSelector } from "@/hooks/use-redux";
import useAuthService from "@/services/authService";
import Seo from "@/components/seo/Seo";

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();
  const { toast } = useToast();
  const dispatch = useAppDispatch();
  const { isLoading, error } = useAppSelector((state) => state.auth);
  const { loginAdmin } = useAuthService();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await loginAdmin(dispatch, { email, password });

      if (response) {
        toast({
          title: "Welcome Admin!",
          description: "You've successfully logged in.",
        });
        window.location.href = "/admin/dashboard";
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (err: any) {
      toast({
        title: "Login Failed",
        description:
          err.message || "Login failed. Please check your credentials.",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <Seo
        title="Admin sign in"
        description="Secure admin access for the Hopping Deals platform."
        pathname="/admin/login"
        noindex
      />
      <AuthShell
        title="Mission control"
        subtitle="Admin access for the Hopping Deals team."
        aside={{
          scene: "tower",
          eyebrow: "Hopping Deals admin",
          title: "Keep the night market running.",
          points: [
            "Review and approve promotions.",
            "Manage businesses, users, templates and roles.",
            "Answer support messages from shoppers and owners.",
          ],
        }}
        footer={
          <p>
            Not on the admin team? <AuthLink href="/auth/login">Go to shopper login</AuthLink>
          </p>
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
                autoComplete="username"
                placeholder="admin@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10"
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
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
            className="w-full"
            disabled={isLoading}
            size="lg"
          >
            {isLoading ? "Logging in…" : "Log in"}
          </Button>
        </form>
      </AuthShell>
    </>
  );
};

export default AdminLogin;

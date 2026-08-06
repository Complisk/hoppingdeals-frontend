"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Mail,
  Lock,
  ArrowRight,
  Sparkles,
  Shield,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Logo from "@/components/shared/Logo";
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
        window.location.href = "/admin/";
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
    <div className="min-h-screen flex bg-background">
      <Seo
        title="Admin sign in"
        description="Secure admin access for the Hopping Deals platform."
        pathname="/admin/login"
        noindex
      />
      {/* Left Side - Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full max-w-md"
        >
          <div className="mb-8">
            <div className="flex items-center gap-3">
              <Logo size="lg" />
              <Shield className="w-8 h-8 text-blue-600" />
            </div>
          </div>

          <h1 className="text-3xl font-bold text-foreground mb-2">
            Admin Portal
          </h1>
          <p className="text-muted-foreground mb-8">
            Sign in to manage promotions and templates
          </p>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
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
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                  disabled={isLoading}
                />
              </div>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex gap-3 p-4 bg-red-50 border border-red-200 rounded-lg"
              >
                <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-red-900">
                    Login Failed
                  </p>
                  <p className="text-sm text-red-700 mt-1">{error}</p>
                </div>
              </motion.div>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
              size="lg"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 animate-spin" />
                  Signing in...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Sign In
                  <ArrowRight className="w-4 h-4" />
                </span>
              )}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-8">
            Not an admin?{" "}
            <Link
              href="/login"
              className="text-primary font-semibold hover:underline"
            >
              User Login
            </Link>
          </p>
        </motion.div>
      </div>

      {/* Right Side - Illustration */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="hidden lg:flex flex-1 items-center justify-center bg-gradient-to-br from-blue-600 to-purple-600 p-8"
      >
        <div className="text-center text-white">
          <Shield className="w-24 h-24 mx-auto mb-6 opacity-80" />
          <h2 className="text-4xl font-bold mb-4">Admin Control Center</h2>
          <p className="text-lg opacity-90 max-w-md">
            Manage templates, monitor promotions, and oversee platform
            activities
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminLogin;

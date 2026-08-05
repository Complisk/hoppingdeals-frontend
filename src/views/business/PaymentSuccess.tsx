"use client";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { CheckCircle, ArrowRight } from "lucide-react";
import Spinner from "@/components/shared/Spinner";

const PaymentSuccess = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    const sessionIdParam = searchParams.get("session_id");
    if (sessionIdParam) {
      setSessionId(sessionIdParam);
    }
  }, [searchParams]);

  const handleContinue = () => {
    setIsRedirecting(true);
    setTimeout(() => {
      router.push("/business/promotions");
    }, 500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-primary/5 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="bg-card rounded-3xl border border-border shadow-2xl p-8 text-center space-y-6">
          {/* Success Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5, type: "spring" }}
            className="flex justify-center"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-green-500/20 rounded-full blur-xl animate-pulse" />
              <CheckCircle className="h-24 w-24 text-green-500 relative z-10" />
            </div>
          </motion.div>

          {/* Success Message */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-2"
          >
            <h1 className="text-3xl md:text-4xl font-bold text-foreground">
              Payment Successful!
            </h1>
            <p className="text-lg text-muted-foreground">
              Your promotion has been created and payment is confirmed.
            </p>
          </motion.div>

          {/* Details Card */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-muted/30 rounded-xl p-4 space-y-3 border border-border/50"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Status</span>
              <span className="px-3 py-1 bg-green-500/10 text-green-600 rounded-full text-sm font-medium">
                Active
              </span>
            </div>
            {sessionId && (
              <div className="flex items-start justify-between gap-2 pt-2 border-t border-border/50">
                <span className="text-sm text-muted-foreground">
                  Session ID
                </span>
                <span className="text-xs text-foreground font-mono truncate max-w-[200px]">
                  {sessionId}
                </span>
              </div>
            )}
          </motion.div>

          {/* Info Text */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="space-y-2"
          >
            <p className="text-sm text-muted-foreground">
              Your promotion is now active and will be displayed to your target
              audience.
            </p>
            <p className="text-xs text-muted-foreground">
              You can view and manage your promotion from the My Promotions
              page.
            </p>
          </motion.div>

          {/* Button */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Button
              onClick={handleContinue}
              variant="hero"
              className="w-full"
              disabled={isRedirecting}
            >
              {isRedirecting ? (
                <>
                  <Spinner className="h-4 w-4 mr-2 animate-spin"  />
                  Redirecting...
                </>
              ) : (
                <>
                  Go to My Promotions
                  <ArrowRight className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>
          </motion.div>

          {/* Footer Info */}
          <p className="text-xs text-muted-foreground pt-4 border-t border-border/50">
            Payment confirmation has been sent to your email.
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default PaymentSuccess;

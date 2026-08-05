"use client";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { CheckCircle, ArrowRight, Download } from "lucide-react";
import Spinner from "@/components/shared/Spinner";

const SubscriptionSuccess = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [subscriptionDetails, setSubscriptionDetails] = useState<any>(null);

  useEffect(() => {
    const sessionIdParam = searchParams.get("session_id");
    if (sessionIdParam) {
      setSessionId(sessionIdParam);
      // In a real app, you'd fetch subscription details from the backend using the session_id
    }
  }, [searchParams]);

  const handleContinue = () => {
    setIsRedirecting(true);
    setTimeout(() => {
      router.push("/business/dashboard");
    }, 500);
  };

  const handleDownloadReceipt = () => {
    // This would download the receipt - implement based on your backend
    console.log("Downloading receipt for session:", sessionId);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50/50 via-background to-blue-50/50 flex items-center justify-center p-4">
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
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="space-y-2"
          >
            <h1 className="text-3xl font-bold">Subscription Confirmed!</h1>
            <p className="text-muted-foreground text-lg">
              Your subscription has been activated successfully
            </p>
          </motion.div>

          {/* Details Box */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="bg-muted/30 rounded-xl p-6 space-y-3 text-sm"
          >
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Status</span>
              <span className="font-semibold text-green-600">Active</span>
            </div>
            {sessionId && (
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Session ID</span>
                <span className="font-mono text-xs bg-background px-2 py-1 rounded">
                  {sessionId.substring(0, 12)}...
                </span>
              </div>
            )}
            <div className="flex justify-between items-center pt-2 border-t border-border">
              <span className="text-muted-foreground">Confirmation</span>
              <span className="text-green-600">✓ Confirmed</span>
            </div>
          </motion.div>

          {/* Action Message */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.5 }}
            className="space-y-3"
          >
            <p className="text-sm text-muted-foreground">
              Your subscription features are now available in your dashboard.
              You can start using all included features immediately.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col gap-2 pt-4">
              <Button
                onClick={handleContinue}
                disabled={isRedirecting}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                {isRedirecting ? (
                  <Spinner className="h-4 w-4 animate-spin"  />
                ) : (
                  <>
                    Go to Dashboard
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </motion.div>

          {/* Footer Message */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.5 }}
            className="text-xs text-muted-foreground pt-4 border-t border-border"
          >
            A confirmation email has been sent to your registered email address.
          </motion.p>
        </div>
      </motion.div>
    </div>
  );
};

export default SubscriptionSuccess;

"use client";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { getStripe } from "@/lib/stripe";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Spinner from "@/components/shared/Spinner";

interface CheckoutState {
  clientSecret: string;
  amount: number;
  breakdown: {
    states: number;
    total: number;
  };
  promotionId: string;
}

/**
 * Inner payment form component with access to Stripe hooks
 */
const CheckoutForm = ({
  amount,
  breakdown,
}: {
  amount: number;
  breakdown: { states: number; total: number };
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false); // Track if PaymentElement is ready

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      setErrorMessage("Stripe has not loaded yet. Please wait...");
      return;
    }

    if (!isReady) {
      setErrorMessage("Payment form is still loading. Please wait...");
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);

    try {
      // Confirm payment with Payment Element
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/business/promotions`,
        },
        redirect: "if_required",
      });

      if (error) {
        console.error("Payment error:", error);
        setErrorMessage(error.message || "Payment failed");
        setIsProcessing(false);
      } else {
        // Payment succeeded
        toast({
          title: "Payment Successful!",
          description: "Your promotion has been created and payment completed.",
        });
        router.push("/business/promotions");
      }
    } catch (err: any) {
      console.error("Payment exception:", err);
      setErrorMessage(err.message || "An unexpected error occurred");
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-xl mx-auto">
      {/* Price Breakdown Card */}
      <div className="bg-card border rounded-xl p-6 space-y-4">
        <h3 className="text-lg font-semibold">Payment Summary</h3>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Additional States:</span>
            <span className="font-medium">${breakdown?.states}</span>
          </div>
          <div className="border-t pt-3 mt-3">
            <div className="flex justify-between font-semibold text-lg">
              <span>Total Amount:</span>
              <span className="text-primary">${breakdown?.total}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Element Card */}
      <div className="bg-card border rounded-xl p-6 space-y-4">
        <h3 className="text-lg font-semibold">Payment Details</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Enter your card information below. All fields are required.
        </p>
        <div className="min-h-[200px]">
          <PaymentElement
            onReady={() => {
              console.log("✅ PaymentElement is ready and mounted");
              setIsReady(true);
            }}
            onLoadError={(error) => {
              console.error("PaymentElement load error:", error);
              setErrorMessage(
                "Failed to load payment form. Please refresh the page.",
              );
            }}
            options={{
              layout: {
                type: "tabs",
                defaultCollapsed: false,
              },
              fields: {
                billingDetails: {
                  address: {
                    country: "auto",
                  },
                },
              },
            }}
          />
        </div>
        {!isReady && (
          <div className="text-sm text-muted-foreground flex items-center gap-2 mt-3">
            <Spinner className="h-4 w-4 animate-spin"  />
            Loading secure payment form...
          </div>
        )}
      </div>

      {/* Error Message */}
      {errorMessage && (
        <div className="bg-destructive/10 text-destructive text-sm p-4 rounded-lg border border-destructive/20">
          <strong>Payment Error:</strong> {errorMessage}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/business/promotions")}
          disabled={isProcessing}
          className="flex-1"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={!stripe || !elements || !isReady || isProcessing}
          className="flex-1"
        >
          {isProcessing ? (
            <>
              <Spinner className="mr-2 h-4 w-4 animate-spin"  />
              Processing Payment...
            </>
          ) : !isReady ? (
            <>
              <Spinner className="mr-2 h-4 w-4 animate-spin"  />
              Loading...
            </>
          ) : (
            <>
              <CheckCircle className="mr-2 h-4 w-4" />
              Pay ${amount}
            </>
          )}
        </Button>
      </div>
    </form>
  );
};

/**
 * Promotion Checkout Page
 * Dedicated page for completing promotion payment using Stripe Payment Element
 */
const PromotionCheckoutPage = () => {
  const router = useRouter();
  const [state, setState] = useState<CheckoutState | null>(null);
  const [ready, setReady] = useState(false);

  // Read checkout data passed from the promotion service via sessionStorage
  useEffect(() => {
    try {
      const raw = window.sessionStorage.getItem("checkoutState");
      if (raw) setState(JSON.parse(raw) as CheckoutState);
    } catch {
      setState(null);
    }
    setReady(true);
  }, []);

  // Redirect if no payment data
  useEffect(() => {
    if (ready && (!state || !state.clientSecret)) {
      router.push("/business/promotions");
    }
  }, [ready, state, router]);

  if (!state || !state.clientSecret) {
    return null;
  }
  const { clientSecret, amount, breakdown } = state;

  const options = useMemo(() => {
    return {
      clientSecret,
      appearance: {
        theme: "stripe" as const,
        variables: {
          colorPrimary: "#0F172A",
          borderRadius: "8px",
          fontFamily: "system-ui, sans-serif",
        },
      },
    };
  }, [clientSecret]);

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <Elements stripe={getStripe()} options={options}>
          <CheckoutForm amount={amount} breakdown={breakdown} />
        </Elements>
      </div>
    </div>
  );
};

export default PromotionCheckoutPage;

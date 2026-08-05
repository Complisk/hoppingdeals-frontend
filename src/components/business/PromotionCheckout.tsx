"use client";
import { useState } from "react";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { getStripe } from "@/lib/stripe";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import Spinner from "@/components/shared/Spinner";

interface PaymentFormProps {
  amount: number;
  breakdown: {
    states: number;
    total: number;
  };
  onSuccess: () => void;
  onCancel: () => void;
}

/**
 * Inner payment form component that has access to Stripe hooks
 */
const PaymentForm = ({
  amount,
  breakdown,
  onSuccess,
  onCancel,
}: PaymentFormProps) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
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
        redirect: "if_required", // Complete payment without redirect
      });

      if (error) {
        setErrorMessage(error.message || "Payment failed");
        setIsProcessing(false);
      } else {
        // Payment succeeded
        onSuccess();
      }
    } catch (err: any) {
      setErrorMessage(err.message || "An unexpected error occurred");
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Price Breakdown */}
      <div className="bg-muted/50 rounded-lg p-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">States:</span>
          <span className="font-medium">${breakdown.states.toFixed(2)}</span>
        </div>
        <div className="border-t pt-2 mt-2">
          <div className="flex justify-between font-semibold">
            <span>Total:</span>
            <span className="text-lg">${breakdown.total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Payment Element */}
      <div className="space-y-3">
        <label className="text-sm font-medium">Payment Details</label>
        <PaymentElement
          options={{
            layout: "tabs",
          }}
        />
      </div>

      {/* Error Message */}
      {errorMessage && (
        <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-lg">
          {errorMessage}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isProcessing}
          className="flex-1"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={!stripe || isProcessing}
          className="flex-1"
        >
          {isProcessing ? (
            <>
              <Spinner className="mr-2 h-4 w-4 animate-spin"  />
              Processing...
            </>
          ) : (
            `Pay $${amount.toFixed(2)}`
          )}
        </Button>
      </div>
    </form>
  );
};

interface PromotionCheckoutProps {
  isOpen: boolean;
  clientSecret: string;
  amount: number;
  breakdown: {
    states: number;
    total: number;
  };
  onSuccess: () => void;
  onCancel: () => void;
}

/**
 * Promotion Checkout Modal
 * Custom Stripe Payment Element UI for promotion add-on payments
 */
export const PromotionCheckout = ({
  isOpen,
  clientSecret,
  amount,
  breakdown,
  onSuccess,
  onCancel,
}: PromotionCheckoutProps) => {
  const options = {
    clientSecret,
    appearance: {
      theme: "stripe" as const,
      variables: {
        colorPrimary: "#0F172A",
      },
    },
  };

  console.log(options, "stripe options");
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Complete Your Promotion Payment</DialogTitle>
          <DialogDescription>
            Pay for your promotion add-ons to activate your campaign
          </DialogDescription>
        </DialogHeader>

        {clientSecret && (
          <Elements stripe={getStripe()} options={options}>
            <PaymentForm
              amount={amount}
              breakdown={breakdown}
              onSuccess={onSuccess}
              onCancel={onCancel}
            />
          </Elements>
        )}
      </DialogContent>
    </Dialog>
  );
};

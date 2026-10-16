"use client";
import { useApi } from "@/hooks/useApi";
import { toast } from "react-toastify";

/**
 * Payment Service - Centralized payment API layer
 * Uses the unified useApi hook for all payment API calls
 */
export const usePaymentService = () => {
  const { call } = useApi();

  // Create Stripe checkout session
  const createCheckoutSession = async (promotionId: string) => {
    try {
      const { response } = await call(
        "/payment/stripe",
        {
          method: "POST",
          body: { promotionId },
        },
        (res, success) => {
          if (success) {
            toast.success("Redirecting to payment...");
          }
        }
      );

      if (response) {
        return response;
      }
      return null;
    } catch (error) {
      console.error("Create checkout session error:", error);
      throw error;
    }
  };

  // Verify payment status
  const verifyPayment = async (sessionId: string) => {
    try {
      const { response } = await call(`/payment/verify/${sessionId}`, {
        method: "GET",
      });

      if (response) {
        return response;
      }
      return null;
    } catch (error) {
      console.error("Verify payment error:", error);
      throw error;
    }
  };

  return {
    createCheckoutSession,
    verifyPayment,
  };
};

export default usePaymentService;

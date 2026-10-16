"use client";
import fetchData from "@/utils/apiAction";
import { extractErrorMessage } from "@/utils/errorHandler";
import {
  setPromotionLoading,
  setPromotionSuccess,
  setPromotionError,
  setFeaturedPromotionsLoading,
  setFeaturedPromotionsSuccess,
  setFeaturedPromotionsError,
} from "@/store/promotionSlice";
import type { AppDispatch } from "@/store";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
export interface CreatePromotionPayload {
  templateId: string;
  imageUrl: string;
  text: {
    content: string;
    x: number;
    y: number;
    color: string;
    fontSize: string;
  };
  category: string;
  cities?: Array<{
    id: number;
    name: string;
    state_code: string;
    state_name: string;
    country_code: string;
  }>;
  states?: Array<{
    id: number;
    name: string;
    code: string;
    country_code: string;
  }>;
  runDate: Date | string;
  stopDate: Date | string;
  runTime: string;
  stopTime: string;
  scheduleStartAt?: string;
  scheduleEndAt?: string;
  scheduleEnabled?: boolean;
  scheduleTimezone?: string;
  price: number;
}

export interface CalculatePricePayload {
  runDate: string;
  stopDate: string;
  runTime: string;
  stopTime: string;
  cities?: string[];
  states?: string[];
}

type PromotionApiError = Error & {
  code?: string;
  conflictPromotionId?: string | number;
  statusCode?: number;
  raw?: any;
};

const buildPromotionApiError = (
  error: any,
  fallbackMessage: string,
): PromotionApiError => {
  const message =
    error?.message ||
    error?.error ||
    error?.data?.message ||
    fallbackMessage;
  const apiError = new Error(message) as PromotionApiError;
  apiError.code = error?.code || error?.data?.code;
  apiError.conflictPromotionId =
    error?.conflictPromotionId || error?.data?.conflictPromotionId;
  apiError.statusCode = error?.statusCode || error?.status;
  apiError.raw = error;
  return apiError;
};

/**
 * Promotion Service - Centralized promotion API layer
 * Uses the unified useApi hook for all promotion API calls
 * Now handles Redux dispatch internally for promotion state management
 */
export const usePromotionService = () => {
  const router = useRouter();
  const createPromotion = async (dispatch: AppDispatch, data: any) => {
    dispatch(setPromotionLoading());

    const { response, error } = await fetchData(
      "/business/promotions",
      {
        method: "POST",
        data,
      },
      () => {},
      "business",
    );

    if (error) {
      const apiError = buildPromotionApiError(error, "Failed to create promotion");
      dispatch(setPromotionError(apiError.message));
      toast.error(apiError.message || "Failed to create promotion");
      return { response: null, error: apiError };
    }

    dispatch(setPromotionSuccess("Promotion created successfully"));

    if (response.requiresPayment && response.clientSecret) {
      // Next.js has no router state objects; pass checkout data via sessionStorage
      if (typeof window !== "undefined") {
        window.sessionStorage.setItem(
          "checkoutState",
          JSON.stringify({
            clientSecret: response.clientSecret,
            amount: Number(
              response?.pricing?.total || response?.promotion?.price || 0,
            ),
            breakdown: {
              states: Number(response?.pricing?.stateCost || 0),
              total: Number(
                response?.pricing?.total || response?.promotion?.price || 0,
              ),
            },
            promotionId: response?.promotion?.id,
          }),
        );
      }
      router.push("/business/checkout");
      return { response, error: null };
    }

    toast.success(response?.message || "Promotion created successfully!");
    router.push("/business/promotions");
    return { response, error: null };
  };
  // Get all business promotions with optional search filter and status filter
  const getBusinessPromotions = async (
    search: string = "",
    status: string = "",
  ) => {
    try {
      const params = new URLSearchParams();
      if (search.trim()) {
        params.append("search", search);
      }
      if (status.trim()) {
        params.append("status", status);
      }

      const { response, error } = await fetchData(
        `/business/promotions?${params.toString()}`,
        {
          method: "GET",
        },
        () => {},
        "business",
      );

      if (error) {
        return { response: null, error };
      }

      const promotions = Array.isArray(response)
        ? response
        : response?.promotions || [];

      return {
        response: promotions,
        error: null,
        pagination: response?.pagination || null,
      };
    } catch (error) {
      console.error("Get business promotions error:", error);
      return { response: null, error };
    }
  };

  // Get single promotion
  const getPromotionById = async (promotionId: string) => {
    try {
      const { response, error } = await fetchData(
        `/business/promotions/${promotionId}`,
        {
          method: "GET",
        },
        () => {},
        "business",
      );

      if (error) {
        return { response: null, error: extractErrorMessage(error) };
      }

      if (response) {
        return { response: response?.promotion || response, error: null };
      }
      return { response: null, error: "Promotion not found" };
    } catch (error) {
      const errorMsg = (error as any)?.message || "Failed to load promotion";
      console.error("Get promotion error:", error);
      return { response: null, error: errorMsg };
    }
  };

  // Get all public promotions
  const getPromotions = async (filters) => {
    try {
      const params = new URLSearchParams();
      const stored = localStorage.getItem("userLocation");
      let location = null;
      try {
        location = stored ? JSON.parse(stored) : null;
      } catch {
        location = null;
      }
      console.log(stored, "check stored location please");
      if (
        !location ||
        location?.source == "browser" ||
        location?.source == "ip"
      ) {
        params.append("country_code", "US");
        if (filters.category) params.append("category", filters.category);
      } else if (filters) {
        if (filters.location) params.append("location", filters.location);
        if (filters.category) params.append("category", filters.category);
        if (filters.state) params.append("state", filters.state);
        if (filters.city) params.append("city", filters.city);
      }

      const response = await fetchData(
        `/promotions?${params.toString()}`,
        { method: "GET" },
        () => {},
        "business",
      );

      if (response) {
        return response?.response;
      }
      return null;
    } catch (error) {
      console.error("Get promotions error:", error);
      throw error;
    }
  };

  // Calculate promotion price
  const calculatePrice = async (data: CalculatePricePayload) => {
    try {
      const response = await fetchData(
        "/promotions/calculate-price",
        {
          method: "POST",
          body: data,
        },
        null,
        true,
      ); // Not protected - public endpoint

      if (response) {
        return response;
      }
      return null;
    } catch (error) {
      console.error("Calculate price error:", error);
      throw error;
    }
  };

  // Update promotion
  const updatePromotion = async (
    promotionId: string,
    data: Partial<CreatePromotionPayload>,
  ) => {
    try {
      const { response, error } = await fetchData(
        `/business/promotions/${promotionId}`,
        {
          method: "PUT",
          data: data,
        },
        () => {},
        "business",
      );

      if (error) {
        const apiError = buildPromotionApiError(error, "Failed to update promotion");
        toast.error(apiError.message || "Failed to update promotion");
        throw apiError;
      }

      if (response) {
        toast.success("Promotion updated successfully!");
        return response;
      }
      return null;
    } catch (error) {
      const apiError = buildPromotionApiError(
        error,
        "Failed to update promotion",
      );
      console.error("Update promotion error:", error);
      throw apiError;
    }
  };

  // Delete promotion
  const deletePromotion = async (promotionId: string) => {
    try {
      const { response, error } = await fetchData(
        `/business/promotions/${promotionId}`,
        {
          method: "DELETE",
        },
        () => {},
        "business",
      );

      if (error) {
        toast.error(error);
        throw new Error(error);
      }

      if (response) {
        toast.success("Promotion deleted successfully!");
        return response;
      }
      return null;
    } catch (error) {
      const errorMsg = (error as any)?.message || "Failed to delete promotion";
      console.error("Delete promotion error:", error);
      throw new Error(errorMsg);
    }
  };

  // Get templates
  const getTemplates = async () => {
    try {
      const response = await fetchData(
        "/templates",
        {
          method: "GET",
        },
        () => {},
        "business",
      ); // Not protected - public endpoint

      if (response) {
        return response;
      }
      return null;
    } catch (error) {
      console.error("Get templates error:", error);
      throw error;
    }
  };

  // Increment promotion clicks
  const incrementClick = async (promotionId: string) => {
    try {
      const response = await fetchData(`/promotions/${promotionId}/click`, {
        method: "POST",
      }); // Not protected - public endpoint

      if (response) {
        return response;
      }
      return null;
    } catch (error) {
      console.error("Increment click error:", error);
      throw error;
    }
  };

  // Get dashboard analytics data
  const getDashboardAnalytics = async () => {
    try {
      const response = await fetchData(
        "/business/dashboard",
        {
          method: "GET",
        },
        () => {},
        "business",
      );

      if (response) {
        return response;
      }
      return null;
    } catch (error) {
      console.error("Get dashboard analytics error:", error);
      throw error;
    }
  };

  // Activate promotion
  const activatePromotion = async (promotionId: string) => {
    try {
      const { response, error } = await fetchData(
        `/business/promotions/${promotionId}/activate`,
        {
          method: "POST",
        },
        () => {},
        "business",
      );

      if (error) {
        const errorMessage = extractErrorMessage(error);
        toast.error(errorMessage);
        throw new Error(errorMessage);
      }

      if (response) {
        toast.success("Promotion activated successfully!");
        return response;
      }
      return null;
    } catch (error) {
      const errorMessage = extractErrorMessage(error);
      console.error("Activate promotion error:", error);
      throw new Error(errorMessage);
    }
  };

  // Deactivate promotion
  const deactivatePromotion = async (promotionId: string) => {
    try {
      const { response, error } = await fetchData(
        `/business/promotions/${promotionId}/deactivate`,
        {
          method: "POST",
        },
        () => {},
        "business",
      );

      if (error) {
        const errorMessage = extractErrorMessage(error);
        toast.error(errorMessage);
        throw new Error(errorMessage);
      }

      if (response) {
        console.log(response, "check response of api please");
        toast.success("Promotion deactivated successfully!");
        return response;
      }
      return null;
    } catch (error) {
      const errorMessage = extractErrorMessage(error);
      console.error("Deactivate promotion error:", error);
      throw new Error(errorMessage);
    }
  };

  // Get featured promotions based on user location
  const getFeaturedPromotions = async (
    dispatch: AppDispatch,
    locationData?: {
      city?: string;
      state?: string;
      state_code?: string;
    },
  ) => {
    try {
      dispatch(setFeaturedPromotionsLoading());

      const params = new URLSearchParams();

      // Use provided location data or retrieve from localStorage
      const location =
        locationData ||
        (() => {
          try {
            const stored = localStorage.getItem("userLocation");
            return stored ? JSON.parse(stored) : null;
          } catch (e) {
            console.error("Error parsing stored location:", e);
            return null;
          }
        })();

      if (location) {
        if (location.state_code) {
          params.append("state", location.state_code);
        }
        if (location.city) {
          params.append("city", location.city);
        }
      }

      const { response, error } = await fetchData(
        `/promotions?${params.toString()}`,
        { method: "GET" },
        () => {},
        "business",
      );

      if (error) {
        const errorMessage = extractErrorMessage(error);
        dispatch(setFeaturedPromotionsError(errorMessage));
        console.error("Get featured promotions error:", error);
        return null;
      }

      if (response) {
        const promotions = Array.isArray(response)
          ? response
          : response.data || [];
        dispatch(setFeaturedPromotionsSuccess(promotions));
        return promotions;
      }

      dispatch(setFeaturedPromotionsSuccess([]));
      return [];
    } catch (error) {
      const errorMessage = extractErrorMessage(error);
      dispatch(setFeaturedPromotionsError(errorMessage));
      console.error("Get featured promotions error:", error);
      return null;
    }
  };

  return {
    createPromotion,
    getBusinessPromotions,
    getPromotionById,
    getPromotions,
    calculatePrice,
    updatePromotion,
    deletePromotion,
    getTemplates,
    incrementClick,
    getDashboardAnalytics,
    activatePromotion,
    deactivatePromotion,
    getFeaturedPromotions,
  };
};

export default usePromotionService;

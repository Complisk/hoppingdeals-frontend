"use client";
import fetchData from "@/utils/apiAction";
import { extractErrorMessage } from "@/utils/errorHandler";
import { toast } from "react-toastify";

export interface WishlistItem {
  id: string;
  userId?: string;
  businessId?: string;
  promotionId: string;
  status: "active" | "removed";
  savedAt: string;
  Promotion?: any;
}

export interface WishlistResponse {
  success: boolean;
  data: WishlistItem[];
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}

export interface WishlistCheckResponse {
  success: boolean;
  isInWishlist: boolean;
  data: WishlistItem | null;
}

export interface WishlistStatsResponse {
  success: boolean;
  data: {
    totalSaves: number;
    userSaves: number;
    businessSaves: number;
  };
}

/**
 * Wishlist Service - Centralized wishlist API layer
 * Handles all wishlist operations for users and businesses
 */

/**
 * Add a promotion to wishlist
 * @param promotionId - UUID of the promotion to save
 * @param role - User role ('user' or 'business')
 * @returns Promise with the created wishlist entry
 */
export const addToWishlist = async (
  promotionId: string,
  role: "user" | "business" = "user",
) => {
  try {
    const { response, error } = await fetchData(
      "/wishlist",
      {
        method: "POST",
        data: { promotionId },
      },
      null,
      role,
    );

    if (error) {
      toast.error(error?.message || "Failed to add to wishlist");
      return {
        success: false,
        error: error?.message || "Failed to add to wishlist",
      };
    }

    if (response?.success) {
      toast.success("Added to wishlist!");
      return { success: true, data: response.data };
    }

    return { success: false, error: "Failed to add to wishlist" };
  } catch (err) {}
};

/**
 * Remove a promotion from wishlist
 * @param promotionId - UUID of the promotion to remove
 * @param role - User role ('user' or 'business')
 * @returns Promise with removal status
 */
export const removeFromWishlist = async (
  promotionId: string,
  role: "user" | "business" = "user",
) => {
  try {
    const { response, error } = await fetchData(
      `/wishlist/${promotionId}`,
      {
        method: "DELETE",
      },
      null,
      role,
    );

    if (error) {
      const errorMsg = extractErrorMessage(error);
      toast.error(errorMsg || "Failed to remove from wishlist");
      return { success: false, error: errorMsg };
    }

    if (response?.success) {
      toast.success("Removed from wishlist");
      return { success: true };
    }

    return { success: false, error: "Failed to remove from wishlist" };
  } catch (err) {
    const errorMsg = extractErrorMessage(err);
    toast.error(errorMsg || "Error removing from wishlist");
    return { success: false, error: errorMsg };
  }
};

/**
 * Get user/business wishlist with pagination
 * @param page - Page number (default: 1)
 * @param limit - Items per page (default: 10)
 * @param role - User role ('user' or 'business')
 * @returns Promise with wishlist items and pagination info
 */
export const getWishlist = async (
  page: number = 1,
  limit: number = 10,
  role: "user" | "business" = "user",
): Promise<WishlistResponse | { success: false; error: string }> => {
  try {
    const { response, error } = await fetchData(
      `/wishlist?page=${page}&limit=${limit}`,
      {
        method: "GET",
      },
      null,
      role,
    );

    if (error) {
      const errorMsg = extractErrorMessage(error);
      return { success: false, error: errorMsg };
    }

    if (response?.success) {
      return {
        success: true,
        data: response.data,
        pagination: response.pagination,
      };
    }

    return { success: false, error: "Failed to fetch wishlist" };
  } catch (err) {
    const errorMsg = extractErrorMessage(err);
    return { success: false, error: errorMsg };
  }
};

/**
 * Check if a promotion is in wishlist
 * @param promotionId - UUID of the promotion to check
 * @param role - User role ('user' or 'business')
 * @returns Promise with wishlist status
 */
export const checkWishlistStatus = async (
  promotionId: string,
  role: "user" | "business" = "user",
): Promise<WishlistCheckResponse | { success: false; error: string }> => {
  try {
    const { response, error } = await fetchData(
      `/wishlist/check/${promotionId}`,
      {
        method: "GET",
      },
      null,
      role,
    );

    if (error) {
      const errorMsg = extractErrorMessage(error);
      return { success: false, error: errorMsg };
    }

    if (response?.success) {
      return {
        success: true,
        isInWishlist: response.isInWishlist,
        data: response.data,
      };
    }

    return { success: false, error: "Failed to check wishlist status" };
  } catch (err) {
    const errorMsg = extractErrorMessage(err);
    return { success: false, error: errorMsg };
  }
};

/**
 * Get popular/trending promotions
 * @param limit - Number of top promotions (default: 10)
 * @returns Promise with popular promotions
 */
export const getPopularPromotions = async (
  limit: number = 10,
): Promise<{ success: boolean; data?: any[]; error?: string }> => {
  try {
    const { response, error } = await fetchData(
      `/wishlist/popular?limit=${limit}`,
      {
        method: "GET",
      },
      null,
      "user",
    );

    if (error) {
      const errorMsg = extractErrorMessage(error);
      return { success: false, error: errorMsg };
    }

    if (response?.success) {
      return { success: true, data: response.data };
    }

    return { success: false, error: "Failed to fetch popular promotions" };
  } catch (err) {
    const errorMsg = extractErrorMessage(err);
    return { success: false, error: errorMsg };
  }
};

/**
 * Get wishlist statistics (Business only)
 * @param role - User role (must be 'business')
 * @returns Promise with wishlist statistics
 */
export const getWishlistStats = async (
  role: "business" = "business",
): Promise<WishlistStatsResponse | { success: false; error: string }> => {
  try {
    const { response, error } = await fetchData(
      "/wishlist/stats/business",
      {
        method: "GET",
      },
      null,
      role,
    );

    if (error) {
      const errorMsg = extractErrorMessage(error);
      return { success: false, error: errorMsg };
    }

    if (response?.success) {
      return { success: true, data: response.data };
    }

    return { success: false, error: "Failed to fetch wishlist stats" };
  } catch (err) {
    const errorMsg = extractErrorMessage(err);
    return { success: false, error: errorMsg };
  }
};

/**
 * Clear entire wishlist
 * @param role - User role ('user' or 'business')
 * @returns Promise with clear status
 */
export const clearWishlist = async (role: "user" | "business" = "user") => {
  try {
    const { response, error } = await fetchData(
      "/wishlist/clear-all",
      {
        method: "DELETE",
      },
      null,
      role,
    );

    if (error) {
      const errorMsg = extractErrorMessage(error);
      toast.error(errorMsg || "Failed to clear wishlist");
      return { success: false, error: errorMsg };
    }

    if (response?.success) {
      toast.success("Wishlist cleared");
      return { success: true };
    }

    return { success: false, error: "Failed to clear wishlist" };
  } catch (err) {}
};

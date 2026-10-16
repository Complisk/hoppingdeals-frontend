"use client";
import fetchData from "@/utils/apiAction";
import { extractErrorMessage } from "@/utils/errorHandler";
import { toast } from "react-toastify";

export type TaggerRole = "user" | "business";

export interface BusinessTaggingRow {
  id: string;
  taggerUserId?: string | null;
  taggerBusinessId?: string | null;
  targetPlaceId: string;
  targetName: string;
  targetAddress?: string | null;
  targetIconMaskBaseUri?: string | null;
  targetIconBackgroundColor?: string | null;
  targetPrimaryPhotoUrl?: string | null;
  targetRating?: number | null;
  targetUserRatingsTotal?: number | null;
  targetWebsite?: string | null;
  targetGoogleUrl?: string | null;
  targetFormattedPhoneNumber?: string | null;
  targetInternationalPhoneNumber?: string | null;
  targetTypes?: string[] | null;
  targetReviews?: any[] | null;
  detailsFetchedAt?: string | null;
  targetEmail?: string | null;
  createdAt: string;
}

export interface Pagination {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

export interface ReceivedTaggerRow {
  taggerType: "user" | "business" | "unknown";
  taggedAt: string;
  tagger: any;
}

export const createBusinessTagging = async (
  role: TaggerRole,
  payload: {
    placeId: string;
    name: string;
    address?: string;
    iconMaskBaseUri?: string;
    iconBackgroundColor?: string;
    primaryPhotoUrl?: string;
    rating?: number;
    userRatingsTotal?: number;
    website?: string;
    url?: string;
    formattedPhoneNumber?: string;
    internationalPhoneNumber?: string;
    types?: string[];
    reviews?: any[];
    email?: string;
  },
) => {
  try {
    const { response, error } = await fetchData(
      "/business-tagging",
      {
        method: "POST",
        data: payload,
      },
      null,
      role,
    );

    if (error) {
      const msg = extractErrorMessage(error);
      toast.error(msg || "Failed to tag business");
      return { success: false, error: msg };
    }

    if (response?.success) {
      toast.success("Business tagged");
      return { success: true, data: response.data as BusinessTaggingRow };
    }

    return { success: false, error: "Failed to tag business" };
  } catch (err) {
    const msg = extractErrorMessage(err);
    toast.error(msg || "Failed to tag business");
    return { success: false, error: msg };
  }
};

export const listMyBusinessTaggings = async (
  role: TaggerRole,
  page: number = 1,
  limit: number = 50,
) => {
  try {
    const { response, error } = await fetchData(
      `/business-tagging/mine?page=${page}&limit=${limit}`,
      { method: "GET" },
      null,
      role,
    );

    if (error) {
      const msg = extractErrorMessage(error);
      return { success: false, error: msg };
    }

    if (response?.success) {
      return {
        success: true,
        data: (response.data || []) as BusinessTaggingRow[],
        pagination: response.pagination as Pagination,
      };
    }

    return { success: false, error: "Failed to fetch taggings" };
  } catch (err) {
    const msg = extractErrorMessage(err);
    return { success: false, error: msg };
  }
};

export const deleteBusinessTagging = async (role: TaggerRole, id: string) => {
  try {
    const { response, error } = await fetchData(
      `/business-tagging/${id}`,
      { method: "DELETE" },
      null,
      role,
    );

    if (error) {
      const msg = extractErrorMessage(error);
      toast.error(msg || "Failed to remove tag");
      return { success: false, error: msg };
    }

    if (response?.success) {
      toast.success("Tag removed");
      return { success: true };
    }

    return { success: false, error: "Failed to remove tag" };
  } catch (err) {
    const msg = extractErrorMessage(err);
    toast.error(msg || "Failed to remove tag");
    return { success: false, error: msg };
  }
};

export const getReceivedTaggingSummary = async () => {
  try {
    const { response, error } = await fetchData(
      "/business-tagging/received/summary",
      { method: "GET" },
      null,
      "business",
    );

    if (error) {
      const msg = extractErrorMessage(error);
      return { success: false, error: msg };
    }

    if (response?.success) {
      return { success: true, data: response.data as any };
    }

    return { success: false, error: "Failed to fetch summary" };
  } catch (err) {
    const msg = extractErrorMessage(err);
    return { success: false, error: msg };
  }
};

export const listReceivedTaggers = async (page: number = 1, limit: number = 25) => {
  try {
    const { response, error } = await fetchData(
      `/business-tagging/received/taggers?page=${page}&limit=${limit}`,
      { method: "GET" },
      null,
      "business",
    );

    if (error) {
      const msg = extractErrorMessage(error);
      return { success: false, error: msg };
    }

    if (response?.success) {
      return {
        success: true,
        data: (response.data || []) as ReceivedTaggerRow[],
        pagination: response.pagination as Pagination,
      };
    }

    return { success: false, error: "Failed to fetch taggers" };
  } catch (err) {
    const msg = extractErrorMessage(err);
    return { success: false, error: msg };
  }
};

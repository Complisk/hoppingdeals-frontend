"use client";
import { toast } from "react-toastify";
import fetchData from "@/utils/apiAction";
import { extractErrorMessage } from "@/utils/errorHandler";
import {
  setAdminLoading,
  setAdminSuccess,
  setAdminError,
  setDashboardData,
} from "@/store/adminSlice";
import type { AppDispatch } from "@/store";

/**
 * Admin Service - Centralized admin API layer
 * Uses the unified useApi hook for all admin API calls
 * Handles Redux dispatch internally for admin state management
 */
export const useAdminService = () => {
  // Get admin dashboard statistics
  const getDashboardStats = async (dispatch: AppDispatch) => {
    try {
      dispatch(setAdminLoading());

      const { response, error } = await fetchData(
        "/admin/dashboard",
        {
          method: "GET",
        },
        () => {},
        "admin",
      );

      if (error) {
        const errorMessage = extractErrorMessage(error);
        dispatch(setAdminError(errorMessage));
        throw new Error(errorMessage);
      }

      if (response) {
        dispatch(setDashboardData(response));
        dispatch(setAdminSuccess("Dashboard data fetched"));
        return response;
      }
      return null;
    } catch (error) {
      const errorMessage = extractErrorMessage(error);
      console.error("Get dashboard stats error:", error);
      dispatch(setAdminError(errorMessage));
      throw new Error(errorMessage);
    }
  };
  const createPromotionForBusiness = async (businessId: string, data: any) => {
    try {
      const { response, error } = await fetchData(
        `/admin/businesses/${businessId}/promotions`,
        {
          method: "POST",
          data,
        },
        () => {},
        "admin",
      );

      if (error) {
        const errorMessage = extractErrorMessage(error);
        toast.error(errorMessage);
        throw new Error(errorMessage);
      }

      if (response) {
        toast.success("Promotion created successfully for business");
        return response;
      }
      return null;
    } catch (error) {
      const errorMessage = extractErrorMessage(error);
      console.error("Create promotion (admin) error:", error);
      throw new Error(errorMessage);
    }
  };

  // Get all users with pagination and filters
  const getUsers = async (
    page: number = 1,
    limit: number = 10,
    search?: string,
    role?: string,
    status?: string,
  ) => {
    try {
      const params = new URLSearchParams();
      params.append("page", page.toString());
      params.append("limit", limit.toString());
      if (search?.trim()) params.append("search", search);
      if (role?.trim()) params.append("role", role);
      if (status?.trim()) params.append("status", status);

      const { response } = await fetchData(
        `/admin/users?${params.toString()}`,
        {
          method: "GET",
        },
        () => {},
        "admin",
      );

      if (response) {
        return response;
      }
      return null;
    } catch (error) {
      console.error("Get users error:", error);
      throw error;
    }
  };

  // Update user status
  const updateUserStatus = async (userId: string, newStatus: string) => {
    try {
      const { response, error } = await fetchData(
        `/admin/users/${userId}/status`,
        {
          method: "PUT",
          data: { status: newStatus },
        },
        () => {},
        "admin",
      );

      if (error) {
        const errorMessage = extractErrorMessage(error);
        toast.error(errorMessage);
        throw new Error(errorMessage);
      }

      if (response) {
        const successMessage = response?.message || "User status updated";
        toast.success(successMessage);
        return response;
      }
      return null;
    } catch (error) {
      const errorMessage = extractErrorMessage(error);
      console.error("Update user status error:", error);
      throw new Error(errorMessage);
    }
  };

  // Get all businesses with pagination and filters
  const getBusinesses = async (
    page: number = 1,
    limit: number = 10,
    search?: string,
    status?: string,
    autoApprove?: boolean,
  ) => {
    try {
      const params = new URLSearchParams();
      params.append("page", page.toString());
      params.append("limit", limit.toString());
      if (search?.trim()) params.append("search", search);
      if (status?.trim()) params.append("status", status);
      if (autoApprove !== undefined)
        params.append("autoApprove", autoApprove.toString());

      const { response } = await fetchData(
        `/admin/businesses?${params.toString()}`,
        {
          method: "GET",
        },
        () => {},
        "admin",
      );

      if (response) {
        return response;
      }
      return null;
    } catch (error) {
      console.error("Get businesses error:", error);
      throw error;
    }
  };

  // Update business status
  const updateBusinessStatus = async (
    businessId: string,
    newStatus: string,
  ) => {
    try {
      const { response, error } = await fetchData(
        `/admin/businesses/${businessId}/status`,
        {
          method: "PUT",
          data: { status: newStatus },
        },
        () => {},
        "admin",
      );

      if (error) {
        const errorMessage = extractErrorMessage(error);
        toast.error(errorMessage);
        throw new Error(errorMessage);
      }

      if (response) {
        const successMessage = response?.message || "Business status updated";
        toast.success(successMessage);
        return response;
      }
      return null;
    } catch (error) {
      const errorMessage = extractErrorMessage(error);
      console.error("Update business status error:", error);
      throw new Error(errorMessage);
    }
  };

  // Toggle business auto-approve setting
  const toggleBusinessAutoApprove = async (
    businessId: string,
    autoApprove: boolean,
  ) => {
    try {
      const { response, error } = await fetchData(
        `/admin/businesses/${businessId}/toggle-auto-approve`,
        {
          method: "PUT",
          data: { autoApprovePromotions: autoApprove },
        },
        () => {},
        "admin",
      );

      if (error) {
        const errorMessage = extractErrorMessage(error);
        toast.error(errorMessage);
        throw new Error(errorMessage);
      }

      if (response) {
        const successMessage =
          response?.message || "Business auto-approve setting updated";
        toast.success(successMessage);
        return response;
      }
      return null;
    } catch (error) {
      const errorMessage = extractErrorMessage(error);
      console.error("Toggle auto-approve error:", error);
      throw new Error(errorMessage);
    }
  };

  const downloadBusinessesCsv = async (params: {
    search?: string;
    status?: string;
    autoApprove?: boolean;
    limit?: number;
  }) => {
    try {
      const baseUrl =
        process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api";
      const token = localStorage.getItem("adminToken");

      const query = new URLSearchParams();
      if (params.search?.trim()) query.set("search", params.search.trim());
      if (params.status?.trim()) query.set("status", params.status.trim());
      if (params.autoApprove !== undefined) {
        query.set("autoApprove", String(params.autoApprove));
      }
      if (params.limit && Number.isFinite(Number(params.limit))) {
        query.set("limit", String(Math.floor(Number(params.limit))));
      }

      const response = await fetch(
        `${baseUrl}/admin/businesses/export?${query.toString()}`,
        {
          method: "GET",
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
          credentials: "include",
        },
      );

      if (!response.ok) {
        let message = "Business CSV export failed";
        try {
          const data = await response.json();
          message = data?.message || message;
        } catch {}
        toast.error(message);
        throw new Error(message);
      }

      const blob = await response.blob();
      const fileName =
        response.headers
          .get("content-disposition")
          ?.match(/filename="([^"]+)"/)?.[1] || "businesses.csv";

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (error) {
      const errorMessage = extractErrorMessage(error);
      console.error("Download businesses CSV error:", error);
      throw new Error(errorMessage);
    }
  };

  const grantBusinessSubscription = async (
    businessId: string,
    payload: { templateId?: string; extendMonths?: number },
  ) => {
    try {
      const { response, error } = await fetchData(
        `/admin/businesses/${businessId}/subscription`,
        {
          method: "POST",
          data: payload,
        },
        () => {},
        "admin",
      );

      if (error) {
        const errorMessage = extractErrorMessage(error);
        toast.error(errorMessage);
        throw new Error(errorMessage);
      }

      toast.success(response?.message || "Subscription updated successfully");
      return response;
    } catch (error) {
      const errorMessage = extractErrorMessage(error);
      console.error("Grant business subscription error:", error);
      throw new Error(errorMessage);
    }
  };

  // Get all promotions with pagination and filters
  const getPromotions = async (
    page: number = 1,
    limit: number = 10,
    status?: string,
    search?: string,
  ) => {
    try {
      const params = new URLSearchParams();
      params.append("page", page.toString());
      params.append("limit", limit.toString());
      if (status?.trim()) params.append("status", status);
      if (search?.trim()) params.append("search", search);

      const { response } = await fetchData(
        `/admin/promotions?${params.toString()}`,
        {
          method: "GET",
        },
        () => {},
        "admin",
      );

      if (response) {
        return response;
      }
      return null;
    } catch (error) {
      console.error("Get promotions error:", error);
      throw error;
    }
  };

  // Get single promotion
  const getPromotion = async (promotionId: string) => {
    try {
      const { response, error } = await fetchData(
        `/admin/promotions/${promotionId}`,
        {
          method: "GET",
        },
        () => {},
        "admin",
      );

      if (error) {
        const errorMessage = extractErrorMessage(error);
        toast.error(errorMessage);
        throw new Error(errorMessage);
      }

      if (response) {
        return response.promotion || response;
      }
      return null;
    } catch (error) {
      const errorMessage = extractErrorMessage(error);
      console.error("Get promotion error:", error);
      throw new Error(errorMessage);
    }
  };

  // Update promotion
  const updatePromotion = async (promotionId: string, data: any) => {
    try {
      const { response, error } = await fetchData(
        `/admin/promotions/${promotionId}`,
        {
          method: "PUT",
          data,
        },
        () => {},
        "admin",
      );

      if (error) {
        const errorMessage = extractErrorMessage(error);
        toast.error(errorMessage);
        throw new Error(errorMessage);
      }

      if (response) {
        const successMessage = response?.message || "Promotion updated";
        toast.success(successMessage);
        return response;
      }
      return null;
    } catch (error) {
      const errorMessage = extractErrorMessage(error);
      console.error("Update promotion error:", error);
      throw new Error(errorMessage);
    }
  };

  // Update promotion status (approve, reject, deactivate)
  const updatePromotionStatus = async (
    promotionId: string,
    newStatus: string,
  ) => {
    try {
      const { response, error } = await fetchData(
        `/admin/promotions/${promotionId}/status`,
        {
          method: "PUT",
          data: { status: newStatus },
        },
        () => {},
        "admin",
      );

      if (error) {
        const errorMessage = extractErrorMessage(error);
        toast.error(errorMessage);
        throw new Error(errorMessage);
      }

      if (response) {
        const successMessage = response?.message || "Promotion status updated";
        toast.success(successMessage);
        return response;
      }
      return null;
    } catch (error) {
      const errorMessage = extractErrorMessage(error);
      console.error("Update promotion status error:", error);
      throw new Error(errorMessage);
    }
  };

  // Run promotion (activate this promotion and deactivate others for the business)
  const runPromotion = async (promotionId: string) => {
    try {
      const { response, error } = await fetchData(
        `/admin/promotions/${promotionId}/run`,
        {
          method: "POST",
        },
        () => {},
        "admin",
      );

      if (error) {
        const errorMessage = extractErrorMessage(error);
        toast.error(errorMessage);
        throw new Error(errorMessage);
      }

      if (response) {
        const successMessage = "Promotion activated";
        toast.success(successMessage);
        return response;
      }
      return null;
    } catch (error) {
      const errorMessage = extractErrorMessage(error);
      console.error("Run promotion error:", error);
      throw new Error(errorMessage);
    }
  };

  // Delete promotion
  const deletePromotion = async (promotionId: string) => {
    try {
      const { response, error } = await fetchData(
        `/admin/promotions/${promotionId}`,
        {
          method: "DELETE",
        },
        () => {},
        "admin",
      );

      if (error) {
        const errorMessage = extractErrorMessage(error);
        toast.error(errorMessage);
        throw new Error(errorMessage);
      }

      if (response) {
        const successMessage =
          response?.message || "Promotion deleted successfully";
        toast.success(successMessage);
        return response;
      }
      return null;
    } catch (error) {
      const errorMessage = extractErrorMessage(error);
      console.error("Delete promotion error:", error);
      throw new Error(errorMessage);
    }
  };

  const getBusinessTaggers = async (page = 1, limit = 25) => {
    try {
      const { response, error } = await fetchData(
        `/admin/business-tagging/taggers?page=${page}&limit=${limit}`,
        { method: "GET" },
        () => {},
        "admin",
      );

      if (error) {
        const errorMessage = extractErrorMessage(error);
        toast.error(errorMessage);
        throw new Error(errorMessage);
      }

      return response;
    } catch (error) {
      const errorMessage = extractErrorMessage(error);
      console.error("Get business taggers error:", error);
      throw new Error(errorMessage);
    }
  };

  const getBusinessTaggings = async (params: {
    taggerType?: "user" | "business";
    taggerId?: string;
    page?: number;
    limit?: number;
    q?: string;
    placeId?: string;
  }) => {
    try {
      const query = new URLSearchParams();
      if (params.taggerType) query.set("taggerType", params.taggerType);
      if (params.taggerId) query.set("taggerId", params.taggerId);
      if (params.q) query.set("q", params.q);
      if (params.placeId) query.set("placeId", params.placeId);
      query.set("page", String(params.page || 1));
      query.set("limit", String(params.limit || 50));

      const { response, error } = await fetchData(
        `/admin/business-tagging/taggings?${query.toString()}`,
        { method: "GET" },
        () => {},
        "admin",
      );

      if (error) {
        const errorMessage = extractErrorMessage(error);
        toast.error(errorMessage);
        throw new Error(errorMessage);
      }

      return response;
    } catch (error) {
      const errorMessage = extractErrorMessage(error);
      console.error("Get business taggings error:", error);
      throw new Error(errorMessage);
    }
  };

  const getTaggedBusinesses = async (params: {
    page?: number;
    limit?: number;
    q?: string;
  }) => {
    try {
      const query = new URLSearchParams();
      query.set("page", String(params.page || 1));
      query.set("limit", String(params.limit || 25));
      if (params.q?.trim()) query.set("q", params.q.trim());

      const { response, error } = await fetchData(
        `/admin/business-tagging/businesses?${query.toString()}`,
        { method: "GET" },
        () => {},
        "admin",
      );

      if (error) {
        const errorMessage = extractErrorMessage(error);
        toast.error(errorMessage);
        throw new Error(errorMessage);
      }

      return response;
    } catch (error) {
      const errorMessage = extractErrorMessage(error);
      console.error("Get tagged businesses error:", error);
      throw new Error(errorMessage);
    }
  };

  const getTaggedBusinessDetails = async (placeId: string) => {
    try {
      const query = new URLSearchParams();
      query.set("placeId", placeId);

      const { response, error } = await fetchData(
        `/admin/business-tagging/business-details?${query.toString()}`,
        { method: "GET" },
        () => {},
        "admin",
      );

      if (error) {
        const errorMessage = extractErrorMessage(error);
        toast.error(errorMessage);
        throw new Error(errorMessage);
      }

      return response;
    } catch (error) {
      const errorMessage = extractErrorMessage(error);
      console.error("Get tagged business details error:", error);
      throw new Error(errorMessage);
    }
  };

  return {
    getDashboardStats,
    getUsers,
    updateUserStatus,
    createPromotionForBusiness,
    getBusinesses,
    downloadBusinessesCsv,
    updateBusinessStatus,
    toggleBusinessAutoApprove,
    grantBusinessSubscription,
    getPromotions,
    getPromotion,
    updatePromotion,
    updatePromotionStatus,
    runPromotion,
    deletePromotion,
    getBusinessTaggers,
    getBusinessTaggings,
    getTaggedBusinesses,
    getTaggedBusinessDetails,
  };
};
/**
 * Direct admin service functions (not using hooks)
 * These are used for role management and other admin operations
 */
const adminService = {
  // Get all admin users
  getAllAdminUsers: async (page = 1, limit = 10, search = "") => {
    try {
      const params = new URLSearchParams();
      params.append("page", page.toString());
      params.append("limit", limit.toString());
      if (search) params.append("search", search);

      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_BASE_URL
        }/admin/roles/admins?${params.toString()}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("userToken")}`,
          },
        },
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to fetch admin users");
      }

      const data = await response.json();
      return data.admins;
    } catch (error: any) {
      console.error("Get admin users error:", error);
      throw error;
    }
  },

  // Create new admin user
  createAdminUser: async (adminData: {
    fullName: string;
    email: string;
    password: string;
    isSuperAdmin?: boolean;
    roleIds?: string[];
  }) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/roles/create-admin`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("userToken")}`,
          },
          body: JSON.stringify(adminData),
        },
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to create admin user");
      }

      const data = await response.json();
      return data.user;
    } catch (error: any) {
      console.error("Create admin user error:", error);
      throw error;
    }
  },

  createPromotionForBusiness: async (data: any) => {
    try {
      const { response, error } = await fetchData(
        `/admin/promotions`,
        {
          method: "POST",
          data,
        },
        () => {},
        "admin",
      );

      if (error) {
        const errorMessage = extractErrorMessage(error);
        toast.error(errorMessage);
        throw new Error(errorMessage);
      }

      if (response) {
        return response;
      }
      return null;
    } catch (error) {
      const errorMessage = extractErrorMessage(error);
      console.error("Create promotion (admin) error:", error);
      throw new Error(errorMessage);
    }
  },
  getPromotionById: async (promotionId: string) => {
    try {
      const { response, error } = await fetchData(
        `/admin/promotions/${promotionId}`,
        {
          method: "GET",
        },
        null,
        "admin",
      );
      return response?.promotion;
    } catch (error: any) {
      console.error("Get promotion (admin) error:", error);
      throw error;
    }
  },
  updatePromotion: async (promotionId: string, data: any) => {
    try {
      const { response } = await fetchData(
        `/admin/promotions/${promotionId}`,
        {
          method: "PUT",

          data: data,
        },
        null,
        "admin",
      );

      const dataRes = response;
      return dataRes.promotion || dataRes;
    } catch (error: any) {
      console.error("Update promotion (admin) error:", error);
      throw error;
    }
  },
  runPromotion: async (promotionId: string) => {
    try {
      const { response, error } = await fetchData(
        `/admin/promotions/${promotionId}/run`,
        {
          method: "POST",
        },
        () => {},
        "admin",
      );

      if (error) {
        const errorMessage = extractErrorMessage(error);
        toast.error(errorMessage);
        throw new Error(errorMessage);
      }

      if (response) {
        toast.success("Promotion activated for business");
        return response;
      }
      return null;
    } catch (error) {
      const errorMessage = extractErrorMessage(error);
      console.error("Run promotion (admin) error:", error);
      throw new Error(errorMessage);
    }
  },
  // Get all roles
  getAllRoles: async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/roles/roles`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("userToken")}`,
          },
        },
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to fetch roles");
      }

      const data = await response.json();
      return data;
    } catch (error: any) {
      console.error("Get roles error:", error);
      throw error;
    }
  },

  // Get all permissions
  getAllPermissions: async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/roles/permissions`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("userToken")}`,
          },
        },
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to fetch permissions");
      }

      const data = await response.json();
      return data;
    } catch (error: any) {
      console.error("Get permissions error:", error);
      throw error;
    }
  },

  // Update user roles
  updateUserRoles: async (userId: string, roleIds: string[]) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/roles/user/${userId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("userToken")}`,
          },
          body: JSON.stringify({ roleIds }),
        },
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to update user roles");
      }

      const data = await response.json();
      return data.user;
    } catch (error: any) {
      console.error("Update user roles error:", error);
      throw error;
    }
  },

  // Get user permissions
  getUserPermissions: async (userId: string) => {
    try {
      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_BASE_URL
        }/admin/roles/user/${userId}/permissions`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("userToken")}`,
          },
        },
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to fetch user permissions");
      }

      const data = await response.json();
      return data;
    } catch (error: any) {
      console.error("Get user permissions error:", error);
      throw error;
    }
  },

  // Initialize roles and permissions (run once)
  initializeRolesAndPermissions: async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/roles/initialize`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("userToken")}`,
          },
        },
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to initialize roles");
      }

      const data = await response.json();
      return data;
    } catch (error: any) {
      console.error("Initialize roles error:", error);
      throw error;
    }
  },

  // Create a new role
  createRole: async (roleData: {
    name: string;
    description: string;
    permissionIds: string[];
  }) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/roles/roles`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("userToken")}`,
          },
          body: JSON.stringify(roleData),
        },
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to create role");
      }

      const data = await response.json();
      return data;
    } catch (error: any) {
      console.error("Create role error:", error);
      throw error;
    }
  },

  // Get a single role
  getRoleById: async (roleId: string) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/roles/roles/${roleId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("userToken")}`,
          },
        },
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to fetch role");
      }

      const data = await response.json();
      return data;
    } catch (error: any) {
      console.error("Get role error:", error);
      throw error;
    }
  },

  // Update a role
  updateRole: async (
    roleId: string,
    roleData: {
      name: string;
      description: string;
      permissionIds: string[];
    },
  ) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/roles/roles/${roleId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("userToken")}`,
          },
          body: JSON.stringify(roleData),
        },
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to update role");
      }

      const data = await response.json();
      return data;
    } catch (error: any) {
      console.error("Update role error:", error);
      throw error;
    }
  },

  // Delete a role
  deleteRole: async (roleId: string) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/roles/roles/${roleId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("userToken")}`,
          },
        },
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to delete role");
      }

      const data = await response.json();
      return data;
    } catch (error: any) {
      console.error("Delete role error:", error);
      throw error;
    }
  },

  // Assign roles to user
  assignRolesToUser: async (userId: string, roleIds: string[]) => {
    try {
      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_BASE_URL
        }/admin/roles/user/${userId}/assign`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("userToken")}`,
          },
          body: JSON.stringify({ roleIds }),
        },
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to assign roles");
      }

      const data = await response.json();
      return data;
    } catch (error: any) {
      console.error("Assign roles error:", error);
      throw error;
    }
  },
};

export default adminService;

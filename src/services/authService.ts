"use client";
import { useApi } from "@/hooks/useApi";
import { toast } from "react-toastify";
import {
  setUserLoading,
  setUserSuccess,
  setUserError,
  setBusinessLoading,
  setBusinessSuccess,
  setBusinessError,
  setAdminSuccess,
} from "@/store/authSlice";
import type { AppDispatch } from "@/store";
import fetchData from "@/utils/apiAction";
import { writeCachedBusinessSubscription } from "@/services/subscriptionService";

export interface RegisterUserPayload {
  fullName: string;
  email: string;
  password: string;
}

export interface RegisterBusinessPayload {
  name: string;
  email: string;
  password: string;
  phone?: string;
  categories: string[]; // Updated: array of max 2 categories
  personName?: string;
  businessAddress?: string;
  placeId?: string;
  lat?: number;
  lng?: number;
  timezone?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface PasswordResetRequestPayload {
  email: string;
  accountType?: "user" | "business";
}

export interface PasswordResetConfirmPayload {
  token: string;
  password: string;
  accountType?: "user" | "business";
}

/**
 * Auth Service - Centralized authentication API layer
 * Uses the unified useApi hook for all API calls
 *
 * Response Structure:
 * User: { id, fullName, email, role, token }
 * Business: { id, name, email, phone, category, token }
 *
 * Now handles Redux dispatch internally for all auth actions
 */
export const useAuthService = () => {
  const { call } = useApi();

  const registerUser = async (
    dispatch: AppDispatch,
    data: RegisterUserPayload,
  ) => {
    try {
      dispatch(setUserLoading());

      const { response, error: apiError } = await call("/auth/register", {
        method: "POST",
        data,
      });

      if (apiError) {
        const errorMessage =
          apiError?.message ||
          apiError?.error ||
          "Registration failed. Please try again.";
        dispatch(setUserError(errorMessage));
        throw new Error(errorMessage);
      }

      // ✅ According to your API response
      if (response?.token && response?.id) {
        const userData = {
          id: response.id,
          fullName: response.fullName,
          email: response.email,
          role: "user",
        };

        // Save to localStorage
        localStorage.setItem("userToken", response.token);
        localStorage.setItem("user", JSON.stringify(userData));
        localStorage.setItem("accountType", "user");

        dispatch(
          setUserSuccess({
            user: userData,
            token: response.token,
          }),
        );

        toast.success("Registration successful!");

        return {
          user: userData,
          token: response.token,
        };
      }

      throw new Error("Invalid API response format");
    } catch (error: any) {
      const errorMessage =
        error?.message ||
        error?.response?.data?.message ||
        "Registration failed. Please try again.";

      dispatch(setUserError(errorMessage));
      throw error;
    }
  };

  const loginUser = async (dispatch: AppDispatch, payload: LoginPayload) => {
    try {
      dispatch(setUserLoading());

      const { response, error: apiError } = await call("/auth/login", {
        method: "POST",
        data: payload,
      });

      // Handle API error first
      if (apiError) {
        let errorMessage;
        // Check for account not found (404)
        if (apiError.message?.includes("Account not found") || apiError.message?.includes("not found")) {
          errorMessage = "Account not found. Please register first or check your email.";
        } else if (apiError.message?.includes("Invalid credentials")) {
          errorMessage = "Invalid credentials. Please check your email and password.";
        } else if (apiError.message?.includes("blocked") || apiError.message?.includes("suspended")) {
          errorMessage = "Your account has been blocked or suspended. Please contact support.";
        } else {
          errorMessage = apiError?.message || apiError?.error || "Login failed. Please try again.";
        }
        console.error("Login Error:", errorMessage);
        dispatch(setUserError(errorMessage));
        throw new Error(errorMessage);
      }

      // Business response (login from shared /auth/login)
      if (
        response &&
        response.token &&
        (response.accountType === "business" || response.name)
      ) {
        localStorage.setItem("token", response.token);
        localStorage.setItem("businessToken", response.token);
        localStorage.setItem("business", JSON.stringify(response));

        dispatch(
          setBusinessSuccess({
            business: response,
            token: response.token,
          }),
        );

        try {
          const { response: activeSubscription } = await fetchData(
            "/subscription/active",
            { method: "GET" },
            () => {},
            "business",
          );
          writeCachedBusinessSubscription(activeSubscription || null);
        } catch (cacheError) {
          writeCachedBusinessSubscription(null);
        }

        toast.success("Business login successful!");
        return {
          accountType: "business" as const,
          business: response,
          token: response.token,
        };
      }

      // Admin response
      if (
        response &&
        response.token &&
        (response.accountType === "admin" ||
          response.isSuperAdmin === true ||
          response.role?.name)
      ) {
        dispatch(
          setAdminSuccess({
            adminUser: response,
            token: response.token,
          }),
        );

        toast.success("Admin login successful!");
        return {
          accountType: "admin" as const,
          adminUser: response,
          token: response.token,
        };
      }

      // User response
      if (response && response.id && response.token) {
        const userData = {
          id: response.id,
          fullName: response.fullName,
          email: response.email,
          avatarUrl: response.avatarUrl,
          role: "user", // default role
        };

        // Store in localStorage
        localStorage.setItem("userToken", response.token);
        localStorage.setItem("user", JSON.stringify(userData));
        localStorage.setItem("accountType", "user");

        // Dispatch Redux success
        dispatch(
          setUserSuccess({
            user: userData,
            token: response.token,
          }),
        );

        toast.success("Login successful!");

        return {
          accountType: "user" as const,
          user: userData,
          token: response.token,
        };
      }

      throw new Error("Invalid response from server");
    } catch (error: any) {
      console.error("Login user error:", error);
      const errorMessage = error.message || "Login failed. Please try again.";
      dispatch(setUserError(errorMessage));
      throw error;
    }
  };

  // Register business
  const registerBusiness = async (
    dispatch: AppDispatch,
    data: RegisterBusinessPayload,
  ) => {
    try {
      dispatch(setBusinessLoading());

      const { response, error: apiError } = await call(
        "/auth/register/business",
        {
          method: "POST",
          data: data,
        },
        (res, success) => {
          if (success) {
          }
        },
      );

      // Check for API error first
      if (apiError) {
        const errorMessage =
          apiError.message || "Registration failed. Please try again.";
        console.error("Registration Error:", errorMessage);
        dispatch(setBusinessError(errorMessage));
        throw new Error(errorMessage);
      }

      if (response && response.token) {
        localStorage.setItem("token", response.token);
        localStorage.setItem("businessToken", response.token);
        localStorage.setItem("business", JSON.stringify(response));

        const businessData = response;

        dispatch(
          setBusinessSuccess({
            business: businessData,
            token: response.token,
          }),
        );

        writeCachedBusinessSubscription(null);

        return {
          business: businessData,
          token: response.token,
        };
      }
      return null;
    } catch (error: any) {
      console.error("Register business error:", error);
      const errorMessage =
        error.message || "Registration failed. Please try again.";
      dispatch(setBusinessError(errorMessage));
      throw error;
    }
  };

  // Login business
  const loginBusiness = async (
    dispatch: AppDispatch,
    payload: LoginPayload,
  ) => {
    try {
      dispatch(setBusinessLoading());
      console.log("Logging in business with payload:", payload);

      const { response, error: apiError } = await call(
        "/auth/login",
        {
          method: "POST",
          data: payload,
        },
        (res, success) => {
          if (!success) {
            // Handle error response from callback
            const errorMsg = res?.message || "Login failed. Please try again.";
            console.error("Login error from callback:", errorMsg);
          }
        },
      );
      if (apiError) {
        let errorMessage;
        // Check for account not found (404)
        if (apiError.message?.includes("Account not found") || apiError.message?.includes("not found")) {
          errorMessage = "Business account not found. Please register first or check your email.";
        } else if (apiError.message?.includes("Invalid credentials")) {
          errorMessage = "Invalid credentials. Please check your email and password.";
        } else if (apiError.message?.includes("blocked") || apiError.message?.includes("suspended")) {
          errorMessage = "Your business account has been blocked or suspended. Please contact support.";
        } else if (apiError.message?.includes("not a business account")) {
          errorMessage = "This account is not a business account. Please use the correct login page.";
        } else {
          errorMessage = apiError.message || "Login failed. Please try again.";
        }
        console.error("API Error:", errorMessage);
        dispatch(setBusinessError(errorMessage));
        throw new Error(errorMessage);
      }

      if (response && response.token) {
        if (response.accountType !== "business") {
          const errorMessage =
            "This account is not a business account. Please use the correct login page.";
          dispatch(setBusinessError(errorMessage));
          throw new Error(errorMessage);
        }

        localStorage.setItem("token", response.token);
        localStorage.setItem("businessToken", response.token);
        localStorage.setItem("business", JSON.stringify(response));

        const businessData = response;

        dispatch(
          setBusinessSuccess({
            business: businessData,
            token: response.token,
          }),
        );

        try {
          const { response: activeSubscription } = await fetchData(
            "/subscription/active",
            { method: "GET" },
            () => {},
            "business",
          );
          writeCachedBusinessSubscription(activeSubscription || null);
        } catch (cacheError) {
          writeCachedBusinessSubscription(null);
        }

        toast.success("Business login successful!");
        window.location.href = "/business/dashboard";
        return {
          business: businessData,
          token: response.token,
        };
      }
    } catch (error: any) {
      console.error("Login business error:", error);
      const errorMessage = error.message || "Login failed. Please try again.";
      dispatch(setBusinessError(errorMessage));
      throw error;
    }
  };
  const loginAdmin = async (dispatch: AppDispatch, payload: LoginPayload) => {
    try {
      dispatch(setUserLoading());

      const { response, error: apiError } = await call("/auth/login", {
        method: "POST",
        data: payload,
      });

      if (apiError) {
        const msg = apiError.message || "Login failed";
        dispatch(setUserError(msg));
        throw new Error(msg);
      }

      // ✅ ADMIN VALIDATION (FIXED)
      const isAdmin =
        response?.token &&
        (response?.isSuperAdmin === true || response?.role?.name);

      if (!isAdmin) {
        const msg = "You do not have admin access";
        dispatch(setUserError(msg));
        throw new Error(msg);
      }

      console.log("Admin login response:", response);

      dispatch(
        setAdminSuccess({
          adminUser: response,
          token: response.token,
        }),
      );

      toast.success("Admin login successful!");
      return response;
    } catch (error: any) {
      dispatch(setUserError(error.message));
      toast.error(error.message || "Login failed");
      throw error;
    }
  };

  // Logout
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userToken");
    localStorage.removeItem("businessToken");
    localStorage.removeItem("user");
    localStorage.removeItem("business");
    localStorage.removeItem("accountType");
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminUser");
    writeCachedBusinessSubscription(null);
    toast.success("Logged out successfully!");
  };

  const requestPasswordReset = async (data: PasswordResetRequestPayload) => {
    const { response, error: apiError } = await call("/auth/forgot-password", {
      method: "POST",
      data,
    });

    if (apiError) {
      const message =
        apiError?.message || "Failed to request password reset. Please try again.";
      throw new Error(message);
    }

    return response;
  };

  const resetPassword = async (data: PasswordResetConfirmPayload) => {
    const { response, error: apiError } = await call("/auth/reset-password", {
      method: "POST",
      data,
    });

    if (apiError) {
      const message =
        apiError?.message || "Failed to reset password. Please try again.";
      throw new Error(message);
    }

    return response;
  };

  return {
    registerUser,
    loginUser,
    registerBusiness,
    loginBusiness,
    loginAdmin,
    requestPasswordReset,
    resetPassword,
    logout,
  };
};

export default useAuthService;

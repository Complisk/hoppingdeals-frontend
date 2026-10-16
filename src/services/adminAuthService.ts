"use client";
import { useApi } from "@/hooks/useApi";
import { useAppDispatch } from "@/hooks/use-redux";
import { toast } from "react-toastify";
import { extractErrorMessage } from "@/utils/errorHandler";
import {
  setAdminSuccess,
  setAdminError,
  setAdminLoading,
} from "@/store/authSlice";

export const useAdminAuthService = () => {
  const { call } = useApi();
  const dispatch = useAppDispatch();

  // Admin login
  const adminLogin = async (email: string, password: string) => {
    try {
      dispatch(setAdminLoading());
      console.log("Starting admin login for:", email);

      const { response, error } = await call("/auth/login", {
        method: "POST",
        data: {
          email,
          password,
          type: "admin",
        },
      });

      if (error) {
        const errorMessage = extractErrorMessage(error);
        console.error("Login error:", errorMessage);
        dispatch(setAdminError(errorMessage));
        toast.error(errorMessage);
        return null;
      }

      if (response && response.token && response.id) {
        console.log(
          "Login successful, fetching permissions for user:",
          response.id,
        );

        // Fetch admin permissions/role
        const { response: permissionsResponse } = await call(
          `/admin/user-permissions/${response.id}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${response.token}`,
            },
          },
        );

        const adminUserData = {
          id: response.id,
          fullName: response.fullName || response.email,
          email: response.email,
          role: "admin",
          roleId: permissionsResponse?.roleId,
          isSuperAdmin: permissionsResponse?.isSuperAdmin || false,
          permissions: permissionsResponse?.permissions || {},
        };

        console.log("Admin user data:", adminUserData);
        console.log("Admin token:", response.token);

        // Dispatch to Redux - this sets adminUser, adminToken, and localStorage
        dispatch(
          setAdminSuccess({
            adminUser: adminUserData,
            token: response.token,
          }),
        );

        console.log("Redux dispatch complete");
        toast.success("Login successful!");
        return adminUserData;
      }

      console.error("Invalid response:", response);
      dispatch(setAdminError("Invalid login response"));
      return null;
    } catch (error) {
      const errorMessage = extractErrorMessage(error);
      console.error("Admin login error:", error, errorMessage);
      dispatch(setAdminError(errorMessage));
      toast.error(errorMessage);
      return null;
    }
  };

  return { adminLogin };
};

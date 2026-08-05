"use client";
import { useApi } from "@/hooks/useApi";
import { toast } from "react-toastify";
import { extractErrorMessage } from "@/utils/errorHandler";
import fetchData from "@/utils/apiAction";

export interface PermissionMap {
  [module: string]: string[];
}

export interface Role {
  id: string;
  name: string;
  permissions: PermissionMap;
  isSystem: boolean;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Role Service - Handles all role-related API calls
 */
export const useRoleService = () => {
  // Get all available permissions
  const getAvailablePermissions = async (): Promise<PermissionMap | null> => {
    try {
      const { response, error } = await fetchData(
        "/roles/permissions",
        {
          method: "GET",
        },
        null,
        "admin",
      );

      if (error) {
        const errorMessage = extractErrorMessage(error);
        console.error("Get permissions error:", errorMessage);
        return null;
      }

      return response || null;
    } catch (error) {
      const errorMessage = extractErrorMessage(error);
      console.error("Get permissions error:", error);
      return null;
    }
  };

  // Get all roles
  const getRoles = async (): Promise<Role[] | null> => {
    try {
      const { response, error } = await fetchData(
        "/roles",
        {
          method: "GET",
        },
        null,
        "admin",
      );

      if (error) {
        const errorMessage = extractErrorMessage(error);
        console.error("Get roles error:", errorMessage);
        return null;
      }

      return response || [];
    } catch (error) {
      const errorMessage = extractErrorMessage(error);
      console.error("Get roles error:", error);
      return null;
    }
  };

  // Get single role by ID
  const getRole = async (roleId: string): Promise<Role | null> => {
    try {
      const { response, error } = await fetchData(
        `/roles/${roleId}`,
        {
          method: "GET",
        },
        null,
        "admin",
      );

      if (error) {
        const errorMessage = extractErrorMessage(error);
        console.error("Get role error:", errorMessage);
        return null;
      }

      return response || null;
    } catch (error) {
      const errorMessage = extractErrorMessage(error);
      console.error("Get role error:", error);
      return null;
    }
  };

  // Create new role with permissions
  const createRole = async (
    name: string,
    permissions: PermissionMap,
  ): Promise<Role | null> => {
    try {
      const { response, error } = await fetchData(
        "/roles",
        {
          method: "POST",
          data: { name, permissions },
        },
        null,
        "admin",
      );

      if (error) {
        const errorMessage = extractErrorMessage(error);
        toast.error(errorMessage);
        return null;
      }

      if (response) {
        toast.success("Role created successfully");
        return response;
      }
      return null;
    } catch (error) {
      const errorMessage = extractErrorMessage(error);
      toast.error(errorMessage);
      console.error("Create role error:", error);
      return null;
    }
  };

  // Update role with new permissions
  const updateRole = async (
    roleId: string,
    permissions: PermissionMap,
  ): Promise<Role | null> => {
    try {
      const { response, error } = await fetchData(
        `/roles/${roleId}`,
        {
          method: "PUT",
          data: { permissions },
        },
        null,
        "admin",
      );

      if (error) {
        const errorMessage = extractErrorMessage(error);
        toast.error(errorMessage);
        return null;
      }

      if (response) {
        toast.success("Role updated successfully");
        return response;
      }
      return null;
    } catch (error) {
      const errorMessage = extractErrorMessage(error);
      toast.error(errorMessage);
      console.error("Update role error:", error);
      return null;
    }
  };

  // Delete role
  const deleteRole = async (roleId: string): Promise<boolean> => {
    try {
      const { response, error } = await fetchData(
        `/roles/${roleId}`,
        {
          method: "DELETE",
        },
        null,
        "admin",
      );

      if (error) {
        const errorMessage = extractErrorMessage(error);
        toast.error(errorMessage);
        return false;
      }

      if (response) {
        toast.success("Role deleted successfully");
        return true;
      }
      return false;
    } catch (error) {
      const errorMessage = extractErrorMessage(error);
      toast.error(errorMessage);
      console.error("Delete role error:", error);
      return false;
    }
  };

  // Create admin user with role
  const createAdminUser = async (
    fullName: string,
    email: string,
    password: string,
    roleId?: string,
    isSuperAdmin?: boolean,
  ) => {
    try {
      const { response, error } = await fetchData(
        "/admin/create-admin",
        {
          method: "POST",
          data: { fullName, email, password, roleId, isSuperAdmin },
        },
        null,
        "admin",
      );

      if (error) {
        const errorMessage = extractErrorMessage(error);
        toast.error(errorMessage);
        return null;
      }

      if (response) {
        toast.success("Admin user created successfully");
        return response;
      }
      return null;
    } catch (error) {
      const errorMessage = extractErrorMessage(error);
      toast.error(errorMessage);
      console.error("Create admin user error:", error);
      return null;
    }
  };

  // Update admin user role
  const updateAdminRole = async (
    userId: string,
    roleId?: string,
    isSuperAdmin?: boolean,
  ) => {
    try {
      const { response, error } = await fetchData(
        `/admin/users/${userId}/role`,
        {
          method: "PUT",
          data: { roleId, isSuperAdmin },
        },
        null,
        "admin",
      );

      if (error) {
        const errorMessage = extractErrorMessage(error);
        toast.error(errorMessage);
        return null;
      }

      if (response) {
        toast.success("User role updated successfully");
        return response;
      }
      return null;
    } catch (error) {
      const errorMessage = extractErrorMessage(error);
      toast.error(errorMessage);
      console.error("Update admin role error:", error);
      return null;
    }
  };

  return {
    getAvailablePermissions,
    getRoles,
    getRole,
    createRole,
    updateRole,
    deleteRole,
    createAdminUser,
    updateAdminRole,
  };
};

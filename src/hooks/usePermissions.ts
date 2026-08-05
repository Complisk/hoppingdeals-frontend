"use client";
import { useAppSelector } from "@/hooks/use-redux";
import { useEffect, useState } from "react";
import adminService from "@/services/adminService";

export interface UserPermissions {
  isSuperAdmin: boolean;
  roles: string[];
  permissions: {
    [key: string]: string[];
  };
}

/**
 * Hook to check user permissions
 * Usage:
 * const { hasPermission, isLoading } = usePermissions();
 * if (hasPermission("businesses", "view")) { ... }
 */
export const usePermissions = () => {
  const { user, userToken, adminPermissions } = useAppSelector(
    (state) => state.auth,
  );
  const [permissions, setPermissions] = useState<UserPermissions | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.id || !userToken) {
      setIsLoading(false);
      return;
    }

    loadPermissions();
  }, [user?.id, userToken]);

  const loadPermissions = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const perms = await adminService.getUserPermissions(user!.id);
      setPermissions(perms);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to load permissions";
      setError(message);
      console.error("Permission loading error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Check if user has a specific permission
   */
  const hasPermission = (module: string, action: string): boolean => {
    if (!adminPermissions) return false;
    if (adminPermissions == "ALL") return true;
    return adminPermissions[module]?.includes(action) ?? false;
  };

  /**
   * Check if user has any of the specified modules
   */
  const hasModule = (module: string): boolean => {
    if (!permissions) return false;
    if (permissions.isSuperAdmin) return true;

    return module in permissions.permissions;
  };

  /**
   * Check if user has any of the specified permissions
   */
  const hasAnyPermission = (
    permissionsList: Array<{ module: string; action: string }>,
  ): boolean => {
    if (!permissions) return false;
    if (permissions.isSuperAdmin) return true;

    return permissionsList.some((perm) =>
      permissions.permissions[perm.module]?.includes(perm.action),
    );
  };

  /**
   * Check if user has all of the specified permissions
   */
  const hasAllPermissions = (
    permissionsList: Array<{ module: string; action: string }>,
  ): boolean => {
    if (!permissions) return false;
    if (permissions.isSuperAdmin) return true;

    return permissionsList.every((perm) =>
      permissions.permissions[perm.module]?.includes(perm.action),
    );
  };

  /**
   * Get all available actions for a module
   */
  const getModuleActions = (module: string): string[] => {
    if (!permissions) return [];
    return permissions.permissions[module] ?? [];
  };

  return {
    permissions,
    isLoading,
    error,
    hasPermission,
    hasModule,
    hasAnyPermission,
    hasAllPermissions,
    getModuleActions,
    isSuperAdmin: permissions?.isSuperAdmin ?? false,
    roles: permissions?.roles ?? [],
  };
};

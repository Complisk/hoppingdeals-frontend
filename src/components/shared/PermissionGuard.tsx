"use client";
import { ReactNode } from "react";
import { usePermissions } from "@/hooks/usePermissions";
import { useAppSelector } from "@/hooks/use-redux";
import Spinner from "./Spinner";

interface PermissionGuardProps {
  /**
   * Module name (e.g., "businesses", "promotions", "users", "admin")
   */
  module: string;

  /**
   * Action name (e.g., "view", "create", "edit", "delete", "approve")
   */
  action: string;

  /**
   * Content to render if user has permission
   */
  children: ReactNode;

  /**
   * Content to render if user doesn't have permission (optional)
   */
  fallback?: ReactNode;

  /**
   * If true, renders nothing instead of fallback when no permission
   */
  silent?: boolean;
}

/**
 * Component to conditionally render content based on user permissions
 * Usage:
 * <PermissionGuard module="businesses" action="view">
 *   <BusinessList />
 * </PermissionGuard>
 */
export const PermissionGuard = ({
  module,
  action,
  children,
  fallback,
  silent = true,
}: PermissionGuardProps) => {
  const { hasPermission } = usePermissions();
  // Check if user has permission
  const allowed = hasPermission(module, action);

  if (allowed) {
    return <>{children}</>;
  }

  // If not allowed
  if (silent) {
    return null;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  return (
    <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
      <p className="text-sm text-red-700">
        You don't have permission to {action} {module}
      </p>
    </div>
  );
};

interface MultiPermissionGuardProps {
  /**
   * Array of permissions required - at least one must be satisfied
   */
  permissions: Array<{ module: string; action: string }>;

  /**
   * "any" requires at least one permission, "all" requires all permissions
   */
  mode?: "any" | "all";

  children: ReactNode;
  fallback?: ReactNode;
  silent?: boolean;
}

/**
 * Component for checking multiple permissions
 * Usage:
 * <MultiPermissionGuard
 *   permissions={[
 *     { module: "businesses", action: "view" },
 *     { module: "businesses", action: "edit" }
 *   ]}
 *   mode="any"
 * >
 *   <BusinessActions />
 * </MultiPermissionGuard>
 */
export const MultiPermissionGuard = ({
  permissions,
  mode = "any",
  children,
  fallback,
  silent = true,
}: MultiPermissionGuardProps) => {
  const { hasAnyPermission, hasAllPermissions, isLoading } = usePermissions();

  if (isLoading) {
    return <div className="animate-pulse bg-gray-200 h-10 rounded" />;
  }

  const allowed =
    mode === "all"
      ? hasAllPermissions(permissions)
      : hasAnyPermission(permissions);

  if (allowed) {
    return <>{children}</>;
  }

  if (silent) {
    return null;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  return (
    <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
      <p className="text-sm text-red-700">
        You don't have permission to perform this action
      </p>
    </div>
  );
};

interface PermissionButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  module: string;
  action: string;
  children: ReactNode;
}

/**
 * Button component that disables itself if user doesn't have permission
 * Usage:
 * <PermissionButton module="businesses" action="edit">
 *   Edit Business
 * </PermissionButton>
 */
export const PermissionButton = ({
  module,
  action,
  children,
  disabled,
  title,
  ...props
}: PermissionButtonProps) => {
  const { user, userToken, adminPermissions } = useAppSelector(
    (state) => state.auth,
  );

  const hasPermission = (module: string, action: string): boolean => {
    if (!adminPermissions) return false;
    if (adminPermissions == "ALL") return true;
    return adminPermissions[module]?.includes(action) ?? false;
  };

  const allowed = hasPermission(module, action);
  const isDisabled = disabled || !allowed;
  const tooltipText =
    title ||
    (!allowed ? `You don't have permission to ${action} ${module}` : undefined);
  console.log("check permotion system", allowed);
  return (
    <button
      disabled={isDisabled}
      title={tooltipText}
      className={
        isDisabled ? "opacity-50 cursor-not-allowed" : " cursor-pointer"
      }
      {...props}
    >
      {children}
    </button>
  );
};

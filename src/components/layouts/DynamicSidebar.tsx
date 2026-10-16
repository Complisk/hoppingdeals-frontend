"use client";
import { useMemo } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import Link from "next/link";
import { useLocation } from "@/hooks/useLocation";
import {
  LayoutDashboard,
  Users,
  Building2,
  Gift,
  BarChart3,
  Lock,
  MessagesSquare,
  LogOut,
  Images,
  LayoutTemplate,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { sidebarItemClass } from "@/components/layouts/navStyles";
import { SceneBackdrop } from "@/components/art/Scene";

interface MenuItem {
  title: string;
  path: string;
  icon: React.ReactNode;
  requiredPermission?: {
    module: string;
    action: string;
  };
}

export const ALL_MENU_ITEMS: MenuItem[] = [
  {
    title: "Dashboard",
    path: "/admin/dashboard",
    icon: <LayoutDashboard className="h-[1.15rem] w-[1.15rem]" />,
    requiredPermission: { module: "dashboard", action: "view" },
  },
  {
    title: "Users",
    path: "/admin/users",
    icon: <Users className="h-[1.15rem] w-[1.15rem]" />,
    requiredPermission: { module: "users", action: "view" },
  },
  {
    title: "Businesses",
    path: "/admin/businesses",
    icon: <Building2 className="h-[1.15rem] w-[1.15rem]" />,
    requiredPermission: { module: "businesses", action: "view" },
  },
  {
    title: "Promotions",
    path: "/admin/promotions",
    icon: <Gift className="h-[1.15rem] w-[1.15rem]" />,
    requiredPermission: { module: "promotions", action: "view" },
  },
  {
    title: "Templates",
    path: "/admin/templates",
    icon: <LayoutTemplate className="h-[1.15rem] w-[1.15rem]" />,
    requiredPermission: { module: "templates", action: "view" },
  },
  {
    title: "Photos",
    path: "/admin/photos",
    icon: <Images className="h-[1.15rem] w-[1.15rem]" />,
    requiredPermission: { module: "photos", action: "view" },
  },
  {
    title: "Roles & Permissions",
    path: "/admin/roles",
    icon: <Lock className="h-[1.15rem] w-[1.15rem]" />,
    requiredPermission: { module: "roles", action: "view" },
  },
  {
    title: "Support Messages",
    path: "/admin/support-messages",
    icon: <MessagesSquare className="h-[1.15rem] w-[1.15rem]" />,
    requiredPermission: { module: "support_messages", action: "view" },
  },
  {
    title: "Business Tagging",
    path: "/admin/business-tagging",
    icon: <BarChart3 className="h-[1.15rem] w-[1.15rem]" />,
    requiredPermission: { module: "business_tagging", action: "view" },
  },
];

interface DynamicSidebarProps {
  onLogout: () => void;
  isCollapsed?: boolean;
  onNavigate?: () => void;
}

export const DynamicSidebar = ({
  onLogout,
  isCollapsed = false,
  onNavigate,
}: DynamicSidebarProps) => {
  const location = useLocation();
  const { adminUser, adminPermissions } = useSelector(
    (state: RootState) => state.auth,
  );

  // Get admin permissions from localStorage for quick access
  // const adminPermissions = useMemo(() => {
  //   try {
  //     const stored = localStorage.getItem("adminPermissions");
  //     return stored ? JSON.parse(stored) : {};
  //   } catch {
  //     return {};
  //   }
  // }, []);
  const visibleMenuItems = useMemo(() => {
    // If super admin, show all items
    if (adminUser?.isSuperAdmin) {
      return ALL_MENU_ITEMS;
    }

    // Otherwise, filter by permissions
    return ALL_MENU_ITEMS.filter((item) => {
      // Dashboard is always visible
      // If no permission required, show it
      if (!item.requiredPermission) return true;

      // Check if user has the required permission
      const { module, action } = item.requiredPermission;
      const modulePermissions = adminPermissions[module] || [];
      return modulePermissions.includes(action);
    });
  }, [adminUser?.isSuperAdmin, adminPermissions]);

  const isActive = (path: string) =>
    location.pathname === path || location.pathname.startsWith(`${path}/`);

  return (
    <div className="flex h-full flex-col justify-between">
      <nav
        aria-label="Admin"
        className={cn(
          "space-y-1 overflow-y-auto py-4",
          isCollapsed ? "px-4 lg:px-3" : "px-4",
        )}
      >
        {visibleMenuItems.map((item) => (
          <Link
            key={item.path}
            href={item.path}
            onClick={onNavigate}
            title={isCollapsed ? item.title : undefined}
            aria-current={isActive(item.path) ? "page" : undefined}
            className={cn(
              sidebarItemClass(isActive(item.path)),
              isCollapsed && "lg:justify-center lg:px-0 lg:before:-left-3",
            )}
          >
            {item.icon}
            <span className={cn(isCollapsed && "lg:sr-only")}>
              {item.title}
            </span>
          </Link>
        ))}
      </nav>

      <div className="border-t border-sidebar-border p-4">
        {!isCollapsed ? (
          <Link
            href="/"
            className="group relative isolate mb-3 block overflow-hidden rounded-2xl border border-white/10 px-4 py-4 transition-colors hover:border-gold/50"
          >
            <SceneBackdrop name="tower" fade="left" compact />
            <span className="block text-sm font-semibold text-white">
              Shopper site
            </span>
            <span className="mt-0.5 block text-xs text-white/75 group-hover:text-gold">
              Open the live site
            </span>
          </Link>
        ) : null}
        <button
          onClick={onLogout}
          title="Log out"
          className={cn(
            "flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-sidebar-foreground transition-colors hover:bg-destructive/10 hover:text-destructive",
            isCollapsed && "lg:justify-center lg:px-0",
          )}
        >
          <LogOut className="h-4 w-4" />
          <span className={cn(isCollapsed && "lg:sr-only")}>Log out</span>
        </button>
      </div>
    </div>
  );
};

export default DynamicSidebar;

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
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface MenuItem {
  title: string;
  path: string;
  icon: React.ReactNode;
  requiredPermission?: {
    module: string;
    action: string;
  };
}

const ALL_MENU_ITEMS: MenuItem[] = [
  {
    title: "Dashboard",
    path: "/admin/dashboard",
    icon: <LayoutDashboard className="h-4 w-4" />,
    requiredPermission: { module: "dashboard", action: "view" },
  },
  {
    title: "Users",
    path: "/admin/users",
    icon: <Users className="h-4 w-4" />,
    requiredPermission: { module: "users", action: "view" },
  },
  {
    title: "Businesses",
    path: "/admin/businesses",
    icon: <Building2 className="h-4 w-4" />,
    requiredPermission: { module: "businesses", action: "view" },
  },
  {
    title: "Promotions",
    path: "/admin/promotions",
    icon: <Gift className="h-4 w-4" />,
    requiredPermission: { module: "promotions", action: "view" },
  },
  {
    title: "Templates",
    path: "/admin/templates",
    icon: <Gift className="h-4 w-4" />,
    requiredPermission: { module: "templates", action: "view" },
  },
  {
    title: "Photos",
    path: "/admin/photos",
    icon: <Images className="h-4 w-4" />,
    requiredPermission: { module: "photos", action: "view" },
  },
  {
    title: "Roles & Permissions",
    path: "/admin/roles",
    icon: <Lock className="h-4 w-4" />,
    requiredPermission: { module: "roles", action: "view" },
  },
  {
    title: "Support Messages",
    path: "/admin/support-messages",
    icon: <MessagesSquare className="h-4 w-4" />,
    requiredPermission: { module: "support_messages", action: "view" },
  },
  {
    title: "Business Tagging",
    path: "/admin/business-tagging",
    icon: <BarChart3 className="h-4 w-4" />,
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

  if (isCollapsed) {
    return (
      <div className="flex h-full flex-col items-center justify-between py-4">
        <div className="space-y-3">
          {visibleMenuItems.map((item) => (
            <Link key={item.path} href={item.path} onClick={onNavigate}>
              <div
                className={cn(
                  "rounded-lg p-2 transition-colors",
                  location.pathname === item.path
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent/60",
                )}
                title={item.title}
              >
                {item.icon}
              </div>
            </Link>
          ))}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onLogout}
          className="w-10 p-0"
          title="Logout"
        >
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col justify-between">
      <div className="space-y-1 p-3">
        {/* Menu Items */}
        {visibleMenuItems.map((item) => (
          <Link key={item.path} href={item.path} onClick={onNavigate}>
            <button
              className={cn(
                "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                location.pathname === item.path
                  ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/60",
              )}
            >
              {item.icon}
              <span>{item.title}</span>
            </button>
          </Link>
        ))}
      </div>

      {/* Logout Button */}
      <div className="border-t border-sidebar-border p-3">
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent/60"
          onClick={onLogout}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </div>
    </div>
  );
};

export default DynamicSidebar;

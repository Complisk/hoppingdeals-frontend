"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut, Menu, PanelLeftClose, PanelLeftOpen, X } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/hooks/use-redux";
import { logout } from "@/store/authSlice";
import DynamicSidebar, {
  ALL_MENU_ITEMS,
} from "@/components/layouts/DynamicSidebar";
import { cn } from "@/lib/utils";

const EXTRA_TITLES: [string, string][] = [
  ["/admin/create-promotion", "Create promotion"],
  ["/admin/subscription-templates", "Subscription plans"],
  ["/admin/categories", "Categories"],
  ["/admin/locations", "Locations"],
];

const AdminLayout = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const { adminUser, adminToken } = useAppSelector((state) => state.auth);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!adminToken || !adminUser) {
      router.replace("/admin/login");
    }
  }, [adminToken, adminUser, router]);

  const handleLogout = () => {
    dispatch(logout());
    router.replace("/admin/login");
  };

  if (!adminToken || !adminUser) {
    return null;
  }

  const pageTitle =
    EXTRA_TITLES.find(([prefix]) => pathname?.startsWith(prefix))?.[1] ||
    [...ALL_MENU_ITEMS]
      .sort((a, b) => b.path.length - a.path.length)
      .find((item) => pathname?.startsWith(item.path))?.title ||
    "Admin";

  const initials = (adminUser.fullName || "Admin")
    .split(" ")
    .map((part: string) => part.charAt(0))
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="flex h-screen overflow-hidden">
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-[rgb(2_4_10/0.7)] backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex transform flex-col border-r border-sidebar-border bg-sidebar transition-all duration-300 lg:static lg:translate-x-0",
          "bg-[radial-gradient(120%_40%_at_0%_0%,hsl(var(--primary)/0.10),transparent_60%)]",
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
          sidebarCollapsed ? "w-[17rem] lg:w-20" : "w-[17rem]",
        )}
      >
        <div
          className={cn(
            "flex h-[4.5rem] items-center justify-between px-5",
            sidebarCollapsed && "lg:justify-center lg:px-2",
          )}
        >
          <Link href="/" className="flex min-w-0 items-center gap-3">
            <img
              src="/logo.png"
              alt="Hopping Deals"
              className={cn(
                "w-auto shrink-0",
                sidebarCollapsed ? "h-12 lg:h-10" : "h-12",
              )}
            />
            <span
              className={cn(
                "font-display text-[0.8rem] font-semibold leading-tight text-foreground",
                sidebarCollapsed && "lg:hidden",
              )}
            >
              Mission
              <br />
              <span className="text-gold">control</span>
            </span>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="rounded-lg p-2 text-muted-foreground hover:bg-sidebar-accent lg:hidden"
            aria-label="Close admin menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="min-h-0 flex-1">
          <DynamicSidebar
            onLogout={handleLogout}
            isCollapsed={sidebarCollapsed}
            onNavigate={() => setSidebarOpen(false)}
          />
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="hd-glass flex h-[4.5rem] shrink-0 items-center justify-between gap-3 border-b border-border/70 px-3 sm:px-5 lg:px-8">
          <div className="flex min-w-0 items-center gap-2">
            <button
              className="rounded-lg p-2 text-foreground hover:bg-accent lg:hidden"
              onClick={() => setSidebarOpen((prev) => !prev)}
              aria-label="Toggle admin menu"
            >
              <Menu className="h-6 w-6" />
            </button>
            <button
              onClick={() => setSidebarCollapsed((prev) => !prev)}
              className="hidden rounded-lg p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground lg:inline-flex"
              aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {sidebarCollapsed ? (
                <PanelLeftOpen className="h-5 w-5" />
              ) : (
                <PanelLeftClose className="h-5 w-5" />
              )}
            </button>
            <p className="truncate text-base font-semibold text-foreground sm:text-lg">
              {pageTitle}
            </p>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex items-center gap-2.5 rounded-2xl border border-border bg-card/60 py-1.5 pl-1.5 pr-3">
              <span className="grid h-9 w-9 place-items-center rounded-full border border-primary/40 bg-primary/15 text-xs font-bold text-primary-light">
                {initials}
              </span>
              <div className="hidden min-w-0 leading-tight sm:block">
                <p className="max-w-[12rem] truncate text-sm font-semibold">
                  {adminUser.fullName || "Admin user"}
                </p>
                <p className="text-[11px] text-muted-foreground">
                  {adminUser.isSuperAdmin ? "Super admin" : "Admin"}
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              title="Log out"
              aria-label="Log out"
              className="grid h-10 w-10 place-items-center rounded-xl border border-border text-muted-foreground transition-colors hover:border-destructive/50 hover:bg-destructive/10 hover:text-destructive"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-auto">
          <div className="mx-auto w-full max-w-[96rem] p-4 sm:p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;

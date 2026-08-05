"use client";
import { useEffect, useState } from "react";
import { NavLink } from "@/components/NavLink";
import { useRouter } from "next/navigation";
import { LogOut, Menu, PanelLeftClose, PanelLeftOpen, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppDispatch, useAppSelector } from "@/hooks/use-redux";
import { logout } from "@/store/authSlice";
import DynamicSidebar from "@/components/layouts/DynamicSidebar";

const AdminLayout = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
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

  return (
    <div className="flex h-screen bg-muted/20 overflow-hidden">
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-foreground/40 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex transform flex-col border-r border-sidebar-border bg-sidebar transition-all duration-300 lg:static lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        } ${sidebarCollapsed ? "w-20" : "w-64"}`}
      >
        <div className="flex h-16 items-center justify-between border-b border-sidebar-border px-4">
          <NavLink to="/" className="flex min-w-0 items-center gap-2">
            <img
              src="/Capture-removebg-preview.png"
              alt="Complisk logo"
              className={`${sidebarCollapsed ? "h-8" : "h-10"} w-auto shrink-0`}
            />
          </NavLink>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarCollapsed((prev) => !prev)}
            className="hidden lg:inline-flex"
          >
            {sidebarCollapsed ? (
              <PanelLeftOpen className="h-4 w-4" />
            ) : (
              <PanelLeftClose className="h-4 w-4" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden"
            aria-label="Close admin sidebar"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex-1">
          <DynamicSidebar
            onLogout={handleLogout}
            isCollapsed={sidebarCollapsed}
            onNavigate={() => setSidebarOpen(false)}
          />
        </div>
      </aside>

      {/* RIGHT CONTENT */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* HEADER */}
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-border bg-background/95 px-3 backdrop-blur sm:px-4 lg:px-8">
          <div className="flex items-center gap-2">
            <button
              className="rounded-md p-2 lg:hidden"
              onClick={() => setSidebarOpen((prev) => !prev)}
              aria-label="Toggle admin sidebar"
            >
              <Menu className="h-6 w-6 text-foreground" />
            </button>
            <h1 className="text-base font-semibold sm:text-lg"></h1>
          </div>

          {/* USER INFO */}
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="text-right leading-tight">
              <p className="max-w-[140px] truncate text-sm font-semibold sm:max-w-none">
                {adminUser.fullName || "Admin User"}
              </p>
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              title="Logout"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </header>

        {/* SCROLLABLE CONTENT */}
        <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;

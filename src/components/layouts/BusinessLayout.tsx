"use client";
import { NavLink } from "@/components/NavLink";
import {
  LayoutDashboard,
  CreditCard,
  Plus,
  Menu,
  X,
  LogOut,
  Megaphone,
  Layers,
  ChevronDown,
  UserCog,
  Eye,
} from "lucide-react";
import Logo from "@/components/shared/Logo";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useAppDispatch, useAppSelector } from "@/hooks/use-redux";
import { logout } from "@/store/authSlice";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Image from "next/image";

const sidebarLinks = [
  { to: "/business/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  {
    to: "/business/promotions",
    icon: Megaphone,
    label: "My Active Promotions",
  },
  {
    to: "/business/promotion-templates",
    icon: Layers,
    label: "Saved Templates",
  },
  // {
  //   to: "/business/promotion-templates/create",
  //   icon: Plus,
  //   label: "Create Template",
  // },
  { to: "/business/subscription", icon: CreditCard, label: "Subscription" },
];

const BusinessLayout = ({ children }: { children: React.ReactNode }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const dispatch = useAppDispatch();
  const { business, businessToken, accountType } = useAppSelector(
    (state) => state.auth,
  );
  const handleLogout = () => {
    dispatch(logout());
  };

  // Show loading if not authenticated (PrivateRoute should prevent this)
  if (!businessToken || !business || accountType !== "business") {
    return null;
  }

  return (
    <div className="flex h-screen bg-muted/20">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-foreground/40 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-[85vw] max-w-64 transform flex-col border-r border-sidebar-border bg-sidebar transition-transform duration-300 lg:static lg:w-64 lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        {/* Logo */}
        <div className="flex h-16 items-center border-b border-sidebar-border px-4">
          <Image
            width={24}
            height={24}
            src="/logo.png"
            className=" w-16 md:w-16 "
            alt="Hopping Deals logo"
          />
        </div>

        {/* Create Promotion Button */}
        <div className="p-4">
          <Button asChild className="w-full">
            <NavLink to="/business/create-promotion">
              <Plus className="h-5 w-5 mr-2" />
              Create Promotion
            </NavLink>
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 pb-4">
          {sidebarLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm"
                    : "text-sidebar-foreground hover:bg-sidebar-accent/60",
                )
              }
            >
              <link.icon className="h-5 w-5" />
              {link.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex h-screen flex-1 flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 flex h-16 flex-shrink-0 items-center justify-between border-b border-border bg-background/95 px-3 backdrop-blur sm:px-4 lg:px-8">
          <div className="flex items-center gap-2">
            <button
              className="rounded-md p-2 lg:hidden"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              aria-label="Toggle business sidebar"
            >
              {sidebarOpen ? (
                <X className="h-6 w-6 text-foreground" />
              ) : (
                <Menu className="h-6 w-6 text-foreground" />
              )}
            </button>
            <div className="hidden sm:block">
              <p className="text-sm font-semibold text-foreground"></p>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex min-w-0 items-center gap-2 rounded-lg border border-border px-2 py-1.5 transition hover:bg-muted/50 sm:gap-3 sm:px-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted text-sm font-bold text-foreground sm:h-10 sm:w-10">
                  {business?.logoUrl ? (
                    <img
                      src={business.logoUrl}
                      alt={`${business?.name || "Business"} logo`}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span>{business?.name?.charAt(0)?.toUpperCase()}</span>
                  )}
                </div>
                <div className="hidden min-w-0 text-left sm:block">
                  <p className="truncate text-sm font-medium text-sidebar-foreground">
                    {business?.name}
                  </p>
                  <p className="truncate text-[11px] text-sidebar-foreground/60">
                    {business?.email}
                  </p>
                </div>
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem asChild>
                <NavLink to="/business/profile" className="cursor-pointer">
                  <UserCog className="mr-2 h-4 w-4" />
                  My Profile
                </NavLink>
              </DropdownMenuItem>
              {/* <DropdownMenuItem asChild>
                <NavLink
                  to="/business/public-profile"
                  className="cursor-pointer"
                >
                  <Eye className="mr-2 h-4 w-4" />
                  Public Profile
                </NavLink>
              </DropdownMenuItem> */}
              <DropdownMenuItem
                onClick={handleLogout}
                className="cursor-pointer text-destructive focus:text-destructive"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>

        {/* Scrollable Outlet */}
        <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default BusinessLayout;

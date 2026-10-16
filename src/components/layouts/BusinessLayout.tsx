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
  ExternalLink,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { sidebarItemClass } from "@/components/layouts/navStyles";
import { SceneBackdrop } from "@/components/art/Scene";
import { useAppDispatch, useAppSelector } from "@/hooks/use-redux";
import { logout } from "@/store/authSlice";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const sidebarLinks = [
  { to: "/business/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/business/promotions", icon: Megaphone, label: "My promotions" },
  { to: "/business/promotion-templates", icon: Layers, label: "Saved templates" },
  { to: "/business/subscription", icon: CreditCard, label: "Subscription" },
];

// Page titles for the top bar, matched by path prefix (longest first).
const PAGE_TITLES: [string, string][] = [
  ["/business/promotion-templates/create", "New template"],
  ["/business/promotion-templates", "Saved templates"],
  ["/business/create-promotion", "Create promotion"],
  ["/business/edit-promotion", "Edit promotion"],
  ["/business/promotions", "My promotions"],
  ["/business/subscription", "Subscription"],
  ["/business/checkout", "Checkout"],
  ["/business/public-profile", "Public profile"],
  ["/business/dashboard", "Dashboard"],
];

const BusinessLayout = ({ children }: { children: React.ReactNode }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const { business, businessToken, accountType } = useAppSelector(
    (state) => state.auth,
  );
  const handleLogout = () => {
    dispatch(logout());
  };

  // PrivateRoute should prevent this; render nothing until auth is known.
  if (!businessToken || !business || accountType !== "business") {
    return null;
  }

  const pageTitle =
    PAGE_TITLES.find(([prefix]) => pathname?.startsWith(prefix))?.[1] ||
    "Business portal";

  const avatar = (size: string) => (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center overflow-hidden rounded-full border border-gold/40 bg-gold/10 text-sm font-bold text-gold",
        size,
      )}
    >
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
  );

  return (
    <div className="flex h-screen">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-[rgb(2_4_10/0.7)] backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-[85vw] max-w-[17rem] transform flex-col border-r border-sidebar-border bg-sidebar transition-transform duration-300 lg:static lg:w-[17rem] lg:translate-x-0",
          "bg-[radial-gradient(120%_40%_at_0%_0%,hsl(var(--gold)/0.08),transparent_60%)]",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-[4.5rem] items-center justify-between px-5">
          <Link href="/" className="flex items-center gap-3">
            <img src="/logo.png" className="h-12 w-auto" alt="Hopping Deals" />
            <span className="font-display text-[0.8rem] font-semibold leading-tight text-foreground">
              Business
              <br />
              <span className="text-gold">portal</span>
            </span>
          </Link>
          <button
            className="rounded-lg p-2 text-muted-foreground hover:bg-sidebar-accent lg:hidden"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="px-4 pb-2 pt-3">
          <Button asChild variant="hero" className="h-11 w-full">
            <NavLink
              to="/business/create-promotion"
              onClick={() => setSidebarOpen(false)}
            >
              <Plus className="h-5 w-5" />
              Create promotion
            </NavLink>
          </Button>
        </div>

        <nav
          aria-label="Business"
          className="flex-1 space-y-1 overflow-y-auto px-4 py-4"
        >
          {sidebarLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) => sidebarItemClass(isActive)}
            >
              <link.icon className="h-[1.15rem] w-[1.15rem]" />
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-sidebar-border p-4">
          <Link
            href={`/business/${business.id}`}
            className="group relative isolate mb-3 block overflow-hidden rounded-2xl border border-white/10 px-4 py-4 transition-colors hover:border-gold/50"
          >
            <SceneBackdrop name="storefront" fade="left" compact />
            <span className="block text-sm font-semibold text-white">
              Your public page
            </span>
            <span className="mt-0.5 flex items-center gap-1.5 text-xs text-white/75 group-hover:text-gold">
              See what shoppers see
              <ExternalLink className="h-3.5 w-3.5" />
            </span>
          </Link>
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-sidebar-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
          >
            <LogOut className="h-4 w-4" />
            Log out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex h-screen min-w-0 flex-1 flex-col overflow-hidden">
        <header className="hd-glass sticky top-0 z-30 flex h-[4.5rem] flex-shrink-0 items-center justify-between gap-3 border-b border-border/70 px-3 sm:px-5 lg:px-8">
          <div className="flex min-w-0 items-center gap-2">
            <button
              className="rounded-lg p-2 text-foreground hover:bg-accent lg:hidden"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              aria-label="Toggle menu"
            >
              {sidebarOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
            <p className="truncate text-base font-semibold text-foreground sm:text-lg">
              {pageTitle}
            </p>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex min-w-0 items-center gap-2 rounded-2xl border border-border bg-card/60 py-1.5 pl-1.5 pr-2.5 transition-colors hover:border-gold/40 sm:gap-3">
                {avatar("h-9 w-9")}
                <div className="hidden min-w-0 text-left sm:block">
                  <p className="max-w-[12rem] truncate text-sm font-semibold text-foreground">
                    {business?.name}
                  </p>
                  <p className="max-w-[12rem] truncate text-[11px] text-muted-foreground">
                    {business?.email}
                  </p>
                </div>
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem asChild>
                <NavLink to="/business/profile" className="cursor-pointer">
                  <UserCog className="mr-2 h-4 w-4 text-gold" />
                  My profile
                </NavLink>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <NavLink to="/business/subscription" className="cursor-pointer">
                  <CreditCard className="mr-2 h-4 w-4 text-gold" />
                  Subscription
                </NavLink>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleLogout}
                className="cursor-pointer text-destructive focus:text-destructive"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>

        <main className="flex-1 overflow-auto">
          <div className="mx-auto w-full max-w-[90rem] p-4 sm:p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default BusinessLayout;

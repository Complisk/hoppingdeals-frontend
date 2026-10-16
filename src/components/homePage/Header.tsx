"use client";

// Site header for every public page.
//   overlay=true (homepage): transparent, absolutely positioned over the hero,
//     keeping the original two-row hero layout (logo / location + login).
//   default (all other public pages): sticky midnight glass bar in one row
//     on desktop, two compact rows on phones.
// `light` is kept for backwards compatibility; the product is dark-only now,
// so it renders the same sticky bar.
// The hamburger opens a Radix DropdownMenu; the current route gets the gold
// marker. Auth state decides whether Login/Register or Profile/Logout appear.

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { motion } from "framer-motion";
import {
  Menu,
  Info,
  BookOpen,
  Image as ImageIcon,
  Grid,
  Building2,
  LogIn,
  UserPlus,
  User,
  LayoutDashboard,
  LogOut,
  ChevronRight,
  Store,
} from "lucide-react";
import { RootState } from "@/store";
import { logout as userLogout } from "@/store/authSlice";
import Logo from "../shared/Logo";
import HeaderLocationSearch from "../shared/HeaderLocationSearch";
import { cn } from "@/lib/utils";
import { BROWSE_CATEGORIES } from "@/lib/deal";

const PUBLIC_ITEMS_BEFORE_CATEGORIES = [
  { label: "About us", href: "/about-us", Icon: Info },
  { label: "Blog", href: "/blog", Icon: BookOpen },
  { label: "Photo gallery", href: "/photos", Icon: ImageIcon },
];

const PUBLIC_ITEMS_AFTER_CATEGORIES = [
  {
    label: "Business directory",
    href: "/hopping-deals-business-directory",
    Icon: Building2,
  },
];

// Slugs match the BUSINESS_CATEGORIES used by the feed.
const CATEGORIES = BROWSE_CATEGORIES;

const menuItemClass = (active: boolean) =>
  cn(
    "relative flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium outline-none transition-colors cursor-pointer",
    active
      ? "bg-accent text-gold before:absolute before:left-0 before:top-2 before:bottom-2 before:w-[3px] before:rounded-full before:bg-gold"
      : "text-foreground/85 hover:bg-accent hover:text-foreground focus:bg-accent focus:text-foreground",
  );

interface HeaderProps {
  /** Transparent over the homepage hero (absolute, white text) */
  overlay?: boolean;
  /** Deprecated: content pages now share the dark sticky bar */
  light?: boolean;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const Header: React.FC<HeaderProps> = ({ overlay = false, light = false }) => {
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useDispatch();
  // Auth is restored from localStorage after mount; wait one render so the
  // first client render matches the server HTML (logged-out).
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const storedUser = useSelector((state: RootState) => state.auth.user);
  const storedBusiness = useSelector((state: RootState) => state.auth.business);
  const user = mounted ? storedUser : null;
  const business = mounted ? storedBusiness : null;
  const isAuthed = Boolean(user || business);
  const displayName = user?.fullName || business?.name;

  const handleLogout = () => {
    dispatch(userLogout());
    router.push("/auth/login");
  };

  const accountLink = displayName ? (
    <Link
      href={business ? "/business/profile" : "/user/profile"}
      className="inline-flex items-center gap-2 rounded-full text-sm transition-colors hover:text-gold"
      title={business ? "Go to business profile" : "Go to my profile"}
    >
      <span className="grid h-7 w-7 place-items-center rounded-full border border-gold/40 bg-gold/10 text-xs font-bold text-gold">
        {displayName.charAt(0).toUpperCase()}
      </span>
      <span className="hidden max-w-[12rem] truncate lg:inline">
        {displayName}
      </span>
    </Link>
  ) : (
    <Link
      href="/auth/login"
      className="site-header__login text-sm font-semibold transition-colors hover:text-gold"
    >
      Log in
    </Link>
  );

  const portalButton = (
    <Link
      href="/business/visitor"
      className="inline-flex min-h-[2.5rem] items-center justify-center gap-2 whitespace-nowrap rounded-xl border border-white/80 bg-[#d9232e] px-4 text-[0.88rem] font-black leading-none text-white shadow-[0_8px_22px_-8px_rgb(217_35_46/0.8)] transition-[background-color,transform] duration-200 hover:-translate-y-px hover:bg-[#b91621]"
    >
      <Store className="hidden h-4 w-4 sm:block" aria-hidden="true" />
      Business Portal
    </Link>
  );

  const menu = (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          type="button"
          aria-label="Open menu"
          className={cn(
            "grid min-h-[2.75rem] w-[3rem] cursor-pointer place-items-center content-center gap-[0.1rem] rounded-xl border-0 bg-transparent text-white transition-colors hover:text-gold focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold",
            overlay && "drop-shadow-[0_2px_3px_rgb(0_0_0/0.6)]",
          )}
        >
          <Menu aria-hidden="true" strokeWidth={2.4} className="h-6 w-6" />
          <span className="font-[Georgia,'Times_New_Roman',Times,serif] text-[0.7rem] font-bold italic leading-none">
            Menu
          </span>
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content align="end" sideOffset={10} asChild>
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.18 }}
            className="z-50 w-72 rounded-2xl border border-border bg-popover/95 p-2 text-popover-foreground shadow-xl backdrop-blur-xl"
          >
            {PUBLIC_ITEMS_BEFORE_CATEGORIES.map((item) => (
              <MenuItem
                key={item.href}
                href={item.href}
                Icon={item.Icon}
                label={item.label}
                active={
                  pathname === item.href || pathname?.startsWith(`${item.href}/`)
                }
              />
            ))}

            <DropdownMenu.Sub>
              <DropdownMenu.SubTrigger
                className={cn(
                  menuItemClass(
                    Boolean(
                      pathname?.startsWith("/category/") ||
                        pathname === "/categories",
                    ),
                  ),
                  "data-[state=open]:bg-accent data-[state=open]:text-foreground",
                )}
              >
                <Grid className="h-[1.1rem] w-[1.1rem] text-gold" />
                <span className="flex-1">Categories</span>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </DropdownMenu.SubTrigger>

              <DropdownMenu.Portal>
                <DropdownMenu.SubContent
                  sideOffset={8}
                  alignOffset={-4}
                  className="z-50 max-h-[60vh] w-64 overflow-y-auto rounded-2xl border border-border bg-popover/95 p-2 text-popover-foreground shadow-xl backdrop-blur-xl"
                >
                  {CATEGORIES.map((cat) => {
                    const href = `/category/${cat.slug}`;
                    return (
                      <DropdownMenu.Item asChild key={cat.slug}>
                        <Link
                          href={href}
                          className={cn(
                            menuItemClass(pathname === href),
                            "py-2",
                          )}
                        >
                          {cat.label}
                        </Link>
                      </DropdownMenu.Item>
                    );
                  })}
                </DropdownMenu.SubContent>
              </DropdownMenu.Portal>
            </DropdownMenu.Sub>

            {PUBLIC_ITEMS_AFTER_CATEGORIES.map((item) => (
              <MenuItem
                key={item.href}
                href={item.href}
                Icon={item.Icon}
                label={item.label}
                active={
                  pathname === item.href || pathname?.startsWith(`${item.href}/`)
                }
              />
            ))}

            <DropdownMenu.Separator className="my-2 h-px bg-border" />

            {!isAuthed && (
              <>
                <MenuItem
                  href="/auth/login"
                  Icon={LogIn}
                  label="Log in"
                  active={pathname === "/auth/login" || pathname === "/login"}
                />
                <MenuItem
                  href="/auth/register"
                  Icon={UserPlus}
                  label="Create account"
                  active={pathname === "/auth/register"}
                />
              </>
            )}

            {isAuthed && (
              <>
                <div className="flex items-center gap-2.5 px-3.5 py-2">
                  <span className="grid h-8 w-8 place-items-center rounded-full border border-gold/40 bg-gold/10 text-sm font-bold text-gold">
                    {displayName?.charAt(0).toUpperCase()}
                  </span>
                  <span className="truncate text-sm font-semibold">
                    {displayName}
                  </span>
                </div>

                {business && (
                  <>
                    <MenuItem
                      href="/business/dashboard"
                      Icon={LayoutDashboard}
                      label="Business dashboard"
                      active={Boolean(pathname?.startsWith("/business/dashboard"))}
                    />
                    <MenuItem
                      href="/business/profile"
                      Icon={User}
                      label="My profile"
                      active={pathname === "/business/profile"}
                    />
                  </>
                )}

                {user && (
                  <MenuItem
                    href="/user/profile"
                    Icon={User}
                    label="My profile"
                    active={pathname === "/user/profile"}
                  />
                )}

                <DropdownMenu.Item
                  onSelect={handleLogout}
                  className={menuItemClass(false)}
                >
                  <LogOut className="h-[1.1rem] w-[1.1rem] text-primary-light" />
                  Log out
                </DropdownMenu.Item>
              </>
            )}
          </motion.div>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );

  if (overlay) {
    return (
      <header className="absolute inset-x-0 top-0 z-40 text-white">
        <div className="mx-auto grid w-[min(80rem,100%)] grid-cols-[auto_1fr] grid-rows-[3.45rem_2.35rem] items-center gap-[clamp(0.8rem,2vw,1.75rem)] px-[clamp(0.75rem,3vw,2rem)] py-3 sm:py-7">
          <div className="col-start-1 row-start-1">
            <Logo />
          </div>

          <div className="col-start-1 col-end-[-1] row-start-2 flex min-w-0 items-center justify-between gap-3">
            <HeaderLocationSearch light />
            <div className="drop-shadow-[0_2px_4px_rgb(0_0_0/0.7)]">
              {accountLink}
            </div>
          </div>

          <div className="col-start-2 row-start-1 flex items-center justify-end gap-[clamp(0.55rem,1.5vw,1rem)]">
            {portalButton}
            {menu}
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="hd-glass sticky top-0 z-40 border-b border-gold/20 text-white shadow-[0_12px_32px_rgb(0_0_0/0.35)]">
      <div className="mx-auto flex w-[min(80rem,100%)] flex-wrap items-center gap-x-4 gap-y-2 px-[clamp(0.75rem,3vw,2rem)] py-2.5">
        <div className="shrink-0 [&_img]:w-14 md:[&_img]:w-16">
          <Logo />
        </div>

        <div className="order-3 flex w-full min-w-0 items-center justify-between gap-3 md:order-none md:w-auto md:flex-1">
          <HeaderLocationSearch light />
          <div className="md:ml-auto">{accountLink}</div>
        </div>

        <div className="ml-auto flex items-center gap-2 md:ml-0">
          {portalButton}
          {menu}
        </div>
      </div>
    </header>
  );
};

function MenuItem({
  href,
  Icon,
  label,
  active = false,
}: {
  href: string;
  Icon: React.ComponentType<{ className?: string }>;
  label: string;
  active?: boolean;
}) {
  return (
    <DropdownMenu.Item asChild>
      <Link href={href} className={menuItemClass(active)}>
        <Icon className="h-[1.1rem] w-[1.1rem] text-gold" />
        {label}
      </Link>
    </DropdownMenu.Item>
  );
}

export default Header;

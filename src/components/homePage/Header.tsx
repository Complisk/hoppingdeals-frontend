"use client";

// Header — ported 1:1 from the HoppingDeals home header UI.
//   Top row:    Logo (left) ── Business Portal button + hamburger menu (right)
//   Bottom row: HeaderLocationSearch (left) ── Welcome/Login link (right)
//
//   overlay=true (homepage): absolute + transparent so the hero shows through.
//   overlay=false (other pages): fixed dark navy header.
// The hamburger opens a Radix DropdownMenu; the current route is highlighted in
// red. Auth state controls whether Login/Register or Profile/Logout appear.

import Link from "next/link";
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
} from "lucide-react";
import { RootState } from "@/store";
import { logout as userLogout } from "@/store/authSlice";
import Logo from "../shared/Logo";
import HeaderLocationSearch from "../shared/HeaderLocationSearch";
import { cn } from "@/lib/utils";

const PRIMARY = "#E31E24";

// Top-level menu items that aren't the Categories submenu.
const PUBLIC_ITEMS_BEFORE_CATEGORIES = [
  { label: "About Us", href: "/about-us", Icon: Info },
  { label: "Blog", href: "/blog", Icon: BookOpen },
  { label: "Photo Gallery", href: "/photos", Icon: ImageIcon },
];

const PUBLIC_ITEMS_AFTER_CATEGORIES = [
  {
    label: "Hopping Deals Business Directory",
    href: "/hopping-deals-business-directory",
    Icon: Building2,
  },
];

// Category list mirrors the Hopping Deals categories. Each entry links to
// /category/<slug> — slugs match the BUSINESS_CATEGORIES used by the feed.
const CATEGORIES: { label: string; slug: string }[] = [
  { label: "Restaurants", slug: "restaurants" },
  { label: "Beauty & Spas", slug: "beauty-&-spas" },
  { label: "Home Services", slug: "home-services" },
  { label: "Coffee & Tea", slug: "coffee-&-tea" },
  { label: "Food", slug: "food" },
  { label: "Auto Services", slug: "auto-services" },
  { label: "Pets", slug: "pets" },
  { label: "Professional Services", slug: "professional-services" },
  { label: "Health & Medical", slug: "health-&-medical" },
  { label: "Event Planning & Services", slug: "event-planning-&-services" },
  { label: "Hotels & Casinos", slug: "hotels-&-casinos" },
  { label: "Nightlife", slug: "nightlife" },
  { label: "Active Life", slug: "active-life" },
  { label: "Education", slug: "education" },
  { label: "Arts & Entertainment", slug: "arts-&-entertainment" },
  { label: "Travel & Activities", slug: "travel-&-activities" },
];

interface HeaderProps {
  overlay?: boolean;
}

const Header: React.FC<HeaderProps> = ({ overlay = false }) => {
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.auth.user);
  const business = useSelector((state: RootState) => state.auth.business);
  const isAuthed = Boolean(user || business);

  const handleLogout = () => {
    dispatch(userLogout());
    router.push("/auth/login");
  };

  return (
    <>
      <header
        className={[
          overlay ? "absolute z-40 inset-x-0 top-0" : "fixed z-40 inset-x-0 bg-white top-0",
          "text-white",
          overlay
            ? "border-b border-transparent bg-transparent shadow-none"
            : "border-b border-[rgb(245_197_92/0.48)] bg-[rgb(3_8_25/0.97)] shadow-[0_12px_32px_rgb(0_0_0/0.28)]",
        ].join(" ")}
      >
        <div
          className="
            w-[min(80rem,100%)] mx-auto
            px-[clamp(0.75rem,3vw,2rem)]
            sm:py-7
 py-3            grid grid-cols-[auto_1fr]
            grid-rows-[3.45rem_2.35rem]
            items-center
            gap-[clamp(0.8rem,2vw,1.75rem)]
          "
        >
          <div className="col-start-1 row-start-1">
            <Logo />
          </div>

          <div
            className="
              col-start-1 col-end-[-1]
              row-start-2
               flex justify-between items-center
              min-w-0
            "
          >
            <HeaderLocationSearch light />
            {user?.fullName || business?.name ? (
              <span className="site-header__welcome">
                Welcome, {user?.fullName || business?.name}
              </span>
            ) : (
              <Link href="/auth/login" className="site-header__login">
                Login
              </Link>
            )}
          </div>

          <div className="col-start-2 row-start-1 flex items-center justify-end gap-[clamp(0.55rem,1.5vw,1rem)]">
            <Link
              href="/business/visitor"
              className="
                min-h-[2.55rem] inline-flex items-center justify-center
                px-[0.95rem] py-[0.6rem]
                border border-white
                rounded-[6px]
                bg-[#d9232e] text-white
                text-[0.88rem] font-black leading-[1]
                whitespace-nowrap
                transition-transform transition-colors duration-200
                hover:bg-[#b91621] hover:translate-y-[-1px]
              "
            >
              Business Portal
            </Link>

            <DropdownMenu.Root>
              <DropdownMenu.Trigger asChild>
                <button
                  type="button"
                  aria-label="Open menu"
                  className="
                    w-[3.25rem] min-h-[3.35rem]
                    grid place-items-center content-center
                    gap-[0.05rem]
                    border-0 bg-transparent
                    cursor-pointer text-white
                    filter drop-shadow-[0_2px_3px_rgb(0_0_0/0.6)]
                    hover:text-[#f5c55c]
                    transition-colors
                  "
                >
                  <Menu
                    aria-hidden="true"
                    strokeWidth={2.4}
                    className="h-[1.65rem] w-[1.65rem]"
                  />
                  <span
                    className="
                      font-[Georgia,'Times New Roman',Times,serif]
                      text-[0.73rem] italic font-bold leading-[1]
                    "
                  >
                    Menu
                  </span>
                </button>
              </DropdownMenu.Trigger>

              <DropdownMenu.Portal>
                <DropdownMenu.Content align="end" sideOffset={10} asChild>
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.2 }}
                    className="z-50 w-64 rounded-lg border border-gray-200 bg-white/95 p-2 shadow-xl backdrop-blur-xl"
                  >
                    {PUBLIC_ITEMS_BEFORE_CATEGORIES.map((item) => (
                      <MenuItem
                        key={item.href}
                        href={item.href}
                        Icon={item.Icon}
                        label={item.label}
                        active={
                          pathname === item.href ||
                          pathname?.startsWith(`${item.href}/`)
                        }
                      />
                    ))}

                    <DropdownMenu.Sub>
                      <DropdownMenu.SubTrigger
                        className={cn(
                          "flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer text-sm font-medium transition outline-none data-[state=open]:bg-red-50 data-[state=open]:text-[#E31E24]",
                          pathname?.startsWith("/category/") ||
                            pathname === "/categories"
                            ? "bg-red-50 text-[#E31E24]"
                            : "text-gray-700 hover:bg-red-50 hover:text-[#E31E24]",
                        )}
                      >
                        <span className="text-[#E31E24]">
                          <Grid className="h-5 w-5" />
                        </span>
                        <span className="flex-1">Categories</span>
                        <ChevronRight className="h-4 w-4 text-gray-400" />
                      </DropdownMenu.SubTrigger>

                      <DropdownMenu.Portal>
                        <DropdownMenu.SubContent
                          sideOffset={8}
                          alignOffset={-4}
                          className="z-50 max-h-[60vh] w-64 overflow-y-auto rounded-lg border border-gray-200 bg-white/95 p-2 shadow-xl backdrop-blur-xl"
                        >
                          {CATEGORIES.map((cat) => {
                            const href = `/category/${cat.slug}`;
                            const active = pathname === href;
                            return (
                              <DropdownMenu.Item asChild key={cat.slug}>
                                <Link
                                  href={href}
                                  className={cn(
                                    "block px-4 py-2.5 rounded-lg text-sm font-medium transition outline-none cursor-pointer",
                                    active
                                      ? "bg-red-50 text-[#E31E24]"
                                      : "text-gray-700 hover:bg-red-50 hover:text-[#E31E24]",
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
                          pathname === item.href ||
                          pathname?.startsWith(`${item.href}/`)
                        }
                      />
                    ))}

                    {!isAuthed && (
                      <>
                        <DropdownMenu.Separator className="my-2 h-px bg-gray-200" />
                        <MenuItem
                          href="/auth/login"
                          Icon={LogIn}
                          label="Login"
                          active={
                            pathname === "/auth/login" || pathname === "/login"
                          }
                        />
                        <MenuItem
                          href="/auth/register"
                          Icon={UserPlus}
                          label="Register"
                          active={pathname === "/auth/register"}
                        />
                      </>
                    )}

                    {isAuthed && (
                      <>
                        <DropdownMenu.Separator className="my-2 h-px bg-gray-200" />
                        <div className="px-4 py-2 text-gray-500 text-xs uppercase tracking-wide">
                          {user?.fullName || business?.name}
                        </div>

                        {business && (
                          <MenuItem
                            href="/business/dashboard"
                            Icon={LayoutDashboard}
                            label="Business Dashboard"
                            active={pathname?.startsWith("/business/dashboard")}
                          />
                        )}

                        {user && (
                          <MenuItem
                            href="/user/profile"
                            Icon={User}
                            label="My Profile"
                            active={pathname === "/user/profile"}
                          />
                        )}

                        <DropdownMenu.Item
                          onSelect={handleLogout}
                          className="flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer text-gray-700 text-sm font-medium hover:bg-red-50 hover:text-[#E31E24] focus:outline-none transition"
                        >
                          <span style={{ color: PRIMARY }}>
                            <LogOut size={18} />
                          </span>
                          Logout
                        </DropdownMenu.Item>
                      </>
                    )}
                  </motion.div>
                </DropdownMenu.Content>
              </DropdownMenu.Portal>
            </DropdownMenu.Root>
          </div>
        </div>
      </header>

      <div className={overlay ? "h-0" : "h-[6.65rem]"} aria-hidden="true" />
    </>
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
      <Link
        href={href}
        className={cn(
          "flex items-center gap-3 rounded-md px-4 py-3 text-sm font-medium transition outline-none",
          active
            ? "bg-red-50 text-[#E31E24]"
            : "text-gray-700 hover:bg-red-50 hover:text-[#E31E24]",
        )}
      >
        <span className="text-[#E31E24]">
          <Icon className="h-5 w-5" />
        </span>
        {label}
      </Link>
    </DropdownMenu.Item>
  );
}

export default Header;

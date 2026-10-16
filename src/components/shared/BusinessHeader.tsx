"use client";
import React, { useEffect, useRef, useState } from "react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { Info, LogIn, UserPlus, LogOut, User, Building2 } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../../store/authSlice";
import type { RootState } from "../../store/index";
import Logo from "./Logo";

interface BusinessHeaderProps {
  /** Transparent absolute header over the page hero (like the home page overlay header) */
  overlay?: boolean;
}

const BusinessHeader: React.FC<BusinessHeaderProps> = ({ overlay = false }) => {
  const dispatch = useDispatch();
  const router = useRouter();
  const [showHeader, setShowHeader] = useState(true);
  const lastScrollY = useRef(0);

  const business = useSelector((state: RootState) => state.auth.business);
  const isBusinessLoggedIn = useSelector(
    (state: RootState) => state.auth.businessToken !== null,
  );

  const handleLogout = () => {
    dispatch(logout());
    router.push("/business/login");
  };

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY > lastScrollY.current && currentScrollY > 80) {
        setShowHeader(false);
      } else {
        setShowHeader(true);
      }

      lastScrollY.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <header
        className={[
          overlay
            ? "absolute inset-x-0 top-0 z-40"
            : "z-50",
          overlay
            ? "border-b border-transparent bg-transparent shadow-none"
            : "border-b border-white/10 bg-[rgb(3_8_25/0.97)] shadow-[0_12px_32px_rgb(0_0_0/0.28)]",
          "px-3 py-3 sm:px-6 sm:py-4",
        ].join(" ")}
      >
        <div className="mx-auto grid max-w-7xl grid-cols-[auto,minmax(0,1fr),auto] items-center gap-2 sm:gap-4">
          <div className="shrink-0">
            <Logo />
          </div>

          <div className="min-w-0 px-1 text-center sm:px-2">
            {isBusinessLoggedIn && business ? (
              <Link
                href="/business/profile"
                className="block hover:underline"
                title={business.name}
              >
                <h1 className="truncate text-sm font-bold text-white sm:text-xl lg:text-2xl">
                  {business.name}
                </h1>
              </Link>
            ) : null}
          </div>

          <div className="flex items-center justify-end gap-2 sm:gap-4">
            {!isBusinessLoggedIn && (
              <Link href="/business/login" className="inline-flex h-10 items-center justify-center whitespace-nowrap rounded-xl border border-white/80 bg-[#d9232e] px-4 text-sm font-black text-white shadow-[0_8px_22px_-8px_rgb(217_35_46/0.8)] transition-[background-color,transform] hover:-translate-y-px hover:bg-[#b91621]">
                Log in
              </Link>
            )}
            {isBusinessLoggedIn && (
              <Link href="/business/dashboard" className="inline-flex h-10 items-center justify-center whitespace-nowrap rounded-xl border border-white/80 bg-[#d9232e] px-4 text-sm font-black text-white shadow-[0_8px_22px_-8px_rgb(217_35_46/0.8)] transition-[background-color,transform] hover:-translate-y-px hover:bg-[#b91621]">
                Dashboard
              </Link>
            )}

            <DropdownMenu.Root>
              <DropdownMenu.Trigger asChild>
                <button aria-label="Open menu" className="grid h-10 w-10 place-items-center rounded-xl border border-white/20 bg-[rgb(3_8_25/0.5)] text-white backdrop-blur-md transition hover:border-gold/60 hover:text-gold">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16m-7 6h7"
                    />
                  </svg>
                </button>
              </DropdownMenu.Trigger>

              <DropdownMenu.Portal>
                <DropdownMenu.Content align="end" sideOffset={10} asChild>
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.2 }}
                    className="z-50 w-60 rounded-2xl border border-border bg-popover/95 p-2 shadow-xl backdrop-blur-xl"
                  >
                    <MenuItem icon={<Info />} label="About Us" to="/about-us" />
                    <MenuItem
                      icon={<Building2 />}
                      label="Hopping Deals Business Directory"
                      to="/hopping-deals-business-directory"
                    />
                    {!isBusinessLoggedIn && (
                      <>
                        <MenuItem
                          icon={<LogIn />}
                          label="Login"
                          to="/business/login"
                        />
                        <MenuItem
                          icon={<UserPlus />}
                          label="Register"
                          to="/business/register"
                        />
                      </>
                    )}
                    {isBusinessLoggedIn && (
                      <>
                        <MenuItem
                          icon={<User />}
                          label="My Profile"
                          to="/business/profile"
                        />
                        <MenuItem
                          icon={<LogOut />}
                          label="Logout"
                          onClick={handleLogout}
                        />
                      </>
                    )}
                  </motion.div>
                </DropdownMenu.Content>
              </DropdownMenu.Portal>
            </DropdownMenu.Root>
          </div>
        </div>
      </header>
    </>
  );
};

export default BusinessHeader;

/* ---------- Menu Item Component ---------- */
const MenuItem = ({
  icon,
  label,
  to,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  to?: string;
  onClick?: () => void;
}) => {
  const content = (
    <div
      className="flex cursor-pointer items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium text-foreground/85 outline-none transition-colors hover:bg-accent hover:text-foreground focus:bg-accent [&_svg]:h-[1.1rem] [&_svg]:w-[1.1rem]"
    >
      <span className="text-gold">{icon}</span>
      {label}
    </div>
  );

  if (onClick) {
    return (
      <DropdownMenu.Item asChild>
        <button onClick={onClick} className="w-full text-left">
          {content}
        </button>
      </DropdownMenu.Item>
    );
  }

  if (to) {
    return (
      <DropdownMenu.Item asChild>
        <Link href={to}>{content}</Link>
      </DropdownMenu.Item>
    );
  }

  return (
    <DropdownMenu.Item
      className="flex cursor-pointer items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium text-foreground/85 outline-none transition-colors hover:bg-accent hover:text-foreground focus:bg-accent [&_svg]:h-[1.1rem] [&_svg]:w-[1.1rem]"
    >
      <span className="text-gold">{icon}</span>
      {label}
    </DropdownMenu.Item>
  );
};

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

const BusinessHeader: React.FC = () => {
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
      <header className=" z-50 border-b border-gray-100 bg-white px-3 py-3 sm:px-6 sm:py-4">
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
                <h1 className="truncate text-sm font-bold text-gray-800 sm:text-xl lg:text-2xl">
                  {business.name}
                </h1>
              </Link>
            ) : null}
          </div>

          <div className="flex items-center justify-end gap-2 sm:gap-4">
            {!isBusinessLoggedIn && (
              <Link href={"/business/login"}>
                <button className="inline-flex items-center justify-center whitespace-nowrap rounded-md border border-black px-2 py-1 text-xs font-medium text-[#E31E24] transition hover:bg-red-100 sm:px-3 sm:text-sm md:text-base">
                  Login
                </button>
              </Link>
            )}
            {isBusinessLoggedIn && (
              <Link href={"/business/dashboard"}>
                <button className="inline-flex items-center justify-center whitespace-nowrap rounded-md border border-black px-2 py-1 text-xs font-medium text-[#E31E24] transition hover:bg-red-100 sm:px-3 sm:text-sm md:text-base">
                  Business Dashboard
                </button>
              </Link>
            )}

            <DropdownMenu.Root>
              <DropdownMenu.Trigger asChild>
                <button className="rounded-xl border border-gray-200 p-2 transition hover:bg-gray-100 sm:p-2.5">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-gray-500 sm:h-6 sm:w-6"
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
                    className="w-56 rounded-2xl bg-white/90 backdrop-blur-xl
                               shadow-xl border border-gray-200  z-50 p-2"
                  >
                    <MenuItem icon={<Info />} label="About Us" to="/about-us" />
                    <MenuItem
                      icon={<Building2 />}
                      label="Complisk Business Directory"
                      to="/complisk-business-directory"
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
      className="flex items-center gap-3 px-4 py-3 rounded-xl
               cursor-pointer text-gray-700 text-sm font-medium
               hover:bg-red-50 hover:text-[#E31E24]
               focus:outline-none transition"
    >
      <span className="text-[#E31E24]">{icon}</span>
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
      className="flex items-center gap-3 px-4 py-3 rounded-xl
               cursor-pointer text-gray-700 text-sm font-medium
               hover:bg-red-50 hover:text-[#E31E24]
               focus:outline-none transition"
    >
      <span className="text-[#E31E24]">{icon}</span>
      {label}
    </DropdownMenu.Item>
  );
};

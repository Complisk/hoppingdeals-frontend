"use client";
﻿import React, { useEffect, useState, useRef } from "react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import {
  Info,
  BookOpen,
  Image,
  Grid,
  LogOut,
  User,
  X,
  Building2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/store";
import { logout as userLogout } from "@/store/authSlice";
import { BUSINESS_CATEGORIES } from "@/constants/business";
import Logo from "../shared/Logo";
import HeaderLocationSearch from "../shared/HeaderLocationSearch";

const Header: React.FC = () => {
  const router = useRouter();
  const dispatch = useDispatch();

  const user = useSelector((state: RootState) => state.auth.user);
  const business = useSelector((state: RootState) => state.auth.business);
  const accountType = useSelector((state: RootState) => state.auth.accountType);
  const displayName =
    accountType === "business"
      ? business?.name
      : accountType === "user"
        ? user?.fullName
        : null;
  const profileRoute =
    accountType === "business"
      ? "/business/profile"
      : accountType === "user"
        ? "/user/profile"
        : null;

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);
  const [isMobileCategoriesModalOpen, setIsMobileCategoriesModalOpen] =
    useState(false);
  function CloseMenu() {
    setIsMenuOpen(false);
  }
  const handleLogout = () => {
    dispatch(userLogout());
    router.push("/auth/login");
  };

  return (
    <>
      <header className="py-3 px-4 z-50 sm:px-8 border-b border-gray-100  bg-white">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          {/* Logo */}
          <Logo />

          {/* Right Section */}
          <div className="flex items-center gap-2 sm:gap-4 md:gap-6">
            {accountType === "business" && business ? (
              <Link href="/business/dashboard">
                <button className="inline-flex items-center justify-center whitespace-nowrap rounded-md border border-black px-2 py-1 text-xs font-medium text-[#E31E24] hover:bg-red-100 sm:px-3 sm:text-sm md:text-base lg:text-lg">
                  Business Dashboard
                </button>
              </Link>
            ) : (
              <Link href="/business/visitor">
                <button className="inline-flex items-center justify-center whitespace-nowrap rounded-md border border-black px-2 py-1 text-xs font-medium text-[#E31E24] hover:bg-red-100 sm:px-3 sm:text-sm md:text-base lg:text-lg">
                  Business Portal
                </button>
              </Link>
            )}

            {/* MENU */}
            <DropdownMenu.Root open={isMenuOpen} onOpenChange={setIsMenuOpen}>
              <DropdownMenu.Trigger asChild>
                <button
                  className="p-2 rounded-xl border-gray-200 hover:bg-gray-100 transition
                                     md:p-2.5"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-7 w-7 text-gray-400 md:h-8 md:w-8"
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
                    className="w-56 md:w-64 rounded-2xl bg-white/90 backdrop-blur-xl
                                   shadow-xl border border-gray-200 z-50 p-2
                                   sm:w-auto sm:min-w-[260px] sm:max-w-[90vw]"
                  >
                    <Link href="/about-us" onClick={CloseMenu}>
                      <MenuItem icon={<Info />} label="About Us" />
                    </Link>
                    <Link href="/blog" onClick={CloseMenu}>
                      <MenuItem icon={<BookOpen />} label="Blog" />
                    </Link>
                    <Link href="/photos" onClick={CloseMenu}>
                      <MenuItem icon={<Image />} label="Photo Gallery" />
                    </Link>

                    {/* Mobile Categories Modal Trigger */}
                    <DropdownMenu.Item
                      onSelect={(event) => {
                        event.preventDefault();
                        setIsMenuOpen(false);
                        setIsMobileCategoriesModalOpen(true);
                      }}
                      className="sm:hidden flex items-center gap-3 px-4 py-3 rounded-xl
                                     cursor-pointer text-gray-700 text-sm font-medium
                                     hover:bg-red-50 hover:text-[#E31E24]
                                     focus:outline-none transition"
                    >
                      <span className="text-[#E31E24]">
                        <Grid size={18} />
                      </span>
                      Categories
                    </DropdownMenu.Item>

                    {/* Desktop Categories Submenu */}
                    <div className="hidden sm:block">
                      <DropdownMenu.Sub
                        open={isCategoriesOpen}
                        onOpenChange={setIsCategoriesOpen}
                      >
                        <DropdownMenu.SubTrigger
                          className="flex items-center gap-3 px-4 py-3 rounded-xl w-full text-left
                                         cursor-pointer text-gray-700 text-sm font-medium
                                         hover:bg-red-50 hover:text-[#E31E24]
                                         focus:outline-none transition md:text-base"
                        >
                          <span className="text-[#E31E24]">
                            <Grid size={18} />
                          </span>
                          Categories
                        </DropdownMenu.SubTrigger>

                        <DropdownMenu.Portal>
                          <DropdownMenu.SubContent
                            sideOffset={5}
                            alignOffset={-5}
                            className="w-64 md:w-72 bg-white/90 backdrop-blur-xl
                                         shadow-xl border border-gray-200 z-50 p-2 max-h-96 overflow-y-auto
                                         sm:max-h-[70vh] sm:w-auto sm:min-w-[280px] sm:max-w-[90vw]"
                          >
                            {BUSINESS_CATEGORIES.map((category) => (
                              <Link
                                key={category}
                                href={`/category/${category}`}
                                className="flex items-center gap-3 px-4 py-3 rounded-xl
                                             cursor-pointer text-gray-700 text-sm font-medium
                                             hover:bg-red-50 hover:text-[#E31E24]
                                             focus:outline-none transition w-full
                                             md:text-base md:py-2"
                              >
                                {category
                                  .replace(/-/g, " ")
                                  .replace(/\b\w/g, (l) => l.toUpperCase())}
                              </Link>
                            ))}
                          </DropdownMenu.SubContent>
                        </DropdownMenu.Portal>
                      </DropdownMenu.Sub>
                    </div>
                    <Link href="/complisk-business-directory" onClick={CloseMenu}>
                      <MenuItem
                        icon={<Building2 />}
                        label="Complisk Business Directory"
                      />
                    </Link>

                    {!user && !business && (
                      <>
                        <DropdownMenu.Separator className="my-2 h-px bg-gray-200" />
                        <Link href="/auth/login">
                          <MenuItem icon={<Info />} label="Login" />
                        </Link>
                        <Link href="/auth/register">
                          <MenuItem icon={<Info />} label="Register" />
                        </Link>
                      </>
                    )}

                    {(user || business) && (
                      <>
                        <DropdownMenu.Separator className="my-2 h-px bg-gray-200" />
                        <div className="px-4 py-3 text-gray-700 text-sm font-medium">
                          {displayName}
                        </div>
                        {profileRoute && (
                          <Link href={profileRoute}>
                            <MenuItem icon={<User />} label="My Profile" />
                          </Link>
                        )}
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl
                                         cursor-pointer text-gray-700 text-sm font-medium
                                         hover:bg-red-50 hover:text-[#E31E24]
                                         focus:outline-none transition"
                        >
                          <span className="text-[#E31E24]">
                            <LogOut size={18} />
                          </span>
                          Logout
                        </button>
                      </>
                    )}
                  </motion.div>
                </DropdownMenu.Content>
              </DropdownMenu.Portal>
            </DropdownMenu.Root>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="max-w-7xl mx-auto mt-4 flex justify-between items-center text-sm gap-4">
          <HeaderLocationSearch />

          {displayName ? (
            profileRoute ? (
              <Link href={profileRoute}>
                <span className="text-gray-700 hover:underline font-medium whitespace-nowrap">
                  Welcome • {displayName}
                </span>
              </Link>
            ) : (
              <span className="text-gray-700 font-medium whitespace-nowrap">
                Welcome • {displayName}
              </span>
            )
          ) : (
            <Link href="/auth/login">
              <div
                className="
               cursor-pointer text-gray-700 text-sm font-medium hover:text-[#E31E24]"
              >
                Login
              </div>
            </Link>
          )}
        </div>
      </header>

      <AnimatePresence>
        {isMobileCategoriesModalOpen && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[90] bg-white sm:hidden"
          >
            <div className="flex h-full flex-col">
              <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
                <h2 className="text-lg font-semibold text-gray-900">
                  Categories
                </h2>
                <button
                  type="button"
                  onClick={() => setIsMobileCategoriesModalOpen(false)}
                  className="rounded-lg p-2 text-gray-600 hover:bg-gray-100"
                  aria-label="Close categories"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-3">
                {BUSINESS_CATEGORIES.map((category) => (
                  <Link
                    key={category}
                    href={`/category/${category}`}
                    onClick={() => setIsMobileCategoriesModalOpen(false)}
                    className="flex items-center rounded-xl px-4 py-3 text-base font-medium text-gray-700
                               transition hover:bg-red-50 hover:text-[#E31E24]"
                  >
                    {category
                      .replace(/-/g, " ")
                      .replace(/\b\w/g, (l) => l.toUpperCase())}
                  </Link>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Header;

/* ---------- Menu Item Component ---------- */
const MenuItem = ({
  icon,
  label,
}: {
  icon: React.ReactNode;
  label: string;
}) => (
  <DropdownMenu.Item
    className="flex items-center gap-3 px-4 py-3 rounded-xl
               cursor-pointer text-gray-700 text-sm font-medium
               hover:bg-red-50 hover:text-[#E31E24]
               focus:outline-none transition
               md:text-base md:py-3.5"
  >
    <span className="text-[#E31E24]">{icon}</span>
    {label}
  </DropdownMenu.Item>
);

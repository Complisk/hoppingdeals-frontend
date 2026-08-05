"use client";
import { useState } from "react";
import Link from "next/link";
import { MapPin, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import Logo from "./Logo";
import { motion, AnimatePresence } from "framer-motion";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import HeaderLocationSearch from "./HeaderLocationSearch";

const locationOptions = [
  { id: "la", name: "Los Angeles", state: "CA" },
  { id: "sf", name: "San Francisco", state: "CA" },
  { id: "ny", name: "New York City", state: "NY" },
];

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(locationOptions[0]);

  return (
    <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-lg shadow-md border-b border-border">
      <div className="container mx-auto px-4">
        {/* Top Row */}
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Logo />

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="/"
              className="text-sm font-medium text-foreground hover:text-primary transition-colors"
            >
              Browse Promotions
            </Link>
            <Link
              href="/business/login"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Business Sign-in
            </Link>
          </nav>

          <HeaderLocationSearch />

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6 text-foreground" />
            ) : (
              <Menu className="h-6 w-6 text-foreground" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-border bg-background/95 backdrop-blur-lg"
            >
              <div className="py-4 space-y-3 px-4">
                {/* Location Selector */}
                <div>
                  <p className="text-xs text-muted-foreground mb-2">Location</p>
                  <div className="grid grid-cols-1 gap-2">
                    {locationOptions.map((location) => (
                      <button
                        key={location.id}
                        onClick={() => setSelectedLocation(location)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors w-full justify-start ${
                          selectedLocation.id === location.id
                            ? "bg-primary text-primary-foreground"
                            : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                        }`}
                      >
                        <MapPin className="h-4 w-4" />
                        {location.name}, {location.state}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="h-px bg-border" />

                {/* Mobile Navigation */}
                <Link
                  href="/"
                  className="block px-3 py-2 text-sm font-medium text-foreground hover:text-primary"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Browse Promotions
                </Link>
                <Link
                  href="/business/login"
                  className="block px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Business Sign-in
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
};

export default Header;

"use client";
import Link from "next/link";
import Logo from "./Logo";
import SupportMessageDialog from "@/components/support/SupportMessageDialog";

const Footer = () => {
  return (
    <footer className="border-t border-border bg-card">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <Logo />
            <p className="text-sm text-muted-foreground">
              Discover local promotions and deals from businesses in your area.
            </p>
          </div>

          {/* For Customers */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">
              For Customers
            </h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Browse Promotions
                </Link>
              </li>
              <li>
                <Link
                  href="/"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Categories
                </Link>
              </li>
              <li>
                <Link
                  href="/"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Nearby Deals
                </Link>
              </li>
            </ul>
          </div>

          {/* For Businesses */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">
              For Businesses
            </h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/business/login"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Business Sign-in
                </Link>
              </li>
              <li>
                <Link
                  href="/business/login"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  List Your Business
                </Link>
              </li>
              <li>
                <Link
                  href="/business/dashboard"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Dashboard
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Support</h4>
            <ul className="space-y-2">
              <li>
                <SupportMessageDialog
                  triggerLabel="Contact Us"
                  triggerVariant="link"
                  triggerSize="sm"
                  triggerClassName="p-0 h-auto text-sm text-muted-foreground hover:text-primary"
                />
              </li>
              <li>
                <Link
                  href="/admin/login"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Admin Portal
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            © 2026 Hopping Deals. All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link
              href="/"
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              Privacy Policy
            </Link>
            <Link
              href="/"
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

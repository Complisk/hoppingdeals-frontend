"use client";
import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Globe } from "lucide-react";
import SupportMessageDialog from "@/components/support/SupportMessageDialog";

const linkClass =
  "text-sm text-muted-foreground transition-colors hover:text-gold";

const dialogLinkClass =
  "h-auto justify-start bg-transparent p-0 text-sm font-normal text-muted-foreground transition-colors hover:bg-transparent hover:text-gold";

const Footer: React.FC = () => {
  return (
    <footer className="relative mt-16 overflow-hidden border-t border-gold/15 bg-[hsl(233_58%_8%)]">
      {/* Moon horizon glow along the top edge */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 -top-40 mx-auto h-56 w-[min(70rem,140%)] rounded-[50%] bg-[radial-gradient(closest-side,hsl(var(--gold)/0.16),transparent)]"
      />

      <div className="relative mx-auto max-w-7xl px-4 pb-10 pt-14 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-[1.3fr_1fr_1fr_1fr]">
          <div className="space-y-4">
            <Link href="/" className="inline-block">
              <Image
                src="/logo.png"
                alt="Hopping Deals"
                width={96}
                height={96}
                className="h-20 w-auto"
              />
            </Link>
            <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
              Coupons and promotions from local businesses, updated by the
              owners themselves.
            </p>
          </div>

          <div>
            <h3 className="mb-5 text-base font-semibold text-foreground">
              Support
            </h3>
            <p className="mb-4 text-sm text-muted-foreground">
              Shopper or business owner? Send us a message and we’ll reply by
              email.
            </p>
            <SupportMessageDialog
              triggerLabel="Message support"
              triggerVariant="outline"
              triggerClassName="rounded-xl"
            />
          </div>

          <div>
            <h3 className="mb-5 text-base font-semibold text-foreground">
              For businesses
            </h3>
            <ul className="space-y-3">
              <li>
                <Link href="/business/visitor" className={linkClass}>
                  List your business
                </Link>
              </li>
              <li>
                <Link href="/blog" className={linkClass}>
                  Promotion strategy
                </Link>
              </li>
              <li>
                <Link
                  href="/hopping-deals-business-directory"
                  className={linkClass}
                >
                  Business directory
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-5 text-base font-semibold text-foreground">
              Hopping Deals
            </h3>
            <ul className="space-y-3">
              <li>
                <Link href="/about-us" className={linkClass}>
                  About us
                </Link>
              </li>
              <li>
                <SupportMessageDialog
                  triggerLabel="Media & news"
                  triggerVariant="ghost"
                  triggerSize="sm"
                  triggerClassName={dialogLinkClass}
                />
              </li>
              <li>
                <SupportMessageDialog
                  triggerLabel="Careers"
                  triggerVariant="ghost"
                  triggerSize="sm"
                  triggerClassName={dialogLinkClass}
                />
              </li>
              <li>
                <SupportMessageDialog
                  triggerLabel="Investors"
                  triggerVariant="ghost"
                  triggerSize="sm"
                  triggerClassName={dialogLinkClass}
                />
              </li>
              <li>
                <SupportMessageDialog
                  triggerLabel="Non-profit organizations"
                  triggerVariant="ghost"
                  triggerSize="sm"
                  triggerClassName={dialogLinkClass}
                />
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-border/70 pt-6 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
          <p>© {new Date().getFullYear()} Hopping Deals, Inc.</p>
          <nav aria-label="Legal" className="flex flex-wrap gap-x-6 gap-y-2">
            <Link href="/terms" className={linkClass}>
              Terms & privacy
            </Link>
            <a href="/sitemap.xml" className={linkClass}>
              Sitemap
            </a>
            <span className="inline-flex items-center gap-1.5">
              <Globe className="h-4 w-4 text-gold" aria-hidden="true" />
              English (US), USD
            </span>
          </nav>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

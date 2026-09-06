"use client";
import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Check,
  Building2,
  Pencil,
  LayoutGrid,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip";
import Footer from "@/components/homePage/Footer";
import { cn } from "@/lib/utils";
import BusinessHeader from "@/components/shared/BusinessHeader";
import HelpTooltipTrigger from "@/components/shared/HelpTooltipTrigger";
import CreatePromotion from "./CreatePromotion";
import Seo from "@/components/seo/Seo";
import { SITE_URL } from "@/lib/seo";

const pricingPlans = [
  {
    id: "starter",
    name: "Starter",
    campaign: "Campaign",
    price: "100",
    color: "bg-primary",
    borderColor: "border-primary/40",
    buttonColor: "bg-primary hover:bg-primary/90 text-primary-foreground",
    features: [
      "1 active promotion (30-day campaign — modify anytime during the run)",
      "Target 1 city",
      "Track QR Code Scans",
      "Realtime Analytics Dashboard",
      "Schedule Start Date in Advance",
    ],
  },
  {
    id: "professional",
    name: "Professional",
    campaign: "Campaign",
    price: "250",
    color: "bg-primary",
    borderColor: "border-primary/80",
    buttonColor: "bg-primary hover:bg-primary/90 text-primary-foreground",
    features: [
      "1 active promotion (30-day campaign — modify anytime during the run)",
      "Target 3 cities",
      "Track QR Code Scans",
      "Realtime Analytics Dashboard",
      "Schedule Start Date in Advance",
    ],
    highlight: true,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    campaign: "Campaign",
    price: "500",
    color: "bg-primary",
    borderColor: "border-primary/40",
    buttonColor: "bg-primary hover:bg-primary/90 text-primary-foreground",
    features: [
      "1 active promotion (30-day campaign — modify anytime during the run)",
      "Target 8 cities",
      "Track QR Code Scans",
      "Realtime Analytics Dashboard",
      "Schedule Start Date in Advance",
    ],
  },
];

const featureHighlights = [
  {
    icon: Pencil,
    title: "Design Promotions",
    description:
      "Create eye-catching campaigns in minutes using simple, ready-made templates.",
    tile: "border-[#E31E24]/30 bg-[#E31E24]/15 text-[#FF6B6F]",
  },
  {
    icon: LayoutGrid,
    title: "Track Results",
    description:
      "Monitor QR code scans and see realtime analytics on your dashboard.",
    tile: "border-[#7C3AED]/30 bg-[#7C3AED]/15 text-[#A78BFA]",
  },
  {
    icon: Calendar,
    title: "Schedule Campaigns",
    description:
      "Plan ahead by creating campaigns that launch on your chosen start date.",
    tile: "border-[#2563EB]/30 bg-[#2563EB]/15 text-[#60A5FA]",
  },
];

const STAR_PATH =
  "M 0,-3.5 L 0.97,-1.02 L 3.56,-1.02 L 1.48,0.5 L 2.27,3.08 L 0,1.55 L -2.27,3.08 L -1.48,0.5 L -3.56,-1.02 L -0.97,-1.02 Z";

const Sparkle = ({ className = "" }: { className?: string }) => (
  <svg
    viewBox="-4 -4 8 8"
    className={cn("text-[#F5C55C]", className)}
    aria-hidden="true"
  >
    <path d={STAR_PATH} fill="currentColor" />
  </svg>
);

const BusinessVisitor = () => {
  const [isStatewideTooltipOpen, setIsStatewideTooltipOpen] = useState(false);

  const handleStatewideTooltipClick = (
    e: React.MouseEvent<HTMLButtonElement>,
  ) => {
    e.preventDefault();
    setIsStatewideTooltipOpen((prev) => !prev);
  };

  return (
    <div className="bv-dark relative isolate min-h-screen overflow-x-clip bg-[#02040a] text-white">
      {/* ── Space-inspired background layers ── */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[#030819]" />

        {/* Hero backdrop — custom space-city artwork echoing the home poster.
            Extends to the very top of the page so the overlay header sits on it. */}
        <div className="absolute inset-x-0 top-0 h-[46rem] overflow-hidden [mask-image:linear-gradient(to_bottom,black_55%,transparent_96%)]">
          <picture>
            {/* <source
              media="(max-width: 640px)"
              srcSet="/mobile-bg-hero.png"
            /> */}
            <img
              src="/new-assets/business-hero-space.svg"
              alt=""
              decoding="async"
              className="h-full w-full object-cover object-bottom opacity-70"
            />
          </picture>
        </div>

        {/* Mid-page nebula band behind pricing + features */}
        <div className="absolute inset-x-0 top-[40%] h-[38%] overflow-hidden [mask-image:linear-gradient(to_bottom,transparent,black_18%,black_82%,transparent)]">
          <img
            src="/new-assets/business-mid-nebula.svg"
            alt=""
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover opacity-80"
          />
        </div>

        {/* Ambient color washes for the lower page */}
        <div className="bv-stars absolute inset-0 opacity-30" />
        <div className="absolute inset-0 bg-[radial-gradient(900px_circle_at_85%_-10%,rgb(124_58_237/0.14),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(700px_circle_at_5%_8%,rgb(227_30_36/0.09),transparent_55%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(900px_circle_at_50%_115%,rgb(37_99_235/0.07),transparent_60%)]" />
      </div>

      <Seo
        title="Promotion marketing for local businesses"
        description="Launch geo-targeted local promotions, schedule campaigns, and track results with Hopping Deals's business marketing platform."
        pathname="/business/visitor"
        structuredData={{
          "@context": "https://schema.org",
          "@type": "Service",
          name: "Hopping Deals promotion platform",
          provider: {
            "@type": "Organization",
            name: "Hopping Deals",
            url: SITE_URL,
          },
          areaServed: "US",
          description:
            "A promotion marketing platform for businesses that want to publish local offers and measure campaign performance.",
        }}
      />
      <BusinessHeader overlay />

      <main className="relative z-10 container mx-auto px-4 pb-16 pt-32 sm:pt-36">
        {/* Hero Header */}
        <section className="relative mb-20 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="mb-8 inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.04] px-5 py-2 text-[11px] font-bold uppercase tracking-[0.22em] text-slate-300 backdrop-blur-sm sm:text-xs">
              <Sparkle className="h-3 w-3 animate-pulse-soft" />
              Local Promotion Platform
              <Sparkle className="h-3 w-3 animate-pulse-soft" />
            </div>

            <h1 className="mb-6 text-4xl font-extrabold leading-tight text-white md:text-6xl">
              Grow Your Business with
              <br />
              <span className="bg-gradient-to-r from-[#FF4D52] via-[#E31E24] to-[#B3141A] bg-clip-text text-transparent [text-shadow:0_0_40px_rgb(227_30_36/0.35)]">
                Local Promotions
              </span>
            </h1>
            <p className="mx-auto max-w-2xl text-lg font-bold leading-relaxed text-slate-300 md:text-xl">
              Create stunning 30-day promotions (one-time charge, no recurring
              fees), target local customers, and track real results - no design
              skills needed. Unlike other platforms, we do not require bidding
              for ad space or charge high fees during peak times.
            </p>

            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button
                asChild
                className="bv-glow h-14 rounded-xl bg-[#E31E24] px-10 text-lg font-black text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#b91621] active:scale-95"
              >
                <Link href="/business/register">
                  Get Started
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  document
                    .getElementById("create-promotion")
                    ?.scrollIntoView({ behavior: "smooth" });
                }}
                className="h-14 rounded-xl border-white/20 bg-white/[0.03] px-10 text-lg font-bold text-white backdrop-blur-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-[#E31E24]/60 hover:bg-white/[0.06] hover:text-white active:scale-95"
              >
                Try It Now
              </Button>
            </div>

            <div className="mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm font-semibold text-slate-400">
              <span className="inline-flex items-center gap-2">
                <Check className="h-4 w-4 text-[#F5C55C]" />
                One-time flat fee
              </span>
              <span className="inline-flex items-center gap-2">
                <Check className="h-4 w-4 text-[#F5C55C]" />
                No bidding for ad space
              </span>
              <span className="inline-flex items-center gap-2">
                <Check className="h-4 w-4 text-[#F5C55C]" />
                No recurring subscriptions
              </span>
            </div>
          </motion.div>
        </section>

        {/* Pricing Cards */}
        <div
          id="pricing"
          className="mx-auto mb-16 flex max-w-7xl flex-col items-center justify-end gap-8 px-4 pt-10 md:flex-row md:items-end md:gap-6 lg:gap-8"
        >
          {pricingPlans.map((plan) => (
            <div
              key={plan.id}
              className={cn(
                "relative flex w-full max-w-sm flex-col overflow-hidden rounded-2xl border bg-gradient-to-b from-[#0C1322] to-[#070C18] text-white shadow-[0_24px_60px_-15px_rgb(0_0_0/0.65)] transition-all duration-300",
                plan.highlight
                  ? "z-10 border-[#E31E24]/60 pt-6 shadow-[0_0_70px_rgb(227_30_36/0.2),0_28px_70px_-15px_rgb(0_0_0/0.7)] md:-translate-y-3 md:scale-[1.04]"
                  : "border-white/10 hover:border-white/25",
              )}
            >
              {/* Recommended badge for Professional */}
              {plan.highlight && (
                <div className="absolute left-1/2 top-3 z-20 -translate-x-1/2 whitespace-nowrap rounded-full bg-[#E31E24] px-4 py-1.5 text-[11px] font-black uppercase tracking-[0.18em] text-white shadow-[0_8px_24px_rgb(227_30_36/0.55)]">
                  Recommended
                </div>
              )}

              {/* Header Banner */}
              <div
                className={cn(
                  "relative py-6 text-center font-bold uppercase",
                  plan.highlight
                    ? "bg-gradient-to-r from-[#B3141A] via-[#E31E24] to-[#B3141A]"
                    : "bg-[#E31E24]/85",
                )}
              >
                <div className="text-2xl leading-tight text-white">
                  {plan.name}
                </div>
                <div className="text-base leading-tight text-white/75">
                  {plan.campaign}
                </div>
              </div>

              <div className="flex flex-grow flex-col items-center p-8">
                {/* Price Display */}
                <div className="mb-8 text-center">
                  <div className="mb-1 text-6xl font-black text-white">
                    ${plan.price}
                  </div>
                  <div className="font-medium lowercase text-slate-400">
                    /campaign
                  </div>
                  <div className="mt-4 text-[10px] font-bold uppercase tracking-[0.2em] text-[#F5C55C]">
                    Flat Fee. No Subscriptions
                  </div>
                </div>

                <div className="mb-8 h-px w-full bg-white/10" />

                {/* Features List */}
                <ul className="mb-10 w-full space-y-6 px-2">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-4">
                      <Check className="mt-0.5 h-5 w-5 shrink-0 text-[#F5C55C]" />
                      <span className="text-sm font-medium leading-relaxed text-slate-300">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* Footer Price and Action */}
                <div className="mt-auto w-full space-y-6">
                  <div className="text-center text-3xl font-black text-white">
                    ${plan.price}
                  </div>
                  <Button
                    className={cn(
                      "w-full rounded-lg py-7 text-xl font-black transition-all active:scale-95",
                      plan.highlight
                        ? "bv-glow bg-[#E31E24] hover:bg-[#b91621]"
                        : "bg-[#E31E24]/90 hover:bg-[#b91621]",
                    )}
                    asChild
                  >
                    <Link href="/business/register">Get Started</Link>
                  </Button>
                </div>
              </div>

              {/* Top Accent Glow for Professional Card */}
              {plan.highlight && (
                <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#E31E24] via-[#A78BFA] to-[#E31E24] opacity-90 blur-[1px]" />
              )}
            </div>
          ))}
        </div>

        {/* Statewide Upgrade Banner */}
        <div className="mb-24 text-center">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="mx-auto flex max-w-xl items-center justify-center gap-2 px-2 text-center font-black tracking-wide leading-snug text-sm text-white sm:text-xl md:text-2xl"
          >
            <span className="text-nowrap">Statewide Upgrade Available:</span>

            <span className="inline-flex whitespace-nowrap rounded-lg border border-[#F5C55C]/35 bg-[#F5C55C]/10 px-3 py-1 text-[10px] font-black text-[#F5C55C] sm:px-4 sm:text-base md:text-lg">
              $500 per state
            </span>

            <TooltipProvider delayDuration={0} skipDelayDuration={0}>
              <Tooltip
                open={isStatewideTooltipOpen}
                onOpenChange={(nextOpen) => {
                  if (!nextOpen) setIsStatewideTooltipOpen(false);
                }}
              >
                <HelpTooltipTrigger
                  ariaLabel="Statewide upgrade details"
                  onClick={handleStatewideTooltipClick}
                />
                <TooltipContent
                  side="top"
                  sideOffset={10}
                  className="w-[calc(100vw-2rem)] max-w-sm bg-black/90 text-left text-xs font-normal leading-relaxed text-white border-white/20 backdrop-blur-[1px] animate-none data-[state=closed]:animate-none sm:text-base"
                  onEscapeKeyDown={() => setIsStatewideTooltipOpen(false)}
                >
                  This is an additional charge on top of the 30 days Plan.
                  Anytime a State(s) is added, Statewide promotion starts and
                  end after 30 days. Great for e-commerce that needs a broader
                  audience reached.
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </motion.div>
        </div>

        {/* Feature Highlights */}
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 px-4 md:grid-cols-3 lg:gap-8">
          {featureHighlights.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.08 }}
              className="bv-card bv-card-hover group flex flex-col items-start gap-5 rounded-2xl p-7"
            >
              <div
                className={cn(
                  "flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border shadow-lg transition-transform duration-300 group-hover:scale-110",
                  feature.tile,
                )}
              >
                <feature.icon className="h-7 w-7" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-white">
                  {feature.title}
                </h3>
                <p className="text-sm leading-relaxed text-slate-400">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </main>

      {/* Ready to run CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="relative mx-5 overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-[#0C1322] to-[#070C18] p-6 shadow-[0_24px_60px_-15px_rgb(0_0_0/0.6)] sm:p-10"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute -top-32 left-1/2 h-56 w-[34rem] -translate-x-1/2 rounded-full bg-[#E31E24]/15 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-32 right-0 h-56 w-96 rounded-full bg-[#7C3AED]/10 blur-3xl"
        />
        <div className="relative space-y-6 text-center">
          <div className="mb-4 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-[#E31E24]/30 bg-[#E31E24]/15 shadow-glow">
              <Building2 className="h-8 w-8 text-[#FF6B6F]" />
            </div>
          </div>
          <div className="space-y-3">
            <h2 className="text-2xl font-bold text-white sm:text-3xl">
              ready to run a promotion yet?
            </h2>
            <p className="mx-auto max-w-md leading-relaxed text-slate-400">
              Sign up for free and claim your business page! We encourage you to
              hone your skills by creating some stunning banner templates. Once
              you're ready, subscribe to a Plan and Run it!
            </p>
          </div>
          <Link href="/business/register">
            <Button className="bv-glow rounded-lg bg-[#E31E24] px-8 py-3 font-bold text-white shadow-lg transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#b91621] active:scale-95">
              Claim your Business Page
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </motion.div>

      <div
        id="create-promotion"
        className="relative z-10 mt-20 scroll-mt-24 px-4"
      >
        <CreatePromotion isVisitor={true} theme="dark" />
      </div>

      <Footer />
    </div>
  );
};

export default BusinessVisitor;

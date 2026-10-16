"use client";
import { useState } from "react";
import Link from "next/link";
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
import { SceneBackdrop } from "@/components/art/Scene";

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
    title: "Design promotions",
    description:
      "Create eye-catching campaigns in minutes using simple, ready-made templates.",
  },
  {
    icon: LayoutGrid,
    title: "Track results",
    description:
      "Monitor QR code scans and see realtime analytics on your dashboard.",
  },
  {
    icon: Calendar,
    title: "Schedule campaigns",
    description:
      "Plan ahead by creating campaigns that launch on your chosen start date.",
  },
];

const BusinessVisitor = () => {
  const [isStatewideTooltipOpen, setIsStatewideTooltipOpen] = useState(false);

  const handleStatewideTooltipClick = (
    e: React.MouseEvent<HTMLButtonElement>,
  ) => {
    e.preventDefault();
    setIsStatewideTooltipOpen((prev) => !prev);
  };

  return (
    <div className="bv-dark relative isolate min-h-screen overflow-x-clip text-white">
      <Seo
        title="Promotion marketing for local businesses"
        description="Launch geo-targeted local promotions, schedule campaigns, and track results with the Hopping Deals business marketing platform."
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

      {/* Hero: the same moon horizon as the shopper home page */}
      <section className="relative isolate overflow-hidden border-b border-white/10 px-4 pb-28 pt-36 sm:pb-36 sm:pt-44">
        <SceneBackdrop name="launch" />
        <div className="mx-auto max-w-7xl">
          <div className="max-w-2xl">
          <h1 className="text-4xl leading-[1.05] text-white drop-shadow-[0_4px_16px_rgb(0_0_0/0.6)] md:text-6xl">
            Grow your business with local promotions
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/85 md:text-xl">
            Create a 30-day promotion for a one-time fee, target the cities
            your customers live in, and track real results. No design skills,
            no bidding for ad space, no peak-time surcharges.
          </p>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Button asChild variant="hero" size="xl">
              <Link href="/business/register">
                Claim your free business page
                <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
            <Button
              variant="glass"
              size="xl"
              onClick={() => {
                document
                  .getElementById("create-promotion")
                  ?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              Try the builder
            </Button>
          </div>

          <ul className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-3 text-sm font-medium text-white/80">
            {[
              "One-time flat fee",
              "No bidding for ad space",
              "No recurring subscriptions",
            ].map((item) => (
              <li key={item} className="inline-flex items-center gap-2">
                <Check className="h-4 w-4 text-gold" />
                {item}
              </li>
            ))}
          </ul>
          </div>
        </div>
      </section>

      <main className="relative z-10 mx-auto max-w-7xl px-4 pb-16">
        {/* Pricing: each campaign plan is a pass with a tear-off stub */}
        <section
          id="pricing"
          aria-labelledby="pricing-title"
          className="-mt-16 scroll-mt-24"
        >
          <h2 id="pricing-title" className="sr-only">
            Campaign plans
          </h2>
          <div className="mx-auto flex max-w-6xl flex-col items-center gap-8 md:flex-row md:items-end md:justify-center md:gap-6 lg:gap-8">
            {pricingPlans.map((plan) => (
              <div
                key={plan.id}
                className={cn(
                  "hd-ticket-frame w-full max-w-sm",
                  plan.highlight && "z-10 md:-translate-y-4",
                )}
              >
                <div
                  className={cn(
                    "hd-ticket-card flex flex-col border",
                    plan.highlight ? "border-gold/50" : "border-border",
                  )}
                  style={{ ["--tear" as string]: "7.5rem" }}
                >
                  <div
                    className={cn(
                      "flex h-[7.5rem] flex-col items-center justify-center text-center",
                      plan.highlight
                        ? "bg-[linear-gradient(135deg,hsl(358_88%_58%),hsl(350_80%_42%))]"
                        : "bg-[linear-gradient(135deg,hsl(226_50%_20%),hsl(228_50%_15%))]",
                    )}
                  >
                    {plan.highlight ? (
                      <span className="mb-2 rounded-full bg-gold px-3 py-0.5 text-xs font-bold text-gold-foreground">
                        Most popular
                      </span>
                    ) : null}
                    <p className="font-display text-2xl font-semibold text-white">
                      {plan.name}
                    </p>
                    <p className="text-sm text-white/75">30-day campaign</p>
                  </div>

                  <div className="hd-ticket-tear" aria-hidden="true" />

                  <div className="flex flex-grow flex-col p-7">
                    <div className="text-center">
                      <p className="font-display text-5xl font-bold text-white">
                        ${plan.price}
                      </p>
                      <p className="mt-2 text-sm text-gold">
                        Flat fee per campaign. No subscription.
                      </p>
                    </div>

                    <ul className="my-8 space-y-4">
                      {plan.features.map((feature, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <Check className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
                          <span className="text-sm leading-relaxed text-foreground/85">
                            {feature}
                          </span>
                        </li>
                      ))}
                    </ul>

                    <Button
                      asChild
                      size="lg"
                      variant={plan.highlight ? "hero" : "outline"}
                      className="mt-auto w-full"
                    >
                      <Link href="/business/register">
                        Start with {plan.name}
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Statewide upgrade */}
          <div className="mx-auto mt-12 flex max-w-xl flex-wrap items-center justify-center gap-3 text-center text-lg font-semibold text-white">
            <span>Statewide upgrade</span>
            <span className="rounded-lg border border-gold/35 bg-gold/10 px-3 py-1 text-base font-bold text-gold">
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
                  className="w-[calc(100vw-2rem)] max-w-sm text-left text-sm font-normal leading-relaxed"
                  onEscapeKeyDown={() => setIsStatewideTooltipOpen(false)}
                >
                  This is an additional charge on top of the 30-day plan.
                  Whenever a state is added, the statewide promotion starts and
                  ends after 30 days. Great for e-commerce businesses that need
                  a broader audience.
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </section>

        {/* What you can do */}
        <section className="mx-auto mt-24 grid max-w-6xl grid-cols-1 gap-6 md:grid-cols-3">
          {featureHighlights.map((feature) => (
            <div key={feature.title} className="hd-panel flex flex-col gap-4 p-7">
              <span className="hd-icon-tile">
                <feature.icon className="h-5 w-5" />
              </span>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-white">
                  {feature.title}
                </h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </section>

        {/* Free page CTA */}
        <section className="hd-panel relative mx-auto mt-16 max-w-6xl overflow-hidden p-8 text-center sm:p-12">
          <div
            aria-hidden
            className="pointer-events-none absolute -top-32 left-1/2 h-56 w-[34rem] -translate-x-1/2 rounded-full bg-primary/15 blur-3xl"
          />
          <div className="relative mx-auto max-w-xl space-y-4">
            <span className="hd-icon-tile mx-auto">
              <Building2 className="h-5 w-5" />
            </span>
            <h2 className="text-2xl text-white sm:text-3xl">
              Not ready to run a promotion yet?
            </h2>
            <p className="leading-relaxed text-muted-foreground">
              Claim your business page for free and practice by designing
              banner templates. When you’re ready, pick a plan and run it.
            </p>
            <Button asChild variant="hero" size="lg" className="mt-2">
              <Link href="/business/register">
                Claim your business page
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </section>
      </main>

      <div
        id="create-promotion"
        className="relative z-10 mx-auto mt-8 max-w-7xl scroll-mt-24 px-4"
      >
        <CreatePromotion isVisitor={true} />
      </div>

      <Footer />
    </div>
  );
};

export default BusinessVisitor;

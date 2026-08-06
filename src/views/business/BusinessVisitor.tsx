"use client";
import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Check,
  Palette,
  MapPin,
  Clock,
  Zap,
  Building2,
  Users,
  Briefcase,
  Star,
  BarChart3,
  QrCode,
  Upload,
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
import Logo from "@/components/shared/Logo";
import Footer from "@/components/homePage/Footer";
import { promotionTemplates } from "@/data/mockData";
import { useRef } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import type { RootState } from "@/store/index";
import {
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  ArrowUp,
  ArrowDown,
  ShoppingCart,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { locations } from "@/data/mockData";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import Select from "react-select";
import USATimezoneMap from "@/components/business/USATimezoneMap";
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
  },
  {
    icon: LayoutGrid,
    title: "Track Results",
    description:
      "Monitor QR code scans and see realtime analytics on your dashboard.",
  },
  {
    icon: Calendar,
    title: "Schedule Campaigns",
    description:
      "Plan ahead by creating campaigns that launch on your chosen start date.",
  },
];

const BusinessVisitor = () => {
  const isBusinessLoggedIn = useSelector(
    (state: RootState) => state.auth.businessToken !== null,
  );
  const [isStatewideTooltipOpen, setIsStatewideTooltipOpen] = useState(false);

  const handleStatewideTooltipClick = (
    e: React.MouseEvent<HTMLButtonElement>,
  ) => {
    e.preventDefault();
    setIsStatewideTooltipOpen((prev) => !prev);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
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
      <BusinessHeader />

      <main className="container mx-auto px-4 py-16">
        {/* Hero Header */}
        <section className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl md:text-6xl font-extrabold mb-6 leading-tight">
              Grow Your Business with
              <br />
              <span className="text-primary">Local Promotions</span>
            </h1>
            <p className="text-lg md:text-xl text-black font-bold  max-w-2xl mx-auto leading-relaxed">
              Create stunning 30-day promotions (one-time charge, no recurring
              fees), target local customers, and track real results - no design
              skills needed. Unlike other platforms, we do not require bidding
              for ad space or charge high fees during peak times.
            </p>
          </motion.div>
        </section>
        {/* Pricing Cards */}
        <div className="flex flex-col md:flex-row items-end justify-center gap-6 lg:gap-8 max-w-7xl mx-auto mb-16 px-4">
          {pricingPlans.map((plan, index) => (
            <div
              key={plan.id}
              className={cn(
                "relative flex flex-col  w-full max-w-sm rounded-xl overflow-hidden border-2 bg-[#000000] text-white shadow-2xl transition-all duration-300",
                plan?.name === "Professional" && "pt-6",
                plan.borderColor,
                plan.highlight
                  ? "scale-105 z-10 md:-translate-y-2 border-[#7C3AED]"
                  : "scale-100 opacity-95 hover:opacity-100",
              )}
            >
              {/* Header Banner - Two lines */}
              <div
                className={cn(
                  "py-6 text-center  font-bold uppercase",
                  plan.color,
                )}
              >
                <div className="text-2xl text-white leading-tight">
                  {plan.name}
                </div>
                <div className="text-1xl leading-tight">{plan.campaign}</div>
              </div>

              <div className="p-8 flex-grow flex flex-col items-center">
                {/* Price Display */}
                <div className="text-center mb-8">
                  <div className="text-6xl font-black mb-1">${plan.price}</div>
                  <div className="text-gray-400 font-medium lowercase">
                    /campaign
                  </div>
                  <div className="mt-4 text-[10px] text-[#FACC15] font-bold uppercase tracking-[0.2em]">
                    Flat Fee. No Subscriptions
                  </div>
                </div>

                <div className="w-full h-px bg-white/10 mb-8" />

                {/* Features List */}
                <ul className="space-y-6 mb-10 w-full px-2">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-4">
                      <Check className="h-5 w-5 mt-0.5 shrink-0 text-[#FACC15]" />
                      <span className="text-sm font-medium leading-relaxed text-gray-300">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* Footer Price and Action */}
                <div className="w-full mt-auto space-y-6">
                  <div className="text-center text-3xl font-black">
                    ${plan.price}
                  </div>
                  <Button
                    className={cn(
                      "w-full py-7 text-xl font-black rounded-lg transition-all transform active:scale-95 ",
                      plan.buttonColor,
                    )}
                    asChild
                  >
                    <Link href="/business/register">Get Started</Link>
                  </Button>
                </div>
              </div>

              {/* Top Accent Glow for Professional Card */}
              {plan.highlight && (
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-400 via-purple-400 to-orange-400 blur-sm opacity-80" />
              )}
            </div>
          ))}
        </div>
        <div className="text-center mb-24">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="mx-auto flex max-w-xl  items-center justify-center gap-2 px-2 text-center font-black text-primary tracking-wide leading-snug text-sm sm:text-xl md:text-2xl"
          >
            <span className=" text-nowrap">Statewide Upgrade Available:</span>

            <span className="inline-flex whitespace-nowrap rounded-lg border border-[#FACC15]/30 bg-black px-1 py-1 text-[10px] text-white sm:px-4 sm:text-base md:text-lg">
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
                  className="w-[calc(100vw-2rem)] max-w-sm text-left text-xs sm:text-base font-normal leading-relaxed bg-black/90 text-white border-white/20 backdrop-blur-[1px] animate-none data-[state=closed]:animate-none"
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
        {/* Bottom Feature Tiers - Horizontal Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12 max-w-6xl mx-auto px-4">
          {featureHighlights.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="flex items-start gap-5 group"
            >
              <div className="p-3 rounded-2xl border border-primary/20 text-primary group-hover:scale-110 transition-transform shadow-lg shrink-0">
                <feature.icon className="h-8 w-8" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl text-primary font-bold">
                  {feature.title}
                </h3>
                <p className="text-sm text-black leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </main>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="bg-gradient-to-r mx-5 from-primary/5 to-primary/10 border border-primary/20 rounded-2xl p-6 sm:p-8 shadow-lg hover:shadow-xl transition-shadow duration-300"
      >
        <div className="text-center space-y-6">
          <div className="flex justify-center mb-4">
            <div className="p-3 rounded-full bg-primary/10 border border-primary/20">
              <Building2 className="h-8 w-8 text-primary" />
            </div>
          </div>
          <div className="space-y-3">
            <h2 className="text-2xl font-bold text-foreground">
              ready to run a promotion yet?
            </h2>
            <p className="text-muted-foreground leading-relaxed max-w-md mx-auto">
              Sign up for free and claim your business page! We encourage you to
              hone your skills by creating some stunning banner templates. Once
              you're ready, subscribe to a Plan and Run it!
            </p>
          </div>
          <Link href="/business/register">
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105">
              Claim your Business Page
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </motion.div>

      <div className="px-4 mt-20">
        <CreatePromotion isVisitor={true} />
      </div>

      <Footer />
    </div>
  );
};

export default BusinessVisitor;

"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useSubscriptionService } from "@/services/subscriptionService";
import { useSubscriptionTemplateService } from "@/services/subscriptionTemplateService";
import { Check } from "lucide-react";
import type { SubscriptionTemplate } from "@/services/subscriptionTemplateService";
import { toast } from "react-toastify";
import { cn } from "@/lib/utils";
import Spinner from "@/components/shared/Spinner";

type ActiveSubscription = {
  id: string;
  subscriptionTemplateId: string;
  status: string;
  endDate: string;
};

type CardStyle = {
  borderColor: string;
  color: string;
  buttonColor: string;
  highlight: boolean;
};

const CARD_STYLES: CardStyle[] = [
  {
    borderColor: "border-primary/40",
    color: "bg-primary",
    buttonColor: "bg-primary hover:bg-primary/90 text-primary-foreground",
    highlight: false,
  },
  {
    borderColor: "border-primary/80",
    color: "bg-primary",
    buttonColor: "bg-primary hover:bg-primary/90 text-primary-foreground",
    highlight: true,
  },
  {
    borderColor: "border-primary/40",
    color: "bg-primary",
    buttonColor: "bg-primary hover:bg-primary/90 text-primary-foreground",
    highlight: false,
  },
];

const getPlanFeatures = (template: SubscriptionTemplate): string[] => {
  const cities = Number(template.freeCities || 0);
  const states = Number(template.freeStates || 0);
  const durationMonths = Number(template.durationMonths || 1);

  return [
    `1 active promotion (${durationMonths}-month campaign - modify anytime during the run)`,
    `Target ${cities} ${cities === 1 ? "city" : "cities"}`,
    states > 0
      ? `Includes ${states} ${states === 1 ? "state" : "states"} targeting`
      : "City-focused targeting",
    "Track QR Code Scans",
    "Realtime Analytics Dashboard",
    "Schedule Start Date in Advance",
  ];
};

const SubscriptionPage = () => {
  const { checkout, getActive } = useSubscriptionService();
  const { getAllTemplates } = useSubscriptionTemplateService();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [subscribingTemplateId, setSubscribingTemplateId] = useState<
    string | null
  >(null);
  const [templatesLoading, setTemplatesLoading] = useState(true);
  const [templates, setTemplates] = useState<SubscriptionTemplate[]>([]);
  const [activeSubscription, setActiveSubscription] =
    useState<ActiveSubscription | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setTemplatesLoading(true);

        const sessionId = searchParams.get("session_id");
        if (sessionId) {
          toast.success("Subscription activated successfully!");
          setTimeout(() => {
            router.push(`/business/subscription-success?session_id=${sessionId}`);
          }, 1000);
          return;
        }

        const templatesRes = await getAllTemplates();
        const activeTemplates = templatesRes.filter(
          (t) => t.isActive !== false,
        );
        setTemplates(activeTemplates);

        try {
          const activeRes = await getActive();
          if (activeRes?.status === "active") {
            setActiveSubscription(activeRes);
          } else {
            setActiveSubscription(null);
          }
        } catch (activeError) {
          // No active subscription should not block showing templates
          setActiveSubscription(null);
        }
      } catch (error: any) {
        console.error(error);
        toast.error("Failed to load subscription data");
      } finally {
        setTemplatesLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSubscribe = async (template: SubscriptionTemplate) => {
    try {
      setSubscribingTemplateId(template.id);
      const res = await checkout(template.id);

      if (res?.url) {
        window.location.href = res.url;
        return;
      }

      if (res?.stripeSession?.url) {
        window.location.href = res.stripeSession.url;
        return;
      }

      toast.error("Checkout failed");
    } catch (err: any) {
      toast.error(err.message || "Subscription failed");
    } finally {
      setSubscribingTemplateId(null);
    }
  };

  return (
    <div className="w-full">
      <h1 className="mb-3 text-2xl font-bold sm:text-3xl">
        Business Subscription Plans
      </h1>
      <p className="text-muted-foreground mb-8">
        Choose a subscription plan that suits your business needs.
      </p>

      {templatesLoading ? (
        <div className="flex justify-center items-center h-64">
          <Spinner className="h-8 w-8 animate-spin"  />
        </div>
      ) : templates.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          No subscription templates available.
        </div>
      ) : (
        <div className="mx-auto mb-16 flex max-w-7xl flex-col items-stretch justify-center gap-6 px-0 sm:px-4 md:flex-row md:items-end lg:gap-8">
          {templates.map((template, index) => {
            const isActive =
              activeSubscription?.subscriptionTemplateId === template.id;
            const cardStyle = CARD_STYLES[index] || CARD_STYLES[2];
            const isProfessionalCard = index === 1;
            const planFeatures = getPlanFeatures(template);

            return (
              <div
                key={template.id}
                className={cn(
                  "relative flex flex-col w-full max-w-sm rounded-xl overflow-hidden border-2 bg-[#000000] text-white shadow-2xl transition-all duration-300",
                  isProfessionalCard && "pt-6",
                  cardStyle.borderColor,
                  cardStyle.highlight
                    ? "z-10 border-[#7C3AED] md:-translate-y-2 md:scale-105"
                    : "scale-100 opacity-95 hover:opacity-100",
                  isActive && "ring-2 ring-primary/40",
                )}
              >
                <div
                  className={cn(
                    "py-6 text-center font-bold uppercase",
                    cardStyle.color,
                  )}
                >
                  <div className="text-2xl text-white leading-tight">
                    {template.name}
                  </div>
                  <div className="text-1xl leading-tight">Campaign</div>
                </div>

                <div className="p-8 flex-grow flex flex-col items-center">
                  <div className="text-center mb-8">
                    <div className="text-6xl font-black mb-1">
                      ${Number(template.price).toFixed(0)}
                    </div>
                    <div className="text-gray-400 font-medium lowercase">
                      /campaign
                    </div>
                    <div className="mt-4 text-[10px] text-[#FACC15] font-bold uppercase tracking-[0.2em]">
                      Flat Fee. No Subscriptions
                    </div>

                    {isActive && activeSubscription?.endDate && (
                      <p className="text-xs text-[#FACC15] mt-3 font-semibold">
                        Expires on{" "}
                        {new Date(
                          activeSubscription.endDate,
                        ).toLocaleDateString()}
                      </p>
                    )}
                  </div>

                  <div className="w-full h-px bg-white/10 mb-8" />

                  <ul className="space-y-6 mb-10 w-full px-2">
                    {planFeatures.map((feature, i) => (
                      <li key={i} className="flex items-start gap-4">
                        <Check className="h-5 w-5 mt-0.5 shrink-0 text-[#FACC15]" />
                        <span className="text-sm font-medium leading-relaxed text-gray-300">
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <div className="w-full mt-auto space-y-6">
                    <div className="text-center text-3xl font-black">
                      ${Number(template.price).toFixed(0)}
                    </div>
                    <Button
                      className={cn(
                        "w-full py-7 text-xl font-black rounded-lg transition-all transform active:scale-95",
                        cardStyle.buttonColor,
                      )}
                      disabled={Boolean(subscribingTemplateId) || isActive}
                      onClick={() => handleSubscribe(template)}
                    >
                      {isActive ? (
                        "Current Plan"
                      ) : subscribingTemplateId === template.id ? (
                        <Spinner className="h-5 w-5 animate-spin"  />
                      ) : (
                        "Get Started"
                      )}
                    </Button>
                  </div>
                </div>

                {cardStyle.highlight && (
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-400 via-purple-400 to-orange-400 blur-sm opacity-80" />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SubscriptionPage;

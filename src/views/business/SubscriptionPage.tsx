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
      <h1 className="text-2xl sm:text-3xl">Campaign plans</h1>
      <p className="mb-10 mt-1 text-muted-foreground">
        Pick the reach you need. Each plan is a one-time fee for a 30-day
        campaign.
      </p>

      {templatesLoading ? (
        <div className="flex h-64 items-center justify-center">
          <Spinner className="h-8 w-8" />
        </div>
      ) : templates.length === 0 ? (
        <div className="hd-empty">
          <p className="font-medium text-foreground">
            No plans are available right now.
          </p>
          <p className="text-sm text-muted-foreground">
            Message support from the site footer and we’ll help you get set up.
          </p>
        </div>
      ) : (
        <div className="mx-auto mb-16 flex max-w-6xl flex-col items-center gap-8 md:flex-row md:items-end md:justify-center md:gap-6 lg:gap-8">
          {templates.map((template, index) => {
            const isActive =
              activeSubscription?.subscriptionTemplateId === template.id;
            const cardStyle = CARD_STYLES[index] || CARD_STYLES[2];
            const planFeatures = getPlanFeatures(template);

            return (
              <div
                key={template.id}
                className={cn(
                  "hd-ticket-frame w-full max-w-sm",
                  cardStyle.highlight && "z-10 md:-translate-y-4",
                )}
              >
                <div
                  className={cn(
                    "hd-ticket-card flex flex-col border",
                    cardStyle.highlight ? "border-gold/50" : "border-border",
                    isActive && "border-success/60",
                  )}
                  style={{ ["--tear" as string]: "7.5rem" }}
                >
                  <div
                    className={cn(
                      "flex h-[7.5rem] flex-col items-center justify-center text-center",
                      cardStyle.highlight
                        ? "bg-[linear-gradient(135deg,hsl(358_88%_58%),hsl(350_80%_42%))]"
                        : "bg-[linear-gradient(135deg,hsl(226_50%_20%),hsl(228_50%_15%))]",
                    )}
                  >
                    {isActive ? (
                      <span className="mb-2 rounded-full bg-success px-3 py-0.5 text-xs font-bold text-success-foreground">
                        Your current plan
                      </span>
                    ) : cardStyle.highlight ? (
                      <span className="mb-2 rounded-full bg-gold px-3 py-0.5 text-xs font-bold text-gold-foreground">
                        Most popular
                      </span>
                    ) : null}
                    <p className="font-display text-2xl font-semibold text-white">
                      {template.name}
                    </p>
                    <p className="text-sm text-white/75">30-day campaign</p>
                  </div>

                  <div className="hd-ticket-tear" aria-hidden="true" />

                  <div className="flex flex-grow flex-col p-7">
                    <div className="text-center">
                      <p className="font-display text-5xl font-bold text-white">
                        ${Number(template.price).toFixed(0)}
                      </p>
                      <p className="mt-2 text-sm text-gold">
                        Flat fee per campaign. No subscription.
                      </p>
                      {isActive && activeSubscription?.endDate && (
                        <p className="mt-3 text-sm font-semibold text-success">
                          Runs until{" "}
                          {new Date(
                            activeSubscription.endDate,
                          ).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </p>
                      )}
                    </div>

                    <ul className="my-8 space-y-4">
                      {planFeatures.map((feature, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <Check className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
                          <span className="text-sm leading-relaxed text-foreground/85">
                            {feature}
                          </span>
                        </li>
                      ))}
                    </ul>

                    <Button
                      size="lg"
                      variant={cardStyle.highlight ? "hero" : "outline"}
                      className="mt-auto w-full"
                      disabled={Boolean(subscribingTemplateId) || isActive}
                      onClick={() => handleSubscribe(template)}
                    >
                      {isActive ? (
                        "Current plan"
                      ) : subscribingTemplateId === template.id ? (
                        <Spinner className="h-5 w-5" color="currentColor" />
                      ) : (
                        `Choose ${template.name}`
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SubscriptionPage;

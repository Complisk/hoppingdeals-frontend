"use client";
import {
  AlertCircle,
  CreditCard,
  Layers,
  Plus,

  TrendingUp,
  Users,
  Wand2,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { usePromotionService } from "@/services/promotionService";
import { useSubscriptionService } from "@/services/subscriptionService";
import { PromotionDetailsModal } from "@/components/shared/PromotionDetailsModal";
import BusinessPromotionCard from "@/components/shared/BusinessPromotionCard";
import { toast } from "react-toastify";
import { listReceivedTaggers } from "@/services/businessTaggingService";
import { PromotionVisualCard } from "@/components/shared/PromotionVisualCard";
import {
  type BusinessPromotionTemplate,
  useBusinessPromotionTemplateService,
} from "@/services/businessPromotionTemplateService";
import { useAppSelector } from "@/hooks/use-redux";
import { SceneBackdrop } from "@/components/art/Scene";
const BusinessDashboard = () => {
  const router = useRouter();
  const business = useAppSelector((state) => state.auth.business);
  const hasPlaceId = Boolean(business?.placeId);
  const {
    getBusinessPromotions,
    getDashboardAnalytics,
    activatePromotion,
    deactivatePromotion,
  } = usePromotionService();
  const { getTemplates: getBusinessTemplates } =
    useBusinessPromotionTemplateService();
  const [promotions, setPromotions] = useState([]);
  const [templates, setTemplates] = useState<BusinessPromotionTemplate[]>([]);
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [templatesLoading, setTemplatesLoading] = useState(true);
  const [selectedPromotion, setSelectedPromotion] = useState(null);
  const [actioningId, setActioningId] = useState<string | null>(null);
  const { getActive, getCachedActive } = useSubscriptionService();
  const [activeSubscription, setActiveSubscription] = useState<any>(null);
  const hasActiveSubscription = Boolean(activeSubscription);

  const [taggersOpen, setTaggersOpen] = useState(false);
  const [taggersLoading, setTaggersLoading] = useState(false);
  const [taggers, setTaggers] = useState<any[]>([]);
  const [taggersPagination, setTaggersPagination] = useState<any>(null);
  const [taggersPage, setTaggersPage] = useState(1);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const analyticsRes = await getDashboardAnalytics();
      const promoRes = await getBusinessPromotions("", "");
      setPromotions(promoRes?.response || []);
      setDashboard(analyticsRes?.response?.response || null);
    } catch (error) {
      console.error("Fetch dashboard error:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const fetchTemplates = async () => {
    try {
      setTemplatesLoading(true);
      const list = await getBusinessTemplates();
      setTemplates(Array.isArray(list) ? list : []);
    } catch (error: any) {
      toast.error(error?.message || "Failed to load templates");
    } finally {
      setTemplatesLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
    fetchTemplates();
  }, []);

  useEffect(() => {
    const cached = getCachedActive();
    if (cached) setActiveSubscription(cached);

    const refresh = async () => {
      try {
        const sub = await getActive();
        setActiveSubscription(sub);
      } catch (err) {
        setActiveSubscription(null);
      }
    };

    refresh();
  }, []);

  const fetchTaggers = async (nextPage: number) => {
    try {
      setTaggersLoading(true);
      const res = await listReceivedTaggers(nextPage, 25);
      if (res.success) {
        setTaggers(res.data || []);
        setTaggersPagination(res.pagination || null);
      } else if (res.error) {
        toast.error(res.error);
      }
    } finally {
      setTaggersLoading(false);
    }
  };

  useEffect(() => {
    if (taggersOpen) {
      fetchTaggers(taggersPage);
    }
  }, [taggersOpen, taggersPage]);

  const handleActivate = async (e: any, promotionId: string) => {
    e.stopPropagation();
    if (!hasActiveSubscription) {
      toast.info("You need an active subscription to activate promotions.");
      return;
    }
    try {
      setActioningId(promotionId);
      await activatePromotion(promotionId);

      const { response } = await getBusinessPromotions("", "");
      setPromotions(response || []);
      setActioningId(null);
    } catch (error) {
    } finally {
      setActioningId(null);
    }
  };

  const handleDeactivate = async (e: any, promotionId: string) => {
    e.stopPropagation();
    try {
      setActioningId(promotionId);
      await deactivatePromotion(promotionId);
      const { response } = await getBusinessPromotions("", "");
      setPromotions(response || []);
      setActioningId(null);
    } catch (error) {
    } finally {
      setActioningId(null);
    }
  };

  const handleUseTemplate = (template: BusinessPromotionTemplate) => {
    if (!hasActiveSubscription) {
      toast.info(
        "You can save templates now. Subscribe first to use templates in promotion creation.",
      );
      router.push("/business/subscription");
      return;
    }

    router.push(`/business/create-promotion?businessTemplateId=${template.id}`);
  };

  const weeklyValue = dashboard?.chartData?.weekly || 0;
  const monthlyValue = dashboard?.chartData?.monthly || 0;
  const momentum = dashboard?.chartData?.momentum || {
    score: 0,
    level: "Low",
    message: "No momentum yet",
  };

  const getLevel = (value, type) => {
    if (value === 0) return "Empty";
    if (type === "weekly") {
      if (value === 1) return "Low";
      if (value === 2) return "Medium";
      if (value >= 3) return "High";
    } else if (type === "monthly") {
      if (value <= 3) return "Low";
      if (value <= 7) return "Medium";
      if (value >= 8) return "High";
    }
    return "Low";
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* ---------------- Header ---------------- */}
      <div className="relative isolate flex flex-col gap-6 overflow-hidden rounded-3xl border border-white/10 px-6 py-8 sm:px-8 sm:py-10">
        <SceneBackdrop name="storefront" fade="left" compact />
        <div>
          <h1 className="text-2xl text-white sm:text-3xl">
            Welcome back{business?.name ? `, ${business.name}` : ""}
          </h1>
          <p className="mt-2 max-w-md text-white/80">
            How often your promotions run, and the momentum they build.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="glass">
            <Link href="/business/promotion-templates/create">
              <Layers className="h-4 w-4" />
              New template
            </Link>
          </Button>
          <Button asChild variant="hero">
            <Link href="/business/create-promotion">
              <Plus className="h-4 w-4" />
              Create promotion
            </Link>
          </Button>
        </div>
      </div>

      {!hasActiveSubscription && (
        <section className="rounded-2xl border border-warning/40 bg-warning/10 p-4 sm:p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <p className="flex items-center gap-2 text-sm font-semibold text-warning">
                <AlertCircle className="h-4 w-4" />
                No active subscription
              </p>
              <p className="text-sm text-foreground/80">
                Your free business page lets you design banner templates now.
                Subscribe when you’re ready to run a live promotion.
              </p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button asChild variant="outline" className="border-warning/40">
                <Link href="/business/promotion-templates/create">
                  <Plus className="mr-2 h-4 w-4" />
                  Create template
                </Link>
              </Button>
              <Button asChild>
                <Link href="/business/subscription">
                  <CreditCard className="mr-2 h-4 w-4" />
                  Subscribe
                </Link>
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* ---------------- Stats ---------------- */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {loading ? (
          [...Array(3)].map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-2xl bg-secondary/60" />
          ))
        ) : (
          <>
            <StatCard
              icon={Layers}
              label="Total promotions"
              value={dashboard?.stats?.totalPromotions || 0}
            />
            <StatCard
              icon={TrendingUp}
              label="Running now"
              value={dashboard?.stats?.activePromotions || 0}
            />
            <StatCard
              icon={Users}
              label="Tagged by shoppers"
              value={dashboard?.stats?.taggedByUsers || 0}
              onClick={() => {
                if (!hasPlaceId) {
                  toast.info(
                    "Your business is not listed on Google Maps. Please update your business profile with a Google Place ID to see who tagged your business."
                  );
                  return;
                }
                setTaggersPage(1);
                setTaggersOpen(true);
              }}
              disabled={!hasPlaceId}
            />
          </>
        )}
      </div>

      {/* ---------------- Simple Charts ---------------- */}
      <section>
        <h2 className="mb-4 flex flex-wrap items-center gap-3 text-lg sm:text-xl">
          <span className="hd-sparkle" aria-hidden="true" />
          Promotion intensity and momentum
        </h2>

        {loading ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-60 animate-pulse rounded-2xl bg-secondary/60" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-3 lg:items-end">
            {/* -------- Weekly Chart -------- */}
            <SimpleBarChart
              title="Last 7 Days"
              level={getLevel(weeklyValue, "weekly")}
            />

            {/* -------- Monthly Chart with 10 Steps -------- */}
            <MonthlyStepChart
              title="Last 30 Days"
              value={monthlyValue}
              maxValue={10}
            />

            {/* -------- Momentum -------- */}
            <div className="hd-panel flex flex-col items-center p-6 text-center">
              <div className="mb-4 flex w-full items-center justify-between">
                <h3 className="font-medium">Overall momentum</h3>
                <Zap className="h-5 w-5 text-gold" />
              </div>

              <div className="flex items-stretch">
                {/* The Bar - Larger */}
                <div className="relative h-48 w-16 overflow-hidden rounded-xl border border-border bg-background/70 shadow-[inset_0_2px_8px_rgb(0_0_0/0.5)]">
                  <div
                    className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-primary to-gold transition-all duration-500"
                    style={{
                      height:
                        momentum.score === 0
                          ? "0%"
                          : momentum.level === "Low"
                            ? "33%"
                            : momentum.level === "Medium"
                              ? "66%"
                              : "100%",
                    }}
                  />

                  {/* Zone divider lines */}
                  <div className="absolute left-0 right-0 top-1/3 border-t border-dashed border-muted-foreground/30" />
                  <div className="absolute left-0 right-0 top-2/3 border-t border-dashed border-muted-foreground/30" />
                </div>

                <div className="ml-3 flex h-48 flex-col items-start justify-between py-1 text-start text-xs text-muted-foreground">
                  <span>High</span>
                  <span>Medium</span>
                  <span>Low</span>
                </div>
              </div>

              <p className="mt-4 font-display text-lg font-semibold">{momentum.score}%</p>
            </div>
          </div>
        )}
      </section>

      {/* ---------------- Templates ---------------- */}
      <section>
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="flex flex-wrap items-center gap-3 text-lg sm:text-xl">
            <span className="hd-sparkle" aria-hidden="true" />
            Saved templates
          </h2>
          <Button asChild variant="outline">
            <Link href="/business/promotion-templates/create">
              <Plus className="mr-2 h-4 w-4" />
              Create Template
            </Link>
          </Button>
        </div>

        {templatesLoading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="h-56 animate-pulse rounded-2xl border bg-secondary/60"
              />
            ))}
          </div>
        ) : templates.length ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {templates.map((template, index) => (
              <div
                key={template.id}
                className="hd-panel overflow-hidden"
              >
                <PromotionVisualCard
                  imageUrl={template.imageUrl}
                  backgroundColor={template.backgroundColor || ""}
                  text={template.text || []}
                  className="aspect-video rounded-none border-b"
                />
                <div className="space-y-3 p-4">
                  <div>
                    <p className="truncate font-semibold">
                      {template.name || `Template ${index + 1}`}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Updated{" "}
                      {new Date(template.updatedAt).toLocaleDateString(
                        "en-US",
                        {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        },
                      )}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      asChild
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Link
                        href={`/business/promotion-templates/${template.id}/edit`}
                      >
                        Edit
                      </Link>
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleUseTemplate(template)}
                      title={
                        hasActiveSubscription
                          ? "Use this template"
                          : "Subscription required before using template"
                      }
                    >
                      <Wand2 className="mr-1 h-4 w-4" />
                      Use
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="hd-empty">
            <h3 className="font-semibold">No saved templates yet</h3>
            <p className="max-w-sm text-sm text-muted-foreground">
              Create templates now and reuse them when you launch promotions.
            </p>
            <Button asChild>
              <Link href="/business/promotion-templates/create">
                <Plus className="mr-2 h-4 w-4" />
                Create Template
              </Link>
            </Button>
          </div>
        )}
      </section>

      {/* ---------------- Promotions ---------------- */}
      <section>
        <h2 className="mb-4 flex flex-wrap items-center gap-3 text-lg sm:text-xl">
          <span className="hd-sparkle" aria-hidden="true" />
          Recent promotions
        </h2>

        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="h-40 animate-pulse rounded-2xl bg-secondary/60"
              />
            ))}
          </div>
        ) : promotions.length ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 sm:gap-6">
            {promotions.slice(0, 6).map((item) => (
              <BusinessPromotionCard
                key={item.id}
                promotion={item}
                onClick={() => setSelectedPromotion(item)}
                onActivate={handleActivate}
                onDeactivate={handleDeactivate}
                actioningId={actioningId}
                activateDisabled={!hasActiveSubscription}
                activateDisabledReason="Active subscription required to activate promotions"
              />
            ))}
          </div>
        ) : (
          <div className="hd-empty">
            <h3 className="font-semibold">No promotions yet</h3>
            <p className="max-w-md text-sm text-muted-foreground">
              {hasActiveSubscription
                ? "Create your first promotion to build momentum."
                : "You need an active subscription to create promotions. You can still create templates now and use them later."}
            </p>
            <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
              {!hasActiveSubscription && (
                <Button asChild variant="outline">
                  <Link href="/business/promotion-templates/create">
                    <Plus className="mr-2 h-4 w-4" />
                    Create Template
                  </Link>
                </Button>
              )}
              <Button asChild>
                <Link
                  href={
                    hasActiveSubscription
                      ? "/business/create-promotion"
                      : "/business/subscription"
                  }
                >
                  {hasActiveSubscription ? "Create Promotion" : "Subscribe"}
                </Link>
              </Button>
            </div>
          </div>
        )}
      </section>

      {/* Promotion Details Modal */}
      <PromotionDetailsModal
        promotion={selectedPromotion}
        open={!!selectedPromotion}
        onClose={() => setSelectedPromotion(null)}
      />

      <Dialog open={taggersOpen} onOpenChange={setTaggersOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Who tagged your business</DialogTitle>
          </DialogHeader>

          {taggersLoading ? (
            <div className="py-10 text-center text-muted-foreground">
              Loading...
            </div>
          ) : taggers.length === 0 ? (
            <div className="py-10 text-center text-muted-foreground">
              No tags yet.
            </div>
          ) : (
            <div className="space-y-2 max-h-[60vh] overflow-auto pr-1">
              {taggers.map((row, idx) => {
                const label =
                  row.taggerType === "user"
                    ? row.tagger?.fullName || row.tagger?.email || "User"
                    : row.taggerType === "business"
                      ? row.tagger?.name || row.tagger?.email || "Business"
                      : "Unknown";

                const sub =
                  row.taggerType === "user"
                    ? row.tagger?.email
                    : row.taggerType === "business"
                      ? row.tagger?.email
                      : null;

                return (
                  <div
                    key={`${row.taggerType}-${row.tagger?.id || idx}`}
                    className="rounded-xl border bg-secondary/40 p-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-medium truncate">{label}</p>
                        {sub ? (
                          <p className="text-xs text-muted-foreground truncate">
                            {sub}
                          </p>
                        ) : null}
                      </div>
                      <p className="text-xs text-muted-foreground whitespace-nowrap">
                        {row.taggedAt
                          ? new Date(row.taggedAt).toLocaleDateString()
                          : ""}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="flex items-center justify-end gap-2">
            <Button
              variant="outline"
              disabled={(taggersPage || 1) <= 1 || taggersLoading}
              onClick={() => setTaggersPage((p) => Math.max(1, p - 1))}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              disabled={
                taggersLoading ||
                (taggersPagination?.totalPages
                  ? taggersPage >= taggersPagination.totalPages
                  : true)
              }
              onClick={() =>
                setTaggersPage((p) =>
                  Math.min(taggersPagination?.totalPages || p + 1, p + 1),
                )
              }
            >
              Next
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

/* ---------------- Reusable Components ---------------- */

const StatCard = ({ icon: Icon, label, value, onClick, disabled }: any) => {
  const Comp: any = onClick ? "button" : "div";
  const isDisabled = onClick && disabled;
  
  return (
    <Comp
      type={onClick ? "button" : undefined}
      onClick={onClick}
      disabled={isDisabled}
      className={`hd-panel flex items-center gap-4 p-5 text-left ${
        onClick && !isDisabled
          ? "hd-panel-interactive cursor-pointer"
          : ""
      } ${
        isDisabled
          ? "opacity-60 cursor-not-allowed"
          : ""
      }`}
      title={isDisabled ? "Google Place ID required" : undefined}
    >
      <span className="hd-icon-tile">
        <Icon className="h-5 w-5" />
      </span>
      <div>
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="font-display text-2xl font-semibold tabular-nums">{value}</p>
        {isDisabled && (
          <p className="text-xs text-warning mt-1">Requires Google Maps</p>
        )}
      </div>
    </Comp>
  );
};

// Simple single-bar chart showing all levels with zone labels
const SimpleBarChart = ({ title, level }) => {
  const getFillPercentage = () => {
    if (level === "Empty") return 0;
    if (level === "Low") return 33;
    if (level === "Medium") return 66;
    return 100;
  };

  return (
    <div className="hd-panel flex flex-col items-center gap-4 p-6">
      <h3 className="font-medium mr-auto">{title}</h3>

      <div className="flex items-stretch">
        <div className="relative h-48 w-16 overflow-hidden rounded-xl border border-border bg-background/70 shadow-[inset_0_2px_8px_rgb(0_0_0/0.5)]">
          <div
            className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-primary to-gold transition-all duration-500"
            style={{ height: `${getFillPercentage()}%` }}
          />
          <div className="absolute left-0 right-0 top-1/3 border-t border-dashed border-muted-foreground/30" />
          <div className="absolute left-0 right-0 top-2/3 border-t border-dashed border-muted-foreground/30" />
        </div>
        <div className="ml-3 flex h-48 flex-col items-start justify-between py-1 text-start text-xs text-muted-foreground">
          <span>High</span>
          <span>Medium</span>
          <span>Low</span>
        </div>
      </div>

      <p className="mt-2 font-semibold">
        {level === "Empty" ? "No promotions yet" : `${level} intensity`}
      </p>
    </div>
  );
};

// Monthly chart with 10 steps
const MonthlyStepChart = ({ title, value, maxValue = 10 }) => {
  const steps = Array.from({ length: maxValue }, (_, i) => i + 1);
  const filledSteps = Math.min(value, maxValue);

  return (
    <div className="hd-panel flex flex-col items-center gap-4 p-6">
      <h3 className="font-medium mr-auto">{title}</h3>
      <div className="flex items-stretch">
        <div className="relative flex h-48 w-16 flex-col-reverse overflow-hidden rounded-xl border border-border bg-background/70 shadow-[inset_0_2px_8px_rgb(0_0_0/0.5)]">
          {steps.map((step) => (
            <div
              key={step}
              className={`flex-1 transition-all duration-300 ${
                step <= filledSteps ? "bg-gradient-to-t from-primary to-primary-light" : "bg-transparent"
              }`}
              style={{
                borderTop: step > 1 ? "1px dashed rgb(255 255 255 / 0.08)" : "none",
              }}
            />
          ))}
        </div>
        <div className="ml-3 flex h-48 flex-col items-start justify-between py-1 text-start text-xs text-muted-foreground">
          <span>High</span>
          <span>Medium</span>
          <span>Low</span>
        </div>
      </div>
      <p className="mt-2 font-semibold">{value} {value === 1 ? "promotion" : "promotions"}</p>
    </div>
  );
};

export default BusinessDashboard;

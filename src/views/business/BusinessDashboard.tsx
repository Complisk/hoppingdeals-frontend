"use client";
import {
  AlertCircle,
  CreditCard,
  Layers,
  Plus,
  QrCode,
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
      <div>
        <h1 className="text-2xl font-bold sm:text-3xl">Dashboard</h1>
        <p className="text-muted-foreground">
          Promotion frequency & growth overview
        </p>
      </div>

      {!hasActiveSubscription && (
        <section className="rounded-2xl border border-amber-300 bg-amber-50 p-4 sm:p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <p className="flex items-center gap-2 text-sm font-semibold text-amber-900">
                <AlertCircle className="h-4 w-4" />
                No active subscription
              </p>
              <p className="text-sm text-amber-800">
                Create banner templates on this Free Business Page! When you are
                ready to run a live promotion hit subscribe.
              </p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button asChild variant="outline" className="border-amber-400">
                <Link href="/business/promotion-templates/create">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Template
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
            <div key={i} className="h-24 bg-muted rounded-xl animate-pulse" />
          ))
        ) : (
          <>
            <StatCard
              icon={Layers}
              label="Total Promotions"
              value={dashboard?.stats?.totalPromotions || 0}
            />
            <StatCard
              icon={TrendingUp}
              label="Active Promotions"
              value={dashboard?.stats?.activePromotions || 0}
            />
            <StatCard
              icon={Users}
              label="Tagged By Users"
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
        <h2 className="mb-4 flex flex-wrap items-center gap-2 text-lg font-semibold sm:text-xl">
          <TrendingUp className="h-5 w-5 text-primary" />
          Promotion Intensity & Momentum
        </h2>

        {loading ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-60 bg-muted rounded-xl animate-pulse" />
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
            <div className="bg-card border rounded-2xl p-6 text-center flex flex-col items-center">
              <div className="flex justify-between w-full mb-4">
                <h3 className="font-medium">Overall Momentum</h3>
                <Zap className="text-accent" />
              </div>

              <div className="flex items-stretch">
                {/* The Bar - Larger */}
                <div className="h-48 w-16 relative overflow-hidden border-2 border-foreground bg-background">
                  <div
                    className="absolute bottom-0 left-0 w-full bg-primary transition-all duration-500"
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

                <div className="flex flex-col justify-between items-start text-start h-48 ml-2 py-1">
                  <span>High</span>
                  <span>Medium</span>
                  <span>Low</span>
                </div>
              </div>

              <p className="font-semibold mt-4">Score: {momentum.score}%</p>
            </div>
          </div>
        )}
      </section>

      {/* ---------------- Templates ---------------- */}
      <section>
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="flex flex-wrap items-center gap-2 text-lg font-semibold sm:text-xl">
            <Layers className="h-5 w-5 text-primary" />
            Saved Templates
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
                className="h-56 rounded-2xl border bg-muted animate-pulse"
              />
            ))}
          </div>
        ) : templates.length ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {templates.map((template, index) => (
              <div
                key={template.id}
                className="overflow-hidden rounded-xl border bg-card"
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
          <div className="rounded-2xl border border-dashed bg-card p-10 text-center">
            <h3 className="mb-2 font-semibold">No saved templates yet</h3>
            <p className="mb-4 text-sm text-muted-foreground">
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
        <h2 className="mb-4 flex flex-wrap items-center gap-2 text-lg font-semibold sm:text-xl">
          <QrCode className="h-5 w-5 text-primary" />
          Recently Added Promotions
        </h2>

        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="h-40 bg-muted rounded-2xl animate-pulse"
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
          <div className="bg-card border-dashed border rounded-2xl p-10 text-center">
            <h3 className="font-semibold mb-2">No promotions yet</h3>
            <p className="text-sm text-muted-foreground mb-4">
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
                    className="rounded-lg border p-3"
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
      className={`bg-card border rounded-2xl p-4 flex items-center gap-4 text-left ${
        onClick && !isDisabled
          ? "hover:bg-muted/40 transition-colors cursor-pointer"
          : ""
      } ${
        isDisabled
          ? "opacity-60 cursor-not-allowed"
          : ""
      }`}
      title={isDisabled ? "Google Place ID required" : undefined}
    >
      <Icon className="h-8 w-8 text-primary" />
      <div>
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="text-2xl font-bold">{value}</p>
        {isDisabled && (
          <p className="text-xs text-amber-600 mt-1">Requires Google Maps</p>
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
    <div className="bg-card border rounded-2xl p-6 flex flex-col items-center gap-4">
      <h3 className="font-medium mr-auto">{title}</h3>

      <div className="flex items-stretch">
        <div className="h-48 w-16 relative overflow-hidden border-2 border-foreground bg-background">
          <div
            className="absolute bottom-0 left-0 w-full bg-primary transition-all duration-500"
            style={{ height: `${getFillPercentage()}%` }}
          />
          <div className="absolute left-0 right-0 top-1/3 border-t border-dashed border-muted-foreground/30" />
          <div className="absolute left-0 right-0 top-2/3 border-t border-dashed border-muted-foreground/30" />
        </div>
        <div className="flex flex-col justify-between items-start text-start h-48 ml-2 py-1">
          <span>High</span>
          <span>Medium</span>
          <span>Low</span>
        </div>
      </div>

      <p className="font-semibold mt-2">
        {level === "Empty" ? "No Data" : `${level} Intensity`}
      </p>
    </div>
  );
};

// Monthly chart with 10 steps
const MonthlyStepChart = ({ title, value, maxValue = 10 }) => {
  const steps = Array.from({ length: maxValue }, (_, i) => i + 1);
  const filledSteps = Math.min(value, maxValue);

  return (
    <div className="bg-card border rounded-2xl p-6 flex flex-col items-center gap-4">
      <h3 className="font-medium mr-auto">{title}</h3>
      <div className="flex items-stretch">
        <div className="h-48 w-16 relative overflow-hidden border-2 border-foreground bg-background flex flex-col-reverse">
          {steps.map((step) => (
            <div
              key={step}
              className={`flex-1 transition-all duration-300 ${
                step <= filledSteps ? "bg-primary" : "bg-transparent"
              }`}
              style={{
                borderTop: step > 1 ? "1px dashed rgba(0,0,0,0.1)" : "none",
              }}
            />
          ))}
        </div>
        <div className="flex flex-col justify-between items-start text-start h-48 ml-2 py-1">
          <span>High</span>
          <span>Medium</span>
          <span>Low</span>
        </div>
      </div>
      <p className="font-semibold mt-2">{value} Promotions</p>
    </div>
  );
};

export default BusinessDashboard;

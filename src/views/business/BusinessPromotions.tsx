"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, Layers } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { usePromotionService } from "@/services/promotionService";
import { useSubscriptionService } from "@/services/subscriptionService";
import BoxLoader from "@/components/shared/BoxLoader";
import { PromotionDetailsModal } from "@/components/shared/PromotionDetailsModal";
import BusinessPromotionCard from "@/components/shared/BusinessPromotionCard";
import { toast } from "react-toastify";

/* ---------------------------------- */
/* Tabs Configuration */
/* ---------------------------------- */
const TABS = [
  { value: "all", label: "All", emptyText: "No promotions yet" },
  { value: "active", label: "Active", emptyText: "No active promotions yet" },
  { value: "inactive", label: "Inactive", emptyText: "No inactive promotions" },
  { value: "pending", label: "Pending", emptyText: "No pending promotions" },
  { value: "expired", label: "Expired", emptyText: "No expired promotions" },
];

const BusinessPromotions = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [apiPromotions, setApiPromotions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPromotion, setSelectedPromotion] = useState<any | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [promotionToDelete, setPromotionToDelete] = useState<any | null>(null);
  const [actioningId, setActioningId] = useState<string | null>(null);
  const { getBusinessPromotions, activatePromotion, deactivatePromotion } =
    usePromotionService();
  const { getActive, getCachedActive } = useSubscriptionService();
  const [activeSubscription, setActiveSubscription] = useState<any>(null);

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

  const hasActiveSubscription = Boolean(activeSubscription);
  const fetchPromotions = async ({ loading = true } = {}) => {
    if (loading) setIsLoading(true);

    try {
      const { response, error } = await getBusinessPromotions(
        searchQuery,
        activeTab,
      );

      if (error) {
        setApiPromotions([]);
      } else {
        setApiPromotions(response || []);
      }
    } catch (err) {
      setApiPromotions([]);
    } finally {
      if (loading) setIsLoading(false);
    }
  };

  /* Fetch on mount + tab change + search */
  useEffect(() => {
    fetchPromotions();
  }, [searchQuery, activeTab]);

  /* ---------------------------------- */
  /* Actions */
  /* ---------------------------------- */
  const handleActivate = async (e: any, promotionId: string) => {
    e.stopPropagation();
    if (!hasActiveSubscription) {
      toast.info("You need an active subscription to activate promotions.");
      return;
    }
    try {
      setActioningId(promotionId);
      await activatePromotion(promotionId);
      setActioningId(null);
      fetchPromotions({ loading: false });
    } catch (error) {
    } finally {
    }
  };

  const handleDeactivate = async (e: any, promotionId: string) => {
    e.stopPropagation();
    try {
      setActioningId(promotionId);
      await deactivatePromotion(promotionId);
      setActioningId(null);
      fetchPromotions({ loading: false });
    } catch (error) {
    } finally {
    }
  };

  const handleDelete = () => {
    toast.success("Promotion deleted successfully");
    setShowDeleteDialog(false);
    setPromotionToDelete(null);
    fetchPromotions();
  };

  /* ---------------------------------- */
  /* Promotion Grid */
  /* ---------------------------------- */
  const PromotionGrid = ({ emptyText }: { emptyText: string }) => {
    if (isLoading) {
      return (
        <div className="py-6">
          <BoxLoader count={3} />
        </div>
      );
    }

    if (!apiPromotions.length) {
      return (
        <div className="text-center py-12 text-muted-foreground">
          {emptyText}
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 sm:gap-6">
        {apiPromotions.map((promotion) => (
          <BusinessPromotionCard
            key={promotion.id}
            promotion={promotion}
            onClick={() => setSelectedPromotion(promotion)}
            onActivate={handleActivate}
            onDeactivate={handleDeactivate}
            actioningId={actioningId}
            activateDisabled={!hasActiveSubscription}
            activateDisabledReason="Active subscription required to activate promotions"
          />
        ))}
      </div>
    );
  };

  /* ---------------------------------- */
  /* Render */
  /* ---------------------------------- */
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">My Promotions</h1>
          <p className="text-muted-foreground">Manage all your promotions</p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <Button variant="outline" asChild className="w-full sm:w-auto">
            <Link href="/business/promotion-templates">
              <Layers className="h-5 w-5 mr-2" /> Templates
            </Link>
          </Button>
          <Button asChild className="w-full sm:w-auto">
            <Link href="/business/create-promotion">
              <Plus className="h-5 w-5 mr-2" /> Create Promotion
            </Link>
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-full sm:max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search promotions..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="overflow-x-auto pb-2">
          <TabsList className="w-max min-w-full sm:min-w-0">
            {TABS.map((tab) => (
              <TabsTrigger key={tab.value} value={tab.value}>
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        {TABS.map((tab) => (
          <TabsContent key={tab.value} value={tab.value} className="mt-6">
            <PromotionGrid emptyText={tab.emptyText} />
          </TabsContent>
        ))}
      </Tabs>

      {/* Delete Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Promotion</DialogTitle>
            <DialogDescription>This action cannot be undone.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Promotion Details Modal */}
      <PromotionDetailsModal
        promotion={selectedPromotion}
        open={!!selectedPromotion}
        onClose={() => setSelectedPromotion(null)}
      />
    </div>
  );
};

export default BusinessPromotions;

"use client";
import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Trash2, Eye, Power } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useAdminService } from "@/services/adminService";
import type { AppDispatch } from "@/store";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { PromotionDetailsModal } from "@/components/shared/PromotionDetailsModal";
import Link from "next/link";
import Spinner from "@/components/shared/Spinner";
import { parseDateOnlyToLocal } from "@/utils/dateOnly";

type PromotionStatus = "active" | "pending" | "inactive" | "expired";

const AdminPromotions = () => {
  const dispatch = useDispatch<AppDispatch>();
  const {
    getPromotions,
    updatePromotionStatus,
    deletePromotion,
    toggleBusinessAutoApprove,
    runPromotion,
  } = useAdminService();
  const { toast } = useToast();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<PromotionStatus | "all">(
    "all",
  );
  const [promotions, setPromotions] = useState<any[]>([]);
  const [pagination, setPagination] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [updatingIds, setUpdatingIds] = useState<string[]>([]);
  const [selectedPromotion, setSelectedPromotion] = useState<any>(null); // For modal
  const pageSize = 10;

  const statuses: PromotionStatus[] = [
    "active",
    "pending",
    "inactive",
    "expired",
  ];

  // Fetch promotions whenever filters change
  useEffect(() => {
    fetchPromotions();
  }, [currentPage, selectedStatus]);

  const fetchPromotions = async () => {
    try {
      setLoading(true);
      const response = await getPromotions(
        currentPage,
        pageSize,
        selectedStatus !== "all" ? selectedStatus : undefined,
        searchQuery,
      );
      if (response) {
        setPromotions(response.promotions || []);
        setPagination(response.pagination);
      }
    } catch (error) {
      console.error("Error fetching promotions:", error);
      toast({
        title: "Error",
        description: "Failed to fetch promotions",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setCurrentPage(1);
    fetchPromotions();
  };

  const handleStatusChange = async (promo: any) => {
    if (!promo) return;
    if (promo.status === "expired") {
      toast({
        title: "Action Not Allowed",
        description: "Cannot change status of expired promotions",
        variant: "destructive",
      });
      return;
    }
    if (promo.status === "active") {
      toast({
        title: "Action Not Allowed",
        description:
          "Cannot change status of inactive promotions it will change from business side",
        variant: "destructive",
      });
      return;
    }

    const newStatusValue = promo.status == "pending" ? "inactive" : "pending";
    try {
      setUpdatingIds((prev) => [...prev, promo.id]);
      await updatePromotionStatus(promo.id, newStatusValue);

      setPromotions((prev) =>
        prev.map((p) =>
          p.id === promo.id ? { ...p, status: newStatusValue } : p,
        ),
      );
    } catch (error) {
      console.error("Error updating status:", error);
      toast({
        title: "Error",
        description: "Failed to update status",
        variant: "destructive",
      });
    } finally {
      setUpdatingIds((prev) => prev.filter((id) => id !== promo.id));
    }
  };

  const handleToggleAutoApprove = async (promo: any) => {
    if (!promo?.business) return;
    try {
      setUpdatingIds((prev) => [...prev, promo.id]);
      const newValue = !promo.business.autoApprovePromotions;
      await toggleBusinessAutoApprove(promo.business.id, newValue);

      setPromotions((prev) =>
        prev.map((p) =>
          p.id === promo.id
            ? {
                ...p,
                businessAutoApprove: newValue,
                business: { ...p.business, autoApprovePromotions: newValue },
              }
            : p,
        ),
      );
    } catch (error) {
      console.error("Error toggling auto-approve:", error);
      toast({
        title: "Error",
        description: "Failed to toggle auto-approve",
        variant: "destructive",
      });
    } finally {
      setUpdatingIds((prev) => prev.filter((id) => id !== promo.id));
    }
  };

  const handleDelete = async (promo: any) => {
    if (!promo) return;
    try {
      setUpdatingIds((prev) => [...prev, promo.id]);
      await deletePromotion(promo.id);
      setPromotions((prev) => prev.filter((p) => p.id !== promo.id));
    } catch (error) {
      console.error("Error deleting promotion:", error);
      toast({
        title: "Error",
        description: "Failed to delete promotion",
        variant: "destructive",
      });
    } finally {
      setUpdatingIds((prev) => prev.filter((id) => id !== promo.id));
    }
  };

  const runThisPromotion = async (promo: any) => {
    if (!promo) return;
    try {
      setUpdatingIds((prev) => [...prev, promo.id]);
      // If promo is active -> stop it (set inactive), else run it (activate and deactivate others)
      if (promo.status === "active") {
        await updatePromotionStatus(promo.id, "inactive");
      } else {
        await runPromotion(promo.id);
      }
      // Refresh list and pagination
      fetchPromotions();
    } catch (error) {
      console.error("Error running/stopping promotion:", error);
      toast({
        title: "Error",
        description: "Failed to run/stop promotion",
        variant: "destructive",
      });
    } finally {
      setUpdatingIds((prev) => prev.filter((id) => id !== promo.id));
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "inactive":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Promotion Management
          </h1>
          <p className="text-muted-foreground">
            View and manage all promotions
          </p>
        </div>
        <Badge variant="secondary" className="text-lg px-4 py-2">
          {pagination?.total || 0} Total
        </Badge>
      </div>

      {/* Search */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by business name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="pl-10"
          />
        </div>
        <Button onClick={handleSearch} disabled={loading}>
          {loading && <Spinner className="w-4 h-4 mr-2 animate-spin"  />}
          Search
        </Button>
      </div>

      {/* Status Tabs */}
      <div className=" flex justify-between">
        <div className="flex gap-2 border-b border-border pb-4 overflow-x-auto">
          <Button
            variant={selectedStatus === "all" ? "default" : "ghost"}
            onClick={() => {
              setSelectedStatus("all");
              setCurrentPage(1);
            }}
          >
            All Promotions
          </Button>
          {statuses.map((status) => (
            <Button
              key={status}
              variant={selectedStatus === status ? "default" : "ghost"}
              onClick={() => {
                setSelectedStatus(status);
                setCurrentPage(1);
              }}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </Button>
          ))}
        </div>
        <Link href="/admin/create-promotion">
          <Button>Create Promotion</Button>
        </Link>
      </div>

      {/* Table */}
      <div className="bg-card rounded-2xl border border-border overflow-hidden relative">
        {loading ? (
          <div className="p-8 text-center">
            <Spinner className="w-8 h-8 animate-spin mx-auto text-muted-foreground"  />
            <p className="text-muted-foreground mt-2">Loading promotions...</p>
          </div>
        ) : promotions.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-muted-foreground">No promotions found</p>
          </div>
        ) : (
          <table
            className={`w-full ${
              updatingIds.length ? "pointer-events-none opacity-50" : ""
            }`}
          >
            <thead className="bg-secondary text-left text-sm">
              <tr>
                <th className="p-4">Business</th>

                <th className="p-4">Status</th>
                <th className="p-4">Business Auto-Approve</th>
                <th className="p-4">Views</th>
                <th className="p-4">Clicks</th>
                <th className="p-4">Date Range</th>
                <th className="p-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {promotions.map((promo) => {
                const isUpdating = updatingIds.includes(promo.id);
                const runDate = parseDateOnlyToLocal(promo.runDate);
                const stopDate = parseDateOnlyToLocal(promo.stopDate);
                return (
                  <tr key={promo.id} className="hover:bg-secondary/50">
                    <td className="p-4">
                      <button
                        type="button"
                        onClick={() => setSelectedPromotion(promo)}
                        className="text-left transition-colors hover:text-primary"
                      >
                        {promo?.metadata?.businessName ? (
                          <div>
                            <p className="font-medium hover:underline">
                              {promo?.metadata?.businessName} (admin)
                            </p>
                          </div>
                        ) : (
                          <div>
                            <p className="font-medium hover:underline">
                              {promo.business?.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {promo.business?.email}
                            </p>
                          </div>
                        )}
                      </button>
                    </td>
                    <td className="p-4 flex items-center gap-4">
                      {promo.status === "active" ? (
                        <Badge variant="default">Active</Badge>
                      ) : promo.status === "inactive" ? (
                        <Badge variant="secondary">Inactive</Badge>
                      ) : promo.status === "pending" ? (
                        <Badge variant="secondary">Pending Approval</Badge>
                      ) : (
                        <Badge variant="outline">Expeired</Badge>
                      )}
                      <Switch
                        checked={promo?.status == "pending" ? false : true}
                        onCheckedChange={() => handleStatusChange(promo)}
                        disabled={isUpdating || updatingIds.length > 0}
                      />
                    </td>
                    <td className="p-4">
                      <Switch
                        checked={promo?.business?.autoApprovePromotions}
                        onCheckedChange={() => handleToggleAutoApprove(promo)}
                        disabled={isUpdating || updatingIds.length > 0}
                      />
                    </td>
                    <td className="p-4">
                      {promo?.views?.toLocaleString() || 0}
                    </td>
                    <td className="p-4">
                      {promo?.clicks?.toLocaleString() || 0}
                    </td>
                    <td className="p-4 text-sm text-muted-foreground">
                      <div>
                        <p>{runDate ? runDate.toLocaleDateString() : "-"}</p>
                        <p className="text-xs">
                          to {stopDate ? stopDate.toLocaleDateString() : "-"}
                        </p>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => setSelectedPromotion(promo)}
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <Link href={`/admin/promotions/${promo.id}/edit`}>
                              <DropdownMenuItem>Edit</DropdownMenuItem>
                            </Link>
                            <DropdownMenuItem
                              onClick={() => handleDelete(promo)}
                              className="text-destructive"
                              disabled={isUpdating || updatingIds.length > 0}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>

                        {/* Run/Stop button for admin to toggle promotion running for its business */}
                        {promo?.metadata?.businessName && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => runThisPromotion(promo)}
                            disabled={isUpdating || updatingIds.length > 0}
                            className={`gap-1 ${promo.status === "active" ? "text-orange-600 hover:bg-orange-50" : "text-green-600 hover:bg-green-50"}`}
                          >
                            {isUpdating && updatingIds.includes(promo.id) ? (
                              <Spinner className="animate-spin"  />
                            ) : promo.status === "active" ? (
                              <Power className="h-4 w-4" />
                            ) : (
                              <Power className="h-4 w-4" />
                            )}
                            {promo.status === "active" ? "Stop" : "Run"}
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {pagination && (
        <div className="p-4 border-t border-border flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Page {pagination.currentPage} of {pagination.pages} (
            {pagination.total} total)
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === 1 || updatingIds.length > 0}
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={
                currentPage === pagination.pages || updatingIds.length > 0
              }
              onClick={() =>
                setCurrentPage(Math.min(pagination.pages, currentPage + 1))
              }
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Promotion Details Modal */}
      <PromotionDetailsModal
        promotion={selectedPromotion}
        open={!!selectedPromotion}
        onClose={() => setSelectedPromotion(null)}
      />
    </div>
  );
};

export default AdminPromotions;

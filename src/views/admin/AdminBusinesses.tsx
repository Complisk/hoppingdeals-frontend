"use client";
import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search, MoreHorizontal, ToggleLeft, ToggleRight, Download } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAdminService } from "@/services/adminService";
import { useSubscriptionTemplateService } from "@/services/subscriptionTemplateService";
import Spinner from "@/components/shared/Spinner";

type BusinessStatus = "active" | "inactive" | "blocked" | "suspended";

const AdminBusinesses = () => {
  const {
    getBusinesses,
    downloadBusinessesCsv,
    updateBusinessStatus,
    toggleBusinessAutoApprove,
    grantBusinessSubscription,
  } = useAdminService();
  const { getAllTemplates } = useSubscriptionTemplateService();
  const { toast } = useToast();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<BusinessStatus | "all">(
    "all",
  );
  const [autoApproveFilter, setAutoApproveFilter] = useState<
    "all" | "true" | "false"
  >("all");
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [pagination, setPagination] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [selectedBusiness, setSelectedBusiness] = useState<any>(null);
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [newStatus, setNewStatus] = useState<BusinessStatus | "">();
  const [updating, setUpdating] = useState(false);
  const [togglingAutoApprove, setTogglingAutoApprove] = useState(false);
  const [showSubscriptionDialog, setShowSubscriptionDialog] = useState(false);
  const [templatesLoading, setTemplatesLoading] = useState(false);
  const [subscriptionTemplates, setSubscriptionTemplates] = useState<any[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("");
  const [extendMonths, setExtendMonths] = useState<number>(1);
  const [updatingSubscription, setUpdatingSubscription] = useState(false);
  const [exportingCsv, setExportingCsv] = useState(false);
  const [exportLimit, setExportLimit] = useState<number>(100);

  const pageSize = 10;

  // Fetch businesses whenever filters change
  useEffect(() => {
    fetchBusinesses();
  }, [currentPage, selectedStatus, autoApproveFilter]);

  useEffect(() => {
    if (!showSubscriptionDialog) return;

    const loadTemplates = async () => {
      try {
        setTemplatesLoading(true);
        const templates = await getAllTemplates();
        setSubscriptionTemplates(
          (templates || []).filter((t: any) => t?.isActive !== false),
        );
      } catch (error) {
        console.error("Error fetching subscription templates:", error);
        toast({
          title: "Error",
          description: "Failed to fetch subscription templates",
          variant: "destructive",
        });
      } finally {
        setTemplatesLoading(false);
      }
    };

    loadTemplates();
  }, [showSubscriptionDialog]);

  const fetchBusinesses = async () => {
    try {
      setLoading(true);
      const response = await getBusinesses(
        currentPage,
        pageSize,
        searchQuery,
        selectedStatus !== "all" ? selectedStatus : undefined,
        autoApproveFilter !== "all" ? autoApproveFilter === "true" : undefined,
      );

      if (response) {
        setBusinesses(response.businesses || []);
        setPagination(response.pagination);
      }
    } catch (error) {
      console.error("Error fetching businesses:", error);
      toast({
        title: "Error",
        description: "Failed to fetch businesses",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setCurrentPage(1);
    fetchBusinesses();
  };

  const handleExportCsv = async () => {
    try {
      setExportingCsv(true);
      await downloadBusinessesCsv({
        search: searchQuery,
        status: selectedStatus !== "all" ? selectedStatus : undefined,
        autoApprove:
          autoApproveFilter !== "all" ? autoApproveFilter === "true" : undefined,
        limit: exportLimit,
      });
      toast({
        title: "Export completed",
        description: `Business CSV file downloaded (${Math.max(1, Number(exportLimit) || 1)} rows requested)`,
      });
    } catch (error: any) {
      toast({
        title: "Export failed",
        description: error?.message || "Could not export businesses",
        variant: "destructive",
      });
    } finally {
      setExportingCsv(false);
    }
  };

  const handleStatusChange = async () => {
    if (!selectedBusiness || !newStatus) return;

    try {
      setUpdating(true);
      await updateBusinessStatus(selectedBusiness.id, newStatus);

      // Refresh the businesses list
      await fetchBusinesses();

      setShowStatusDialog(false);
      setNewStatus("");
      setSelectedBusiness(null);
    } catch (error) {
      console.error("Error updating status:", error);
    } finally {
      setUpdating(false);
    }
  };

  const handleToggleAutoApprove = async (business: any) => {
    try {
      setTogglingAutoApprove(true);
      const newValue = !business.autoApprovePromotions;
      await toggleBusinessAutoApprove(business.id, newValue);

      // Refresh the businesses list
      await fetchBusinesses();
    } catch (error) {
      console.error("Error toggling auto-approve:", error);
    } finally {
      setTogglingAutoApprove(false);
    }
  };

  const handleUpdateSubscription = async () => {
    if (!selectedBusiness?.id) return;

    try {
      setUpdatingSubscription(true);

      const hasActiveSubscription = Boolean(
        selectedBusiness?.activeSubscription?.endDate,
      );

      if (hasActiveSubscription) {
        await grantBusinessSubscription(selectedBusiness.id, {
          extendMonths: Number(extendMonths),
        });
      } else {
        if (!selectedTemplateId) return;
        await grantBusinessSubscription(selectedBusiness.id, {
          templateId: selectedTemplateId,
        });
      }

      await fetchBusinesses();
      setShowSubscriptionDialog(false);
      setSelectedBusiness(null);
      setSelectedTemplateId("");
      setExtendMonths(1);
    } catch (error) {
      console.error("Error updating subscription:", error);
    } finally {
      setUpdatingSubscription(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "inactive":
        return "bg-gray-100 text-gray-800";
      case "blocked":
        return "bg-red-100 text-red-800";
      case "suspended":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const statuses: BusinessStatus[] = ["active", "inactive"];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Business Management
          </h1>
          <p className="text-muted-foreground">
            Manage all registered businesses
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            min={1}
            step={1}
            value={String(exportLimit)}
            onChange={(e) =>
              setExportLimit(Math.max(1, Number(e.target.value || 1)))
            }
            className="w-28"
            placeholder="Rows"
          />
          <Button
            variant="outline"
            onClick={handleExportCsv}
            disabled={exportingCsv}
          >
            {exportingCsv ? (
              <Spinner className="w-4 h-4 mr-2 animate-spin"  />
            ) : (
              <Download className="w-4 h-4 mr-2" />
            )}
            Export CSV
          </Button>
          <Badge variant="secondary" className="text-lg px-4 py-2">
            {pagination?.total || 0} Total
          </Badge>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, email, or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="pl-10"
          />
        </div>
        <Select
          value={autoApproveFilter}
          onValueChange={(value) => {
            setAutoApproveFilter(value as "all" | "true" | "false");
            setCurrentPage(1);
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Auto-Approve Setting" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Businesses</SelectItem>
            <SelectItem value="true">Auto-Approve Enabled</SelectItem>
            <SelectItem value="false">Auto-Approve Disabled</SelectItem>
          </SelectContent>
        </Select>

        <Button onClick={handleSearch} disabled={loading}>
          {loading && <Spinner className="w-4 h-4 mr-2 animate-spin"  />}
          Search
        </Button>
      </div>

      {/* Status Tabs */}
      <div className="flex gap-2 border-b border-border pb-4 overflow-x-auto">
        <Button
          variant={selectedStatus === "all" ? "default" : "ghost"}
          onClick={() => {
            setSelectedStatus("all");
            setCurrentPage(1);
          }}
        >
          All Businesses
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

      {/* Table */}
      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <Spinner className="w-8 h-8 animate-spin mx-auto text-muted-foreground"  />
            <p className="text-muted-foreground mt-2">Loading businesses...</p>
          </div>
        ) : businesses.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-muted-foreground">No businesses found</p>
          </div>
        ) : (
          <>
            <table className="w-full">
              <thead className="bg-secondary text-left text-sm">
                <tr>
                  <th className="p-4">Business</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Subscription</th>
                  <th className="p-4">Auto-Approve</th>
                  <th className="p-4">Created</th>
                  <th className="p-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {businesses.map((business) => (
                  <tr key={business.id} className="hover:bg-secondary/50">
                    <td className="p-4 font-medium">{business.name}</td>
                    <td className="p-4 text-muted-foreground">
                      {business.email}
                    </td>
                    <td className="p-4">
                      <Badge className={getStatusColor(business.status)}>
                        {business.status}
                      </Badge>
                    </td>
                    <td className="p-4">
                      {business.activeSubscription?.endDate ? (
                        <div className="space-y-1">
                          <p className="text-sm font-medium">
                            {business.activeSubscription?.template?.name ||
                              "Active"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Until{" "}
                            {new Date(
                              business.activeSubscription.endDate,
                            ).toLocaleDateString()}
                          </p>
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">
                          None
                        </span>
                      )}
                    </td>
                    <td className="p-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggleAutoApprove(business)}
                        disabled={togglingAutoApprove}
                      >
                        {business.autoApprovePromotions ? (
                          <>
                            <ToggleRight className="h-4 w-4 text-green-600 mr-2" />
                            <span className="text-green-600 text-xs">
                              Enabled
                            </span>
                          </>
                        ) : (
                          <>
                            <ToggleLeft className="h-4 w-4 text-gray-600 mr-2" />
                            <span className="text-gray-600 text-xs">
                              Disabled
                            </span>
                          </>
                        )}
                      </Button>
                    </td>
                    <td className="p-4 text-muted-foreground">
                      {new Date(business.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-4">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedBusiness(business);
                              setShowDetailsDialog(true);
                            }}
                          >
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedBusiness(business);
                              setSelectedTemplateId("");
                              setExtendMonths(1);
                              setShowSubscriptionDialog(true);
                            }}
                          >
                            Add / Extend Subscription
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedBusiness(business);
                              setNewStatus(business.status);
                              setShowStatusDialog(true);
                            }}
                          >
                            Change Status
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

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
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage === pagination.pages}
                    onClick={() =>
                      setCurrentPage(
                        Math.min(pagination.pages, currentPage + 1),
                      )
                    }
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Status Change Dialog */}
      <Dialog open={showStatusDialog} onOpenChange={setShowStatusDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Business Status</DialogTitle>
            <DialogDescription>
              Update the status for {selectedBusiness?.name}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium mb-2">Current Status</p>
              <Badge className={getStatusColor(selectedBusiness?.status)}>
                {selectedBusiness?.status}
              </Badge>
            </div>

            <div>
              <p className="text-sm font-medium mb-2">New Status</p>
              <Select
                value={newStatus || ""}
                onValueChange={(value) => setNewStatus(value as BusinessStatus)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select new status" />
                </SelectTrigger>
                <SelectContent>
                  {statuses.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowStatusDialog(false)}
              disabled={updating}
            >
              Cancel
            </Button>
            <Button
              onClick={handleStatusChange}
              disabled={updating || !newStatus}
            >
              {updating && <Spinner className="w-4 h-4 mr-2 animate-spin"  />}
              Update Status
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Business Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Business Details</DialogTitle>
            <DialogDescription>
              Full information for {selectedBusiness?.name}
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-2">
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">Name</p>
              <p className="font-medium">{selectedBusiness?.name}</p>
            </div>

            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">Email</p>
              <p className="font-medium">{selectedBusiness?.email}</p>
            </div>

            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">Phone</p>
              <p className="font-medium">{selectedBusiness?.phone}</p>
            </div>

            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">Categories</p>
              <div className="flex flex-wrap gap-2">
                {selectedBusiness?.categories?.map((c: string) => (
                  <Badge key={c} variant="secondary">
                    {c}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">Contact Person Name</p>
              <p className="font-medium">{selectedBusiness?.personName}</p>
            </div>

            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">Address</p>
              <p className="font-medium">{selectedBusiness?.businessAddress}</p>
            </div>

            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">
                Auto-Approve Promotions
              </p>
              <p className="font-medium">
                {selectedBusiness?.autoApprovePromotions ? "Yes" : "No"}
              </p>
            </div>

            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">Status</p>
              <Badge className={getStatusColor(selectedBusiness?.status)}>
                {selectedBusiness?.status}
              </Badge>
            </div>

            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">Created At</p>
              <p className="font-medium">
                {selectedBusiness?.createdAt
                  ? new Date(selectedBusiness.createdAt).toLocaleString()
                  : "-"}
              </p>
            </div>

            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">Updated At</p>
              <p className="font-medium">
                {selectedBusiness?.updatedAt
                  ? new Date(selectedBusiness.updatedAt).toLocaleString()
                  : "-"}
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDetailsDialog(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Subscription Dialog */}
      <Dialog
        open={showSubscriptionDialog}
        onOpenChange={setShowSubscriptionDialog}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Manage Subscription</DialogTitle>
            <DialogDescription>
              Add or extend a subscription for {selectedBusiness?.name}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="rounded-lg border border-border bg-secondary/30 p-3">
              <p className="text-sm font-medium">Current Active Subscription</p>
              <p className="text-xs text-muted-foreground mt-1">
                {selectedBusiness?.activeSubscription?.endDate
                  ? `${
                      selectedBusiness?.activeSubscription?.template?.name ||
                      "Active"
                    } (until ${new Date(
                      selectedBusiness.activeSubscription.endDate,
                    ).toLocaleDateString()})`
                  : "None"}
              </p>
            </div>

            {selectedBusiness?.activeSubscription?.endDate ? (
              <div>
                <p className="text-sm font-medium mb-2">Extend End Date</p>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 sm:items-center">
                  <Input
                    type="number"
                    min={1}
                    value={String(extendMonths)}
                    onChange={(e) => setExtendMonths(Number(e.target.value))}
                    disabled={updatingSubscription}
                  />
                  <p className="text-xs text-muted-foreground">
                    Add months to the current end date
                  </p>
                </div>
              </div>
            ) : (
              <div>
                <p className="text-sm font-medium mb-2">Template</p>
                <Select
                  value={selectedTemplateId}
                  onValueChange={(value) => setSelectedTemplateId(value)}
                  disabled={templatesLoading}
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={
                        templatesLoading
                          ? "Loading templates..."
                          : "Select subscription template"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {subscriptionTemplates.map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.name} ({t.durationMonths} month
                        {Number(t.durationMonths) === 1 ? "" : "s"})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowSubscriptionDialog(false)}
              disabled={updatingSubscription}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdateSubscription}
              disabled={
                updatingSubscription ||
                (selectedBusiness?.activeSubscription?.endDate
                  ? !Number.isFinite(Number(extendMonths)) ||
                    Number(extendMonths) <= 0
                  : !selectedTemplateId)
              }
            >
              {updatingSubscription && (
                <Spinner className="w-4 h-4 mr-2 animate-spin"  />
              )}
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
};

export default AdminBusinesses;

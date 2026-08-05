"use client";
import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Eye, Search, User, Mail, Calendar, MoreHorizontal } from "lucide-react";
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
import type { AppDispatch } from "@/store";
import Spinner from "@/components/shared/Spinner";

type UserStatus = "active" | "inactive" | "blocked" | "suspended";
type UserRole = "user" | "business" | "admin";

const AdminUsers = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { getUsers, updateUserStatus } = useAdminService();
  const { toast } = useToast();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<UserStatus | "all">(
    "all"
  );
  const [selectedRole, setSelectedRole] = useState<UserRole | "all">("all");
  const [users, setUsers] = useState<any[]>([]);
  const [pagination, setPagination] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const [newStatus, setNewStatus] = useState<UserStatus | "">();
  const [updating, setUpdating] = useState(false);

  const pageSize = 10;

  // Fetch users whenever filters change
  useEffect(() => {
    fetchUsers();
  }, [currentPage, selectedStatus, selectedRole]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await getUsers(
        currentPage,
        pageSize,
        searchQuery,
        selectedRole !== "all" ? selectedRole : undefined,
        selectedStatus !== "all" ? selectedStatus : undefined
      );

      if (response) {
        setUsers(response.users || []);
        setPagination(response.pagination);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      toast({
        title: "Error",
        description: "Failed to fetch users",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setCurrentPage(1);
    fetchUsers();
  };

  const handleStatusChange = async () => {
    if (!selectedUser || !newStatus) return;

    try {
      setUpdating(true);
      await updateUserStatus(selectedUser.id, newStatus);

      // Refresh the users list
      await fetchUsers();

      setShowStatusDialog(false);
      setNewStatus("");
      setSelectedUser(null);
    } catch (error) {
      console.error("Error updating status:", error);
    } finally {
      setUpdating(false);
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

  const statuses: UserStatus[] = ["active", "inactive", "blocked", "suspended"];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            User Management
          </h1>
          <p className="text-muted-foreground">Manage all registered users</p>
        </div>
        <Badge variant="secondary" className="text-lg px-4 py-2">
          {pagination?.total || 0} Total
        </Badge>
      </div>

      {/* Filters and Search */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="pl-10"
          />
        </div>

        <Select
          value={selectedRole}
          onValueChange={(value) => {
            setSelectedRole(value as UserRole | "all");
            setCurrentPage(1);
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Filter by role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="user">User</SelectItem>
            <SelectItem value="business">Business</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={selectedStatus}
          onValueChange={(value) => {
            setSelectedStatus(value as UserStatus | "all");
            setCurrentPage(1);
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
            <SelectItem value="blocked">Blocked</SelectItem>
            <SelectItem value="suspended">Suspended</SelectItem>
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
          All Users
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
            <p className="text-muted-foreground mt-2">Loading users...</p>
          </div>
        ) : users.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-muted-foreground">No users found</p>
          </div>
        ) : (
          <>
            <table className="w-full">
              <thead className="bg-secondary text-left text-sm">
                <tr>
                  <th className="p-4">User</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Joined</th>
                  <th className="p-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-secondary/50">
                    <td className="p-4 font-medium">{user.fullName}</td>
                    <td className="p-4 text-muted-foreground">{user.email}</td>
                    <td className="p-4">
                      <Badge variant="secondary">{user.role}</Badge>
                    </td>
                    <td className="p-4">
                      <Badge className={getStatusColor(user.status)}>
                        {user.status}
                      </Badge>
                    </td>
                    <td className="p-4 text-muted-foreground">
                      {new Date(user.createdAt).toLocaleDateString()}
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
                              setSelectedUser(user);
                              setNewStatus(user.status);
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
                        Math.min(pagination.pages, currentPage + 1)
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
            <DialogTitle>Change User Status</DialogTitle>
            <DialogDescription>
              Update the status for {selectedUser?.fullName}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium mb-2">Current Status</p>
              <Badge className={getStatusColor(selectedUser?.status)}>
                {selectedUser?.status}
              </Badge>
            </div>

            <div>
              <p className="text-sm font-medium mb-2">New Status</p>
              <Select
                value={newStatus || ""}
                onValueChange={(value) => setNewStatus(value as UserStatus)}
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
    </div>
  );
};

export default AdminUsers;

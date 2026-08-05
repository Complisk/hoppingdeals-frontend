"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, } from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow, } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle, } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit2, Search, Shield } from "lucide-react";
import { useRoleService, type Role } from "@/services/roleService";
import { useAdminService } from "@/services/adminService";
import { AdminCreateUser } from "@/components/admin/AdminCreateUser";
import Spinner from "@/components/shared/Spinner";

const AdminUserManagement = () => {
  const { toast } = useToast();
  const { getRoles, updateAdminRole } = useRoleService();
  const { getUsers } = useAdminService();

  // States
  const [admins, setAdmins] = useState<any[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredAdmins, setFilteredAdmins] = useState<any[]>([]);

  // Dialog states
  const [createUserOpen, setCreateUserOpen] = useState(false);
  const [editRoleOpen, setEditRoleOpen] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState<any>(null);
  const [selectedRoleId, setSelectedRoleId] = useState("");
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  // Filter admins based on search
  useEffect(() => {
    const filtered = admins.filter(
      (admin) =>
        admin.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        admin.email?.toLowerCase().includes(searchQuery.toLowerCase()),
    );
    setFilteredAdmins(filtered);
  }, [searchQuery, admins]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [rolesData, adminsData] = await Promise.all([
        getRoles(),
        getUsers(1, 100, "", "admin"),
      ]);

      if (rolesData) {
        setRoles(rolesData);
      }
      if (adminsData) {
        setAdmins(adminsData.users || []);
      }
    } finally {
      setLoading(false);
    }
  };

  const openEditDialog = (admin: any) => {
    setSelectedAdmin(admin);
    setSelectedRoleId(admin.roleId || "");
    setIsSuperAdmin(admin.isSuperAdmin || false);
    setEditRoleOpen(true);
  };

  const handleUpdateRole = async () => {
    if (!selectedAdmin) return;

    if (!isSuperAdmin && !selectedRoleId) {
      toast({
        title: "Error",
        description: "Please select a role or make this user a Super Admin",
        variant: "destructive",
      });
      return;
    }

    try {
      setUpdating(true);
      const result = await updateAdminRole(
        selectedAdmin.id,
        isSuperAdmin ? undefined : selectedRoleId,
        isSuperAdmin,
      );

      if (result) {
        setEditRoleOpen(false);
        setSelectedAdmin(null);
        setSelectedRoleId("");
        setIsSuperAdmin(false);
        await loadData();
      }
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Spinner className="h-8 w-8 animate-spin text-muted-foreground"  />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Admin Users
            </CardTitle>
            <CardDescription>
              Manage admin users and assign roles with permissions
            </CardDescription>
          </div>
          <Button onClick={() => setCreateUserOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Create Admin
          </Button>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Admin Users Table */}
          {filteredAdmins.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">
                {searchQuery
                  ? "No admins found matching your search"
                  : "No admin users created yet"}
              </p>
              <Button onClick={() => setCreateUserOpen(true)}>
                Create Your First Admin
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Permissions</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAdmins.map((admin) => (
                  <TableRow key={admin.id}>
                    <TableCell className="font-medium">
                      {admin.fullName}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {admin.email}
                    </TableCell>
                    <TableCell>
                      {admin.isSuperAdmin ? (
                        <Badge className="bg-yellow-600">Super Admin</Badge>
                      ) : (
                        <Badge variant="outline">
                          {admin.roleId
                            ? roles.find((r) => r.id === admin.roleId)?.name ||
                              "No Role"
                            : "No Role"}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {admin.permissions &&
                        Object.keys(admin.permissions).length > 0 ? (
                          Object.entries(admin.permissions).map(
                            ([module, actions]: [string, any]) =>
                              Array.isArray(actions) &&
                              actions.map((action) => (
                                <Badge
                                  key={`${module}-${action}`}
                                  variant="secondary"
                                  className="text-xs"
                                >
                                  {module}:{action}
                                </Badge>
                              )),
                          )
                        ) : (
                          <span className="text-xs text-muted-foreground">
                            -
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          admin.status === "active" ? "default" : "outline"
                        }
                      >
                        {admin.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditDialog(admin)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Create Admin Dialog */}
      <AdminCreateUser
        open={createUserOpen}
        onOpenChange={setCreateUserOpen}
        onSuccess={() => {
          loadData();
        }}
      />

      {/* Edit Admin Role Dialog */}
      <Dialog open={editRoleOpen} onOpenChange={setEditRoleOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Admin Role</DialogTitle>
            <DialogDescription>
              Update role and permissions for {selectedAdmin?.fullName}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Super Admin Checkbox */}
            <div className="flex items-center space-x-3 rounded-lg border p-4">
              <Checkbox
                id="super-admin"
                checked={isSuperAdmin}
                onCheckedChange={(checked) => setIsSuperAdmin(!!checked)}
              />
              <div className="space-y-1 leading-none">
                <label
                  htmlFor="super-admin"
                  className="text-sm font-medium cursor-pointer"
                >
                  Super Admin
                </label>
                <p className="text-xs text-muted-foreground">
                  Has all permissions across the system
                </p>
              </div>
            </div>

            {/* Role Selection (disabled if Super Admin) */}
            {!isSuperAdmin && (
              <div>
                <label className="text-sm font-medium block mb-2">
                  Select Role
                </label>
                <Select
                  value={selectedRoleId}
                  onValueChange={setSelectedRoleId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a role" />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((role) => (
                      <SelectItem key={role.id} value={role.id}>
                        {role.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Show current permissions if available */}
            {isSuperAdmin ? (
              <div className="text-sm text-muted-foreground">
                Super Admin has all permissions
              </div>
            ) : selectedRoleId && roles.find((r) => r.id === selectedRoleId) ? (
              <div className="space-y-2">
                <p className="text-sm font-medium">Permissions:</p>
                <div className="flex flex-wrap gap-1">
                  {Object.entries(
                    roles.find((r) => r.id === selectedRoleId)?.permissions ||
                      {},
                  ).map(
                    ([module, actions]: [string, any]) =>
                      Array.isArray(actions) &&
                      actions.map((action) => (
                        <Badge
                          key={`${module}-${action}`}
                          variant="secondary"
                          className="text-xs"
                        >
                          {module}:{action}
                        </Badge>
                      )),
                  )}
                </div>
              </div>
            ) : null}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditRoleOpen(false)}
              disabled={updating}
            >
              Cancel
            </Button>
            <Button onClick={handleUpdateRole} disabled={updating}>
              {updating && <Spinner className="mr-2 h-4 w-4 animate-spin"  />}
              Update Role
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminUserManagement;

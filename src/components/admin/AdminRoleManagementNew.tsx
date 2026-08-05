"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle, } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow, } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit2, Trash2, Shield, X, User } from "lucide-react";
import {
  useRoleService,
  type PermissionMap,
  type Role,
} from "@/services/roleService";
import { useAdminService } from "@/services/adminService";
import Spinner from "@/components/shared/Spinner";

const AdminRoleManagementNew = () => {
  const { toast } = useToast();
  const {
    getAvailablePermissions,
    getRoles,
    createRole,
    updateRole,
    deleteRole,
  } = useRoleService();
  const { getUsers } = useAdminService();

  // States for permissions
  const [availablePermissions, setAvailablePermissions] =
    useState<PermissionMap>({});
  const [roles, setRoles] = useState<Role[]>([]);
  const [admins, setAdmins] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Dialog states
  const [createRoleOpen, setCreateRoleOpen] = useState(false);
  const [editRoleOpen, setEditRoleOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);

  // Form states
  const [roleName, setRoleName] = useState("");
  const [selectedPermissions, setSelectedPermissions] = useState<
    Record<string, string[]>
  >({});
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [permissionsData, rolesData, adminsData] = await Promise.all([
        getAvailablePermissions(),
        getRoles(),
        getUsers(1, 100, "", "admin"),
      ]);

      if (permissionsData) {
        setAvailablePermissions(permissionsData);
      }
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

  const handleCreateRole = async () => {
    if (!roleName.trim()) {
      toast({
        title: "Error",
        description: "Role name is required",
        variant: "destructive",
      });
      return;
    }

    if (Object.keys(selectedPermissions).length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one permission",
        variant: "destructive",
      });
      return;
    }

    try {
      setCreating(true);
      const result = await createRole(roleName, selectedPermissions);
      if (result) {
        setRoleName("");
        setSelectedPermissions({});
        setCreateRoleOpen(false);
        await loadData();
      }
    } finally {
      setCreating(false);
    }
  };

  const handleEditRole = async () => {
    if (!editingRole) return;

    if (editingRole.isSystem) {
      toast({
        title: "Error",
        description: "System roles cannot be edited",
        variant: "destructive",
      });
      return;
    }

    try {
      setCreating(true);
      const result = await updateRole(editingRole.id, selectedPermissions);
      if (result) {
        setEditingRole(null);
        setSelectedPermissions({});
        setEditRoleOpen(false);
        await loadData();
      }
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteRole = async (roleId: string, isSystem: boolean) => {
    if (isSystem) {
      toast({
        title: "Error",
        description: "System roles cannot be deleted",
        variant: "destructive",
      });
      return;
    }

    if (
      confirm(
        "Are you sure you want to delete this role? This action cannot be undone.",
      )
    ) {
      try {
        const success = await deleteRole(roleId);
        if (success) {
          await loadData();
        }
      } catch (error) {
        console.error("Delete role error:", error);
      }
    }
  };

  const openEditDialog = (role: Role) => {
    setEditingRole(role);
    setSelectedPermissions(role.permissions || {});
    setEditRoleOpen(true);
  };

  const togglePermission = (module: string, action: string) => {
    const updated = { ...selectedPermissions };

    if (!updated[module]) {
      updated[module] = [];
    }

    const index = updated[module].indexOf(action);
    if (index > -1) {
      updated[module].splice(index, 1);
    } else {
      updated[module].push(action);
    }

    if (updated[module].length === 0) {
      delete updated[module];
    }

    setSelectedPermissions(updated);
  };

  const isPermissionSelected = (module: string, action: string) => {
    return selectedPermissions[module]?.includes(action) || false;
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
      <Tabs defaultValue="roles" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="roles">
            <Shield className="mr-2 h-4 w-4" />
            Roles & Permissions
          </TabsTrigger>
          <TabsTrigger value="admins">
            <User className="mr-2 h-4 w-4" />
            Admin Users ({admins.length})
          </TabsTrigger>
        </TabsList>

        {/* Roles Tab */}
        <TabsContent value="roles" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Role Management</CardTitle>
                <CardDescription>
                  Create and manage roles with custom permissions
                </CardDescription>
              </div>
              <Dialog open={createRoleOpen} onOpenChange={setCreateRoleOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Role
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-96 overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Create New Role</DialogTitle>
                    <DialogDescription>
                      Define a new role with specific permissions
                    </DialogDescription>
                  </DialogHeader>

                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">Role Name</label>
                      <Input
                        placeholder="e.g., Content Manager"
                        value={roleName}
                        onChange={(e) => setRoleName(e.target.value)}
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium block mb-3">
                        Permissions
                      </label>
                      <div className="space-y-3 border rounded-lg p-4 max-h-60 overflow-y-auto">
                        {Object.entries(availablePermissions).map(
                          ([module, actions]) => (
                            <div key={module} className="space-y-2">
                              <h4 className="font-medium text-sm capitalize">
                                {module}
                              </h4>
                              <div className="space-y-2 ml-4">
                                {actions.map((action) => (
                                  <div
                                    key={action}
                                    className="flex items-center"
                                  >
                                    <Checkbox
                                      id={`create-${module}-${action}`}
                                      checked={isPermissionSelected(
                                        module,
                                        action,
                                      )}
                                      onCheckedChange={() =>
                                        togglePermission(module, action)
                                      }
                                    />
                                    <label
                                      htmlFor={`create-${module}-${action}`}
                                      className="ml-2 text-sm cursor-pointer capitalize"
                                    >
                                      {action}
                                    </label>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ),
                        )}
                      </div>
                    </div>
                  </div>

                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setCreateRoleOpen(false)}
                      disabled={creating}
                    >
                      Cancel
                    </Button>
                    <Button onClick={handleCreateRole} disabled={creating}>
                      {creating && (
                        <Spinner className="mr-2 h-4 w-4 animate-spin"  />
                      )}
                      Create Role
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardHeader>

            <CardContent>
              <div className="space-y-4">
                {roles.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    No roles found. Create one to get started.
                  </p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Permissions</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {roles.map((role) => (
                        <TableRow key={role.id}>
                          <TableCell className="font-medium">
                            {role.name}
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {Object.entries(role.permissions || {}).map(
                                ([module, actions]) =>
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
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                role.isSystem ? "destructive" : "outline"
                              }
                            >
                              {role.isSystem ? "System" : "Custom"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            {!role.isSystem && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => openEditDialog(role)}
                                >
                                  <Edit2 className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    handleDeleteRole(role.id, role.isSystem)
                                  }
                                >
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Edit Role Dialog */}
          <Dialog open={editRoleOpen} onOpenChange={setEditRoleOpen}>
            <DialogContent className="max-w-2xl max-h-96 overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Edit Role - {editingRole?.name}</DialogTitle>
                <DialogDescription>
                  Update permissions for this role
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium block mb-3">
                    Permissions
                  </label>
                  <div className="space-y-3 border rounded-lg p-4 max-h-60 overflow-y-auto">
                    {Object.entries(availablePermissions).map(
                      ([module, actions]) => (
                        <div key={module} className="space-y-2">
                          <h4 className="font-medium text-sm capitalize">
                            {module}
                          </h4>
                          <div className="space-y-2 ml-4">
                            {actions.map((action) => (
                              <div key={action} className="flex items-center">
                                <Checkbox
                                  id={`edit-${module}-${action}`}
                                  checked={isPermissionSelected(module, action)}
                                  onCheckedChange={() =>
                                    togglePermission(module, action)
                                  }
                                />
                                <label
                                  htmlFor={`edit-${module}-${action}`}
                                  className="ml-2 text-sm cursor-pointer capitalize"
                                >
                                  {action}
                                </label>
                              </div>
                            ))}
                          </div>
                        </div>
                      ),
                    )}
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setEditRoleOpen(false)}
                  disabled={creating}
                >
                  Cancel
                </Button>
                <Button onClick={handleEditRole} disabled={creating}>
                  {creating && (
                    <Spinner className="mr-2 h-4 w-4 animate-spin"  />
                  )}
                  Save Changes
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </TabsContent>

        {/* Admins Tab */}
        <TabsContent value="admins">
          <Card>
            <CardHeader>
              <CardTitle>Admin Users</CardTitle>
              <CardDescription>
                Manage admin users and their roles
              </CardDescription>
            </CardHeader>
            <CardContent>
              {admins.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No admin users found
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {admins.map((admin) => (
                      <TableRow key={admin.id}>
                        <TableCell className="font-medium">
                          {admin.fullName}
                        </TableCell>
                        <TableCell>{admin.email}</TableCell>
                        <TableCell>
                          {admin.isSuperAdmin ? (
                            <Badge>Super Admin</Badge>
                          ) : (
                            <Badge variant="outline">Admin</Badge>
                          )}
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
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminRoleManagementNew;

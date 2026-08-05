"use client";
import { useEffect, useState } from "react";
import { useAppSelector } from "@/hooks/use-redux";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import adminService from "@/services/adminService";
import { Plus, Edit2, Trash2, Shield, Users, X } from "lucide-react";

interface Admin {
  id: string;
  fullName: string;
  email: string;
  isSuperAdmin: boolean;
  status: string;
  Roles?: Array<{ id: string; name: string }>;
}

interface Role {
  id: string;
  name: string;
  description: string;
  isSystem: boolean;
  Permissions: Array<{
    id: string;
    name: string;
    module: string;
    action: string;
  }>;
}

interface Permission {
  id: string;
  name: string;
  module: string;
  action: string;
}

const AdminRoleManagement = () => {
  const { userToken } = useAppSelector((state) => state.auth);
  const { toast } = useToast();

  const [admins, setAdmins] = useState<Admin[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState<Admin | null>(null);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [createAdminOpen, setCreateAdminOpen] = useState(false);
  const [editRolesOpen, setEditRolesOpen] = useState(false);
  const [createRoleOpen, setCreateRoleOpen] = useState(false);
  const [editRoleOpen, setEditRoleOpen] = useState(false);

  // Form states
  const [adminForm, setAdminForm] = useState({
    fullName: "",
    email: "",
    password: "",
    isSuperAdmin: false,
    roleIds: [] as string[],
  });

  const [roleForm, setRoleForm] = useState({
    name: "",
    description: "",
    permissionIds: [] as string[],
  });

  useEffect(() => {
    if (userToken) {
      loadData();
    }
  }, [userToken]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [adminsRes, rolesRes, permissionsRes] = await Promise.all([
        adminService.getAllAdminUsers(),
        adminService.getAllRoles(),
        adminService.getAllPermissions(),
      ]);

      setAdmins(adminsRes);
      setRoles(rolesRes);
      setPermissions(
        Array.isArray(permissionsRes)
          ? permissionsRes
          : Object.values(permissionsRes).flat()
      );
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAdmin = async () => {
    if (!adminForm.fullName || !adminForm.email || !adminForm.password) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await adminService.createAdminUser({
        fullName: adminForm.fullName,
        email: adminForm.email,
        password: adminForm.password,
        isSuperAdmin: adminForm.isSuperAdmin,
        roleIds: adminForm.roleIds,
      });

      setAdmins([response.user, ...admins]);
      setAdminForm({
        fullName: "",
        email: "",
        password: "",
        isSuperAdmin: false,
        roleIds: [],
      });
      setCreateAdminOpen(false);

      toast({
        title: "Success",
        description: "Admin user created successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create admin",
        variant: "destructive",
      });
    }
  };

  const handleCreateRole = async () => {
    if (!roleForm.name) {
      toast({
        title: "Error",
        description: "Role name is required",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await adminService.createRole({
        name: roleForm.name,
        description: roleForm.description,
        permissionIds: roleForm.permissionIds,
      });

      setRoles([response.role, ...roles]);
      setRoleForm({ name: "", description: "", permissionIds: [] });
      setCreateRoleOpen(false);

      toast({
        title: "Success",
        description: "Role created successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create role",
        variant: "destructive",
      });
    }
  };

  const handleUpdateRole = async () => {
    if (!selectedRole || !roleForm.name) {
      toast({
        title: "Error",
        description: "Role name is required",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await adminService.updateRole(selectedRole.id, {
        name: roleForm.name,
        description: roleForm.description,
        permissionIds: roleForm.permissionIds,
      });

      setRoles(
        roles.map((r) => (r.id === selectedRole.id ? response.role : r))
      );
      setRoleForm({ name: "", description: "", permissionIds: [] });
      setEditRoleOpen(false);
      setSelectedRole(null);

      toast({
        title: "Success",
        description: "Role updated successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update role",
        variant: "destructive",
      });
    }
  };

  const handleDeleteRole = async (roleId: string) => {
    if (!confirm("Are you sure you want to delete this role?")) {
      return;
    }

    try {
      await adminService.deleteRole(roleId);
      setRoles(roles.filter((r) => r.id !== roleId));

      toast({
        title: "Success",
        description: "Role deleted successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete role",
        variant: "destructive",
      });
    }
  };

  const handleUpdateUserRoles = async (userId: string, roleIds: string[]) => {
    try {
      const response = await adminService.updateUserRoles(userId, roleIds);
      setAdmins(
        admins.map((admin) =>
          admin.id === userId ? { ...admin, Roles: response.user.Roles } : admin
        )
      );
      setEditRolesOpen(false);
      toast({
        title: "Success",
        description: "User roles updated successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update roles",
        variant: "destructive",
      });
    }
  };

  const getPermissionsByModule = (module: string) => {
    return permissions.filter((p) => p.module === module);
  };

  const openEditRole = (role: Role) => {
    setSelectedRole(role);
    setRoleForm({
      name: role.name,
      description: role.description,
      permissionIds: role.Permissions.map((p) => p.id),
    });
    setEditRoleOpen(true);
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Role Management</h1>
          <p className="text-muted-foreground">
            Manage admin users, roles, and permissions
          </p>
        </div>
        <Dialog open={createAdminOpen} onOpenChange={setCreateAdminOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus size={20} />
              Create Admin
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Admin User</DialogTitle>
              <DialogDescription>
                Create a new admin user and assign roles and permissions
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Full Name</label>
                <Input
                  placeholder="John Doe"
                  value={adminForm.fullName}
                  onChange={(e) =>
                    setAdminForm({ ...adminForm, fullName: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="text-sm font-medium">Email</label>
                <Input
                  type="email"
                  placeholder="john@example.com"
                  value={adminForm.email}
                  onChange={(e) =>
                    setAdminForm({ ...adminForm, email: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="text-sm font-medium">Password</label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={adminForm.password}
                  onChange={(e) =>
                    setAdminForm({ ...adminForm, password: e.target.value })
                  }
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="superadmin"
                  checked={adminForm.isSuperAdmin}
                  onChange={(e) =>
                    setAdminForm({
                      ...adminForm,
                      isSuperAdmin: e.target.checked,
                    })
                  }
                  className="rounded border-gray-300"
                />
                <label htmlFor="superadmin" className="text-sm font-medium">
                  Super Admin (Has all permissions)
                </label>
              </div>

              {!adminForm.isSuperAdmin && (
                <div>
                  <label className="text-sm font-medium">Assign Roles</label>
                  <div className="space-y-2 mt-2">
                    {roles.map((role) => (
                      <div key={role.id} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id={role.id}
                          checked={adminForm.roleIds.includes(role.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setAdminForm({
                                ...adminForm,
                                roleIds: [...adminForm.roleIds, role.id],
                              });
                            } else {
                              setAdminForm({
                                ...adminForm,
                                roleIds: adminForm.roleIds.filter(
                                  (id) => id !== role.id
                                ),
                              });
                            }
                          }}
                          className="rounded border-gray-300"
                        />
                        <label htmlFor={role.id} className="text-sm">
                          {role.name}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-2 justify-end pt-4">
                <Button
                  variant="outline"
                  onClick={() => setCreateAdminOpen(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleCreateAdmin} disabled={loading}>
                  {loading ? "Creating..." : "Create Admin"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="admins" className="space-y-4">
        <TabsList>
          <TabsTrigger value="admins" className="gap-2">
            <Users size={16} />
            Admin Users
          </TabsTrigger>
          <TabsTrigger value="roles" className="gap-2">
            <Shield size={16} />
            Roles & Permissions
          </TabsTrigger>
        </TabsList>

        <TabsContent value="admins">
          <Card>
            <CardHeader>
              <CardTitle>Admin Users</CardTitle>
              <CardDescription>
                Manage admin users and their roles
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">Loading...</div>
              ) : admins.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No admin users found
                </div>
              ) : (
                <div className="space-y-4">
                  {admins.map((admin) => (
                    <div
                      key={admin.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex-1">
                        <h3 className="font-semibold">{admin.fullName}</h3>
                        <p className="text-sm text-muted-foreground">
                          {admin.email}
                        </p>
                        <div className="flex gap-2 mt-2">
                          {admin.isSuperAdmin && <Badge>Super Admin</Badge>}
                          {admin.Roles &&
                            admin.Roles.map((role) => (
                              <Badge key={role.id} variant="outline">
                                {role.name}
                              </Badge>
                            ))}
                        </div>
                      </div>
                      {!admin.isSuperAdmin && (
                        <Dialog
                          open={editRolesOpen && selectedAdmin?.id === admin.id}
                          onOpenChange={(open) => {
                            if (open) setSelectedAdmin(admin);
                            setEditRolesOpen(open);
                          }}
                        >
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedAdmin(admin)}
                            >
                              <Edit2 size={16} />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Edit Admin Roles</DialogTitle>
                              <DialogDescription>
                                Update roles for {selectedAdmin?.fullName}
                              </DialogDescription>
                            </DialogHeader>

                            <div className="space-y-3">
                              {roles.map((role) => (
                                <div
                                  key={role.id}
                                  className="flex items-center gap-2"
                                >
                                  <input
                                    type="checkbox"
                                    id={`role-${role.id}`}
                                    defaultChecked={selectedAdmin?.Roles?.some(
                                      (r) => r.id === role.id
                                    )}
                                    onChange={(e) => {
                                      if (selectedAdmin) {
                                        if (e.target.checked) {
                                          setSelectedAdmin({
                                            ...selectedAdmin,
                                            Roles: [
                                              ...(selectedAdmin.Roles || []),
                                              role,
                                            ],
                                          });
                                        } else {
                                          setSelectedAdmin({
                                            ...selectedAdmin,
                                            Roles: selectedAdmin.Roles?.filter(
                                              (r) => r.id !== role.id
                                            ),
                                          });
                                        }
                                      }
                                    }}
                                    className="rounded border-gray-300"
                                  />
                                  <label
                                    htmlFor={`role-${role.id}`}
                                    className="text-sm font-medium flex-1"
                                  >
                                    {role.name}
                                    <p className="text-xs text-muted-foreground">
                                      {role.description}
                                    </p>
                                  </label>
                                </div>
                              ))}
                            </div>

                            <div className="flex gap-2 justify-end pt-4">
                              <Button
                                variant="outline"
                                onClick={() => setEditRolesOpen(false)}
                              >
                                Cancel
                              </Button>
                              <Button
                                onClick={() =>
                                  handleUpdateUserRoles(
                                    selectedAdmin!.id,
                                    selectedAdmin?.Roles?.map((r) => r.id) || []
                                  )
                                }
                              >
                                Save Changes
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="roles">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Roles and Permissions</CardTitle>
                <CardDescription>
                  Create and manage roles with custom permissions
                </CardDescription>
              </div>
              <Dialog open={createRoleOpen} onOpenChange={setCreateRoleOpen}>
                <DialogTrigger asChild>
                  <Button className="gap-2">
                    <Plus size={20} />
                    Create Role
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Create New Role</DialogTitle>
                    <DialogDescription>
                      Create a new role and assign permissions
                    </DialogDescription>
                  </DialogHeader>

                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">Role Name</label>
                      <Input
                        placeholder="e.g., Moderator, Reviewer"
                        value={roleForm.name}
                        onChange={(e) =>
                          setRoleForm({ ...roleForm, name: e.target.value })
                        }
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium">Description</label>
                      <Input
                        placeholder="Role description"
                        value={roleForm.description}
                        onChange={(e) =>
                          setRoleForm({
                            ...roleForm,
                            description: e.target.value,
                          })
                        }
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        Permissions
                      </label>
                      <div className="space-y-3 max-h-64 overflow-y-auto">
                        {["users", "businesses", "promotions", "admin"].map(
                          (module) => (
                            <div key={module}>
                              <p className="text-xs font-semibold text-muted-foreground mb-2">
                                {module.toUpperCase()}
                              </p>
                              <div className="space-y-2 ml-2">
                                {getPermissionsByModule(module).map((perm) => (
                                  <div
                                    key={perm.id}
                                    className="flex items-center gap-2"
                                  >
                                    <input
                                      type="checkbox"
                                      id={`perm-${perm.id}`}
                                      checked={roleForm.permissionIds.includes(
                                        perm.id
                                      )}
                                      onChange={(e) => {
                                        if (e.target.checked) {
                                          setRoleForm({
                                            ...roleForm,
                                            permissionIds: [
                                              ...roleForm.permissionIds,
                                              perm.id,
                                            ],
                                          });
                                        } else {
                                          setRoleForm({
                                            ...roleForm,
                                            permissionIds:
                                              roleForm.permissionIds.filter(
                                                (id) => id !== perm.id
                                              ),
                                          });
                                        }
                                      }}
                                      className="rounded border-gray-300"
                                    />
                                    <label
                                      htmlFor={`perm-${perm.id}`}
                                      className="text-sm"
                                    >
                                      {perm.action}
                                    </label>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2 justify-end pt-4">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setCreateRoleOpen(false);
                          setRoleForm({
                            name: "",
                            description: "",
                            permissionIds: [],
                          });
                        }}
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleCreateRole}
                        disabled={loading || !roleForm.name}
                      >
                        {loading ? "Creating..." : "Create Role"}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">Loading...</div>
              ) : roles.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No roles found
                </div>
              ) : (
                <div className="space-y-4">
                  {roles.map((role) => (
                    <div
                      key={role.id}
                      className="border rounded-lg p-4 space-y-3"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold flex items-center gap-2">
                            <Badge
                              variant={role.isSystem ? "default" : "secondary"}
                            >
                              {role.name}
                            </Badge>
                            {role.isSystem && (
                              <span className="text-xs text-muted-foreground">
                                (System)
                              </span>
                            )}
                          </h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            {role.description}
                          </p>
                        </div>
                        {!role.isSystem && (
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openEditRole(role)}
                            >
                              <Edit2 size={16} />
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDeleteRole(role.id)}
                            >
                              <Trash2 size={16} />
                            </Button>
                          </div>
                        )}
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {["users", "businesses", "promotions", "admin"].map(
                          (module) => {
                            const modulePerms = role.Permissions.filter(
                              (p) => p.module === module
                            );
                            return (
                              <div key={module}>
                                <p className="text-xs font-semibold text-muted-foreground mb-2">
                                  {module.toUpperCase()}
                                </p>
                                <div className="space-y-1">
                                  {modulePerms.length > 0 ? (
                                    modulePerms.map((perm) => (
                                      <Badge
                                        key={perm.id}
                                        variant="outline"
                                        className="text-xs"
                                      >
                                        {perm.action}
                                      </Badge>
                                    ))
                                  ) : (
                                    <span className="text-xs text-muted-foreground">
                                      No permissions
                                    </span>
                                  )}
                                </div>
                              </div>
                            );
                          }
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Edit Role Dialog */}
          <Dialog open={editRoleOpen} onOpenChange={setEditRoleOpen}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Edit Role</DialogTitle>
                <DialogDescription>
                  Update role details and permissions
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Role Name</label>
                  <Input
                    placeholder="e.g., Moderator, Reviewer"
                    value={roleForm.name}
                    onChange={(e) =>
                      setRoleForm({ ...roleForm, name: e.target.value })
                    }
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Description</label>
                  <Input
                    placeholder="Role description"
                    value={roleForm.description}
                    onChange={(e) =>
                      setRoleForm({
                        ...roleForm,
                        description: e.target.value,
                      })
                    }
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Permissions
                  </label>
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {["users", "businesses", "promotions", "admin"].map(
                      (module) => (
                        <div key={module}>
                          <p className="text-xs font-semibold text-muted-foreground mb-2">
                            {module.toUpperCase()}
                          </p>
                          <div className="space-y-2 ml-2">
                            {getPermissionsByModule(module).map((perm) => (
                              <div
                                key={perm.id}
                                className="flex items-center gap-2"
                              >
                                <input
                                  type="checkbox"
                                  id={`edit-perm-${perm.id}`}
                                  checked={roleForm.permissionIds.includes(
                                    perm.id
                                  )}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setRoleForm({
                                        ...roleForm,
                                        permissionIds: [
                                          ...roleForm.permissionIds,
                                          perm.id,
                                        ],
                                      });
                                    } else {
                                      setRoleForm({
                                        ...roleForm,
                                        permissionIds:
                                          roleForm.permissionIds.filter(
                                            (id) => id !== perm.id
                                          ),
                                      });
                                    }
                                  }}
                                  className="rounded border-gray-300"
                                />
                                <label
                                  htmlFor={`edit-perm-${perm.id}`}
                                  className="text-sm"
                                >
                                  {perm.action}
                                </label>
                              </div>
                            ))}
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </div>

                <div className="flex gap-2 justify-end pt-4">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setEditRoleOpen(false);
                      setSelectedRole(null);
                      setRoleForm({
                        name: "",
                        description: "",
                        permissionIds: [],
                      });
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleUpdateRole}
                    disabled={loading || !roleForm.name}
                  >
                    {loading ? "Updating..." : "Update Role"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminRoleManagement;

interface Admin {
  id: string;
  fullName: string;
  email: string;
  isSuperAdmin: boolean;
  status: string;
  Roles?: Array<{ id: string; name: string }>;
}

interface Role {
  id: string;
  name: string;
  description: string;
  Permissions: Array<{
    id: string;
    name: string;
    module: string;
    action: string;
  }>;
}

interface Permission {
  id: string;
  name: string;
  module: string;
  action: string;
}

// const AdminRoleManagement = () => {
//   const { userToken } = useAppSelector((state) => state.auth);
//   const { toast } = useToast();

//   const [admins, setAdmins] = useState<Admin[]>([]);
//   const [roles, setRoles] = useState<Role[]>([]);
//   const [permissions, setPermissions] = useState<{
//     [key: string]: Permission[];
//   }>({});
//   const [loading, setLoading] = useState(false);
//   const [selectedAdmin, setSelectedAdmin] = useState<Admin | null>(null);
//   const [createAdminOpen, setCreateAdminOpen] = useState(false);
//   const [editRolesOpen, setEditRolesOpen] = useState(false);

//   // Form states
//   const [adminForm, setAdminForm] = useState({
//     fullName: "",
//     email: "",
//     password: "",
//     isSuperAdmin: false,
//     roleIds: [] as string[],
//   });

//   useEffect(() => {
//     if (userToken) {
//       loadData();
//     }
//   }, [userToken]);

//   const loadData = async () => {
//     setLoading(true);
//     try {
//       const [adminsRes, rolesRes, permissionsRes] = await Promise.all([
//         adminService.getAllAdminUsers(),
//         adminService.getAllRoles(),
//         adminService.getAllPermissions(),
//       ]);

//       setAdmins(adminsRes);
//       setRoles(rolesRes);
//       setPermissions(permissionsRes);
//     } catch (error: any) {
//       toast({
//         title: "Error",
//         description: error.message || "Failed to load data",
//         variant: "destructive",
//       });
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleCreateAdmin = async () => {
//     if (!adminForm.fullName || !adminForm.email || !adminForm.password) {
//       toast({
//         title: "Error",
//         description: "Please fill in all required fields",
//         variant: "destructive",
//       });
//       return;
//     }

//     try {
//       const response = await adminService.createAdminUser({
//         fullName: adminForm.fullName,
//         email: adminForm.email,
//         password: adminForm.password,
//         isSuperAdmin: adminForm.isSuperAdmin,
//         roleIds: adminForm.roleIds,
//       });

//       setAdmins([response.user, ...admins]);
//       setAdminForm({
//         fullName: "",
//         email: "",
//         password: "",
//         isSuperAdmin: false,
//         roleIds: [],
//       });
//       setCreateAdminOpen(false);

//       toast({
//         title: "Success",
//         description: "Admin user created successfully",
//       });
//     } catch (error: any) {
//       toast({
//         title: "Error",
//         description: error.message || "Failed to create admin",
//         variant: "destructive",
//       });
//     }
//   };

//   const handleUpdateUserRoles = async (userId: string, roleIds: string[]) => {
//     try {
//       const response = await adminService.updateUserRoles(userId, roleIds);
//       setAdmins(
//         admins.map((admin) =>
//           admin.id === userId ? { ...admin, Roles: response.user.Roles } : admin
//         )
//       );
//       setEditRolesOpen(false);
//       toast({
//         title: "Success",
//         description: "User roles updated successfully",
//       });
//     } catch (error: any) {
//       toast({
//         title: "Error",
//         description: error.message || "Failed to update roles",
//         variant: "destructive",
//       });
//     }
//   };

//   const renderPermissionsGrid = (module: string) => {
//     const modulePermissions = permissions[module] || [];
//     return (
//       <div className="grid grid-cols-2 gap-2">
//         {modulePermissions.map((perm) => (
//           <Badge key={perm.id} variant="outline" className="text-xs">
//             {perm.action}
//           </Badge>
//         ))}
//       </div>
//     );
//   };

//   return (
//     <div className="space-y-6 p-6">
//       <div className="flex justify-between items-center">
//         <div>
//           <h1 className="text-3xl font-bold">Role Management</h1>
//           <p className="text-muted-foreground">
//             Manage admin users and their permissions
//           </p>
//         </div>
//         <Dialog open={createAdminOpen} onOpenChange={setCreateAdminOpen}>
//           <DialogTrigger asChild>
//             <Button className="gap-2">
//               <Plus size={20} />
//               Create Admin
//             </Button>
//           </DialogTrigger>
//           <DialogContent>
//             <DialogHeader>
//               <DialogTitle>Create New Admin User</DialogTitle>
//               <DialogDescription>
//                 Create a new admin user and assign roles and permissions
//               </DialogDescription>
//             </DialogHeader>

//             <div className="space-y-4">
//               <div>
//                 <label className="text-sm font-medium">Full Name</label>
//                 <Input
//                   placeholder="John Doe"
//                   value={adminForm.fullName}
//                   onChange={(e) =>
//                     setAdminForm({ ...adminForm, fullName: e.target.value })
//                   }
//                 />
//               </div>

//               <div>
//                 <label className="text-sm font-medium">Email</label>
//                 <Input
//                   type="email"
//                   placeholder="john@example.com"
//                   value={adminForm.email}
//                   onChange={(e) =>
//                     setAdminForm({ ...adminForm, email: e.target.value })
//                   }
//                 />
//               </div>

//               <div>
//                 <label className="text-sm font-medium">Password</label>
//                 <Input
//                   type="password"
//                   placeholder="••••••••"
//                   value={adminForm.password}
//                   onChange={(e) =>
//                     setAdminForm({ ...adminForm, password: e.target.value })
//                   }
//                 />
//               </div>

//               <div className="flex items-center gap-2">
//                 <input
//                   type="checkbox"
//                   id="superadmin"
//                   checked={adminForm.isSuperAdmin}
//                   onChange={(e) =>
//                     setAdminForm({
//                       ...adminForm,
//                       isSuperAdmin: e.target.checked,
//                     })
//                   }
//                   className="rounded border-gray-300"
//                 />
//                 <label htmlFor="superadmin" className="text-sm font-medium">
//                   Super Admin (Has all permissions)
//                 </label>
//               </div>

//               {!adminForm.isSuperAdmin && (
//                 <div>
//                   <label className="text-sm font-medium">Assign Roles</label>
//                   <div className="space-y-2 mt-2">
//                     {roles.map((role) => (
//                       <div key={role.id} className="flex items-center gap-2">
//                         <input
//                           type="checkbox"
//                           id={role.id}
//                           checked={adminForm.roleIds.includes(role.id)}
//                           onChange={(e) => {
//                             if (e.target.checked) {
//                               setAdminForm({
//                                 ...adminForm,
//                                 roleIds: [...adminForm.roleIds, role.id],
//                               });
//                             } else {
//                               setAdminForm({
//                                 ...adminForm,
//                                 roleIds: adminForm.roleIds.filter(
//                                   (id) => id !== role.id
//                                 ),
//                               });
//                             }
//                           }}
//                           className="rounded border-gray-300"
//                         />
//                         <label htmlFor={role.id} className="text-sm">
//                           {role.name}
//                         </label>
//                       </div>
//                     ))}
//                   </div>
//                 </div>
//               )}

//               <div className="flex gap-2 justify-end pt-4">
//                 <Button
//                   variant="outline"
//                   onClick={() => setCreateAdminOpen(false)}
//                 >
//                   Cancel
//                 </Button>
//                 <Button onClick={handleCreateAdmin} disabled={loading}>
//                   {loading ? "Creating..." : "Create Admin"}
//                 </Button>
//               </div>
//             </div>
//           </DialogContent>
//         </Dialog>
//       </div>

//       <Tabs defaultValue="admins" className="space-y-4">
//         <TabsList>
//           <TabsTrigger value="admins" className="gap-2">
//             <Users size={16} />
//             Admin Users
//           </TabsTrigger>
//           <TabsTrigger value="roles" className="gap-2">
//             <Shield size={16} />
//             Roles & Permissions
//           </TabsTrigger>
//         </TabsList>

//         <TabsContent value="admins">
//           <Card>
//             <CardHeader>
//               <CardTitle>Admin Users</CardTitle>
//               <CardDescription>
//                 Manage admin users and their roles
//               </CardDescription>
//             </CardHeader>
//             <CardContent>
//               {loading ? (
//                 <div className="text-center py-8">Loading...</div>
//               ) : admins.length === 0 ? (
//                 <div className="text-center py-8 text-muted-foreground">
//                   No admin users found
//                 </div>
//               ) : (
//                 <div className="space-y-4">
//                   {admins.map((admin) => (
//                     <div
//                       key={admin.id}
//                       className="flex items-center justify-between p-4 border rounded-lg"
//                     >
//                       <div className="flex-1">
//                         <h3 className="font-semibold">{admin.fullName}</h3>
//                         <p className="text-sm text-muted-foreground">
//                           {admin.email}
//                         </p>
//                         <div className="flex gap-2 mt-2">
//                           {admin.isSuperAdmin && <Badge>Super Admin</Badge>}
//                           {admin.Roles &&
//                             admin.Roles.map((role) => (
//                               <Badge key={role.id} variant="outline">
//                                 {role.name}
//                               </Badge>
//                             ))}
//                         </div>
//                       </div>
//                       {!admin.isSuperAdmin && (
//                         <Dialog
//                           open={editRolesOpen && selectedAdmin?.id === admin.id}
//                           onOpenChange={(open) => {
//                             if (open) setSelectedAdmin(admin);
//                             setEditRolesOpen(open);
//                           }}
//                         >
//                           <DialogTrigger asChild>
//                             <Button
//                               variant="outline"
//                               size="sm"
//                               onClick={() => setSelectedAdmin(admin)}
//                             >
//                               <Edit2 size={16} />
//                             </Button>
//                           </DialogTrigger>
//                           <DialogContent>
//                             <DialogHeader>
//                               <DialogTitle>Edit Admin Roles</DialogTitle>
//                               <DialogDescription>
//                                 Update roles for {selectedAdmin?.fullName}
//                               </DialogDescription>
//                             </DialogHeader>

//                             <div className="space-y-3">
//                               {roles.map((role) => (
//                                 <div
//                                   key={role.id}
//                                   className="flex items-center gap-2"
//                                 >
//                                   <input
//                                     type="checkbox"
//                                     id={`role-${role.id}`}
//                                     defaultChecked={selectedAdmin?.Roles?.some(
//                                       (r) => r.id === role.id
//                                     )}
//                                     onChange={(e) => {
//                                       if (selectedAdmin) {
//                                         if (e.target.checked) {
//                                           setSelectedAdmin({
//                                             ...selectedAdmin,
//                                             Roles: [
//                                               ...(selectedAdmin.Roles || []),
//                                               role,
//                                             ],
//                                           });
//                                         } else {
//                                           setSelectedAdmin({
//                                             ...selectedAdmin,
//                                             Roles: selectedAdmin.Roles?.filter(
//                                               (r) => r.id !== role.id
//                                             ),
//                                           });
//                                         }
//                                       }
//                                     }}
//                                     className="rounded border-gray-300"
//                                   />
//                                   <label
//                                     htmlFor={`role-${role.id}`}
//                                     className="text-sm font-medium flex-1"
//                                   >
//                                     {role.name}
//                                     <p className="text-xs text-muted-foreground">
//                                       {role.description}
//                                     </p>
//                                   </label>
//                                 </div>
//                               ))}
//                             </div>

//                             <div className="flex gap-2 justify-end pt-4">
//                               <Button
//                                 variant="outline"
//                                 onClick={() => setEditRolesOpen(false)}
//                               >
//                                 Cancel
//                               </Button>
//                               <Button
//                                 onClick={() =>
//                                   handleUpdateUserRoles(
//                                     selectedAdmin!.id,
//                                     selectedAdmin?.Roles?.map((r) => r.id) || []
//                                   )
//                                 }
//                               >
//                                 Save Changes
//                               </Button>
//                             </div>
//                           </DialogContent>
//                         </Dialog>
//                       )}
//                     </div>
//                   ))}
//                 </div>
//               )}
//             </CardContent>
//           </Card>
//         </TabsContent>

//         <TabsContent value="roles">
//           <Card>
//             <CardHeader>
//               <CardTitle>Roles and Permissions</CardTitle>
//               <CardDescription>
//                 View all available roles and their permissions
//               </CardDescription>
//             </CardHeader>
//             <CardContent>
//               {loading ? (
//                 <div className="text-center py-8">Loading...</div>
//               ) : roles.length === 0 ? (
//                 <div className="text-center py-8 text-muted-foreground">
//                   No roles found
//                 </div>
//               ) : (
//                 <div className="space-y-4">
//                   {roles.map((role) => (
//                     <div
//                       key={role.id}
//                       className="border rounded-lg p-4 space-y-3"
//                     >
//                       <div>
//                         <h3 className="font-semibold flex items-center gap-2">
//                           <Badge>{role.name}</Badge>
//                         </h3>
//                         <p className="text-sm text-muted-foreground mt-1">
//                           {role.description}
//                         </p>
//                       </div>

//                       <div className="grid grid-cols-2 gap-4">
//                         <div>
//                           <p className="text-xs font-semibold text-muted-foreground mb-2">
//                             USERS
//                           </p>
//                           {renderPermissionsGrid("users")}
//                         </div>
//                         <div>
//                           <p className="text-xs font-semibold text-muted-foreground mb-2">
//                             BUSINESSES
//                           </p>
//                           {renderPermissionsGrid("businesses")}
//                         </div>
//                         <div>
//                           <p className="text-xs font-semibold text-muted-foreground mb-2">
//                             PROMOTIONS
//                           </p>
//                           {renderPermissionsGrid("promotions")}
//                         </div>
//                         <div>
//                           <p className="text-xs font-semibold text-muted-foreground mb-2">
//                             ADMIN
//                           </p>
//                           {renderPermissionsGrid("admin")}
//                         </div>
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               )}
//             </CardContent>
//           </Card>
//         </TabsContent>
//       </Tabs>
//     </div>
//   );
// };

// export default AdminRoleManagement;

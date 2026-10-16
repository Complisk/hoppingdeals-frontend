"use client";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AdminRoleManagementNew from "@/components/admin/AdminRoleManagementNew";
import AdminUserManagement from "@/components/admin/AdminUserManagement";
import { Shield, Users } from "lucide-react";

const AdminRolesPage = () => {
  const [activeTab, setActiveTab] = useState("roles");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl">Roles and admin access</h1>
        <p className="mt-1 text-muted-foreground">
          Decide what each admin role can see and change, then assign people to it.
        </p>
      </div>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div>
          <div>
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="roles" className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Roles & Permissions
              </TabsTrigger>
              <TabsTrigger value="admins" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Admin Users
              </TabsTrigger>
            </TabsList>
          </div>
        </div>

        <TabsContent value="roles" className="mt-6 border-0">
          <AdminRoleManagementNew embedded />
        </TabsContent>

        <TabsContent value="admins" className="mt-6 border-0">
          <AdminUserManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminRolesPage;

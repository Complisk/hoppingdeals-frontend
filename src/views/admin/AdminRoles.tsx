"use client";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AdminRoleManagementNew from "@/components/admin/AdminRoleManagementNew";
import AdminUserManagement from "@/components/admin/AdminUserManagement";
import { Shield, Users } from "lucide-react";

const AdminRolesPage = () => {
  const [activeTab, setActiveTab] = useState("roles");

  return (
    <div className="min-h-screen bg-background">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="border-b">
          <div className="container px-4 py-4">
            <TabsList className="grid w-full grid-cols-2 max-w-md">
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

        <TabsContent value="roles" className="border-0">
          <AdminRoleManagementNew />
        </TabsContent>

        <TabsContent value="admins" className="border-0">
          <AdminUserManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminRolesPage;

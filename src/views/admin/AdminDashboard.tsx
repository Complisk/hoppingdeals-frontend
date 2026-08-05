"use client";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Eye,
  Ban,
  Users,
  Megaphone,
  TrendingUp,
  BarChart3,
  DollarSign,
} from "lucide-react";
import { useAdminService } from "@/services/adminService";
import type { AppDispatch } from "@/store";

const AdminDashboard = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { getDashboardStats } = useAdminService();

  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getDashboardStats(dispatch);
        if (data) {
          setDashboardData(data);
        }
      } catch (err) {
        console.error("Error fetching dashboard:", err);
        setError((err as any)?.message || "Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="space-y-8">
        <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-8">
        <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
        <div className="bg-destructive/10 border border-destructive rounded-lg p-4">
          <p className="text-destructive">{error}</p>
        </div>
      </div>
    );
  }

  const stats = [
    {
      label: "Total Users",
      value: dashboardData?.users?.total || 0,
      icon: Users,
      color: "text-primary",
      subText: `${dashboardData?.users?.active || 0} active`,
    },
    {
      label: "Total Businesses",
      value: dashboardData?.businesses?.total || 0,
      icon: TrendingUp,
      color: "text-accent",
      subText: `${dashboardData?.businesses?.active || 0} active`,
    },
    {
      label: "Total Promotions",
      value: dashboardData?.promotions?.total || 0,
      icon: Megaphone,
      color: "text-success",
      subText: `${dashboardData?.promotions?.active || 0} active`,
    },
    {
      label: "Total Revenue",
      value: `$${dashboardData?.revenue?.total || "0.00"}`,
      icon: DollarSign,
      color: "text-info",
      subText: "From active promotions",
    },
  ];

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>

      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-card rounded-2xl p-6 border border-border"
          >
            <stat.icon className={`h-8 w-8 ${stat.color} mb-3`} />
            <div className="text-3xl font-bold text-foreground">
              {stat.value}
            </div>
            <div className="text-sm text-muted-foreground">{stat.label}</div>
            <div className="text-xs text-muted-foreground mt-1">
              {stat.subText}
            </div>
          </div>
        ))}
      </div>

      {/* User Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-card rounded-2xl p-6 border border-border">
          <div className="text-sm text-muted-foreground mb-2">Active Users</div>
          <div className="text-2xl font-bold text-green-600">
            {dashboardData?.users?.active || 0}
          </div>
        </div>
        <div className="bg-card rounded-2xl p-6 border border-border">
          <div className="text-sm text-muted-foreground mb-2">
            Blocked Users
          </div>
          <div className="text-2xl font-bold text-red-600">
            {dashboardData?.users?.blocked || 0}
          </div>
        </div>
        <div className="bg-card rounded-2xl p-6 border border-border">
          <div className="text-sm text-muted-foreground mb-2">
            Suspended Users
          </div>
          <div className="text-2xl font-bold text-yellow-600">
            {dashboardData?.users?.suspended || 0}
          </div>
        </div>
        <div className="bg-card rounded-2xl p-6 border border-border">
          <div className="text-sm text-muted-foreground mb-2">
            Auto-Approve Businesses
          </div>
          <div className="text-2xl font-bold text-blue-600">
            {dashboardData?.businesses?.withAutoApprove || 0}
          </div>
        </div>
      </div>

      {/* Promotion Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-card rounded-2xl p-6 border border-border">
          <div className="text-sm text-muted-foreground mb-2">
            Active Promotions
          </div>
          <div className="text-2xl font-bold text-green-600">
            {dashboardData?.promotions?.active || 0}
          </div>
        </div>
        <div className="bg-card rounded-2xl p-6 border border-border">
          <div className="text-sm text-muted-foreground mb-2">
            Pending Promotions
          </div>
          <div className="text-2xl font-bold text-yellow-600">
            {dashboardData?.promotions?.pending || 0}
          </div>
        </div>
        <div className="bg-card rounded-2xl p-6 border border-border">
          <div className="text-sm text-muted-foreground mb-2">
            Inactive Promotions
          </div>
          <div className="text-2xl font-bold text-gray-600">
            {dashboardData?.promotions?.inactive || 0}
          </div>
        </div>
      </div>

      {/* Engagement Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-card rounded-2xl p-6 border border-border">
          <BarChart3 className="h-8 w-8 text-blue-600 mb-3" />
          <div className="text-sm text-muted-foreground mb-2">Total Views</div>
          <div className="text-3xl font-bold text-foreground">
            {(dashboardData?.engagement?.totalViews || 0).toLocaleString()}
          </div>
        </div>
        <div className="bg-card rounded-2xl p-6 border border-border">
          <Eye className="h-8 w-8 text-green-600 mb-3" />
          <div className="text-sm text-muted-foreground mb-2">Total Clicks</div>
          <div className="text-3xl font-bold text-foreground">
            {(dashboardData?.engagement?.totalClicks || 0).toLocaleString()}
          </div>
        </div>
        <div className="bg-card rounded-2xl p-6 border border-border">
          <TrendingUp className="h-8 w-8 text-purple-600 mb-3" />
          <div className="text-sm text-muted-foreground mb-2">
            Click-Through Rate
          </div>
          <div className="text-3xl font-bold text-foreground">
            {dashboardData?.engagement?.clickThroughRate || "0"}%
          </div>
        </div>
      </div>

      {/* Recent Users */}
      {dashboardData?.recentActivity?.users &&
        dashboardData?.recentActivity?.users?.length > 0 && (
          <div className="bg-card rounded-2xl border border-border overflow-hidden">
            <div className="p-4 border-b border-border">
              <h2 className="font-semibold">Recent Users</h2>
            </div>
            <table className="w-full">
              <thead className="bg-secondary text-left text-sm">
                <tr>
                  <th className="p-4">User</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {dashboardData?.recentActivity?.users
                  ?.slice(0, 5)
                  .map((user: any) => (
                    <tr key={user.id} className="hover:bg-secondary/50">
                      <td className="p-4 font-medium">{user.fullName}</td>
                      <td className="p-4 text-muted-foreground">
                        {user.email}
                      </td>
                      <td className="p-4">
                        <Badge variant="secondary">{user.role}</Badge>
                      </td>
                      <td className="p-4">
                        <Badge
                          variant={
                            user.status === "active" ? "default" : "destructive"
                          }
                        >
                          {user.status}
                        </Badge>
                      </td>
                      <td className="p-4 text-muted-foreground">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}

      {/* Recent Promotions */}
      {dashboardData?.recentActivity?.promotions &&
        dashboardData?.recentActivity?.promotions?.length > 0 && (
          <div className="bg-card rounded-2xl border border-border overflow-hidden">
            <div className="p-4 border-b border-border">
              <h2 className="font-semibold">Recent Promotions</h2>
            </div>
            <table className="w-full">
              <thead className="bg-secondary text-left text-sm">
                <tr>
                  <th className="p-4">Business</th>
                  <th className="p-4">Price</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Views</th>
                  <th className="p-4">Clicks</th>
                  <th className="p-4">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {dashboardData?.recentActivity?.promotions
                  ?.slice(0, 5)
                  .map((promo: any) => (
                    <tr key={promo.id} className="hover:bg-secondary/50">
                      <td className="p-4 font-medium">
                        {promo.business?.name}
                      </td>
                      <td className="p-4">${promo.price}</td>
                      <td className="p-4">
                        <Badge
                          variant={
                            promo.status === "active"
                              ? "default"
                              : promo.status === "pending"
                                ? "secondary"
                                : "outline"
                          }
                        >
                          {promo.status}
                        </Badge>
                      </td>
                      <td className="p-4">
                        {promo.views?.toLocaleString() || 0}
                      </td>
                      <td className="p-4">
                        {promo.clicks?.toLocaleString() || 0}
                      </td>
                      <td className="p-4 text-muted-foreground">
                        {new Date(promo.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
    </div>
  );
};

export default AdminDashboard;

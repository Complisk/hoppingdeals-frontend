"use client";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { Badge } from "@/components/ui/badge";
import {
  Eye,
  Ban,
  Users,
  Megaphone,
  TrendingUp,
  DollarSign,
  Building2,
  CheckCircle2,
  PauseCircle,
  Clock,
  CircleSlash,
  MousePointerClick,
  ShieldCheck,
} from "lucide-react";
import { useAdminService } from "@/services/adminService";
import type { AppDispatch } from "@/store";
import { SceneBackdrop } from "@/components/art/Scene";

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
        <PageTitle />
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-36 animate-pulse rounded-2xl bg-secondary/60" />
          ))}
        </div>
        <div className="grid gap-5 lg:grid-cols-2">
          <div className="h-48 animate-pulse rounded-2xl bg-secondary/60" />
          <div className="h-48 animate-pulse rounded-2xl bg-secondary/60" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-8">
        <PageTitle />
        <div
          role="alert"
          className="rounded-2xl border border-destructive/40 bg-destructive/10 p-5"
        >
          <p className="font-medium text-foreground">
            The overview didn’t load.
          </p>
          <p className="mt-1 text-sm text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  const stats = [
    {
      label: "Shoppers",
      value: (dashboardData?.users?.total || 0).toLocaleString(),
      icon: Users,
      subText: `${dashboardData?.users?.active || 0} active`,
    },
    {
      label: "Businesses",
      value: (dashboardData?.businesses?.total || 0).toLocaleString(),
      icon: Building2,
      subText: `${dashboardData?.businesses?.active || 0} active`,
    },
    {
      label: "Promotions",
      value: (dashboardData?.promotions?.total || 0).toLocaleString(),
      icon: Megaphone,
      subText: `${dashboardData?.promotions?.active || 0} running now`,
    },
    {
      label: "Revenue",
      value: `$${dashboardData?.revenue?.total || "0.00"}`,
      icon: DollarSign,
      subText: "From active promotions",
    },
  ];

  const userSegments: Segment[] = [
    {
      label: "Active",
      value: Number(dashboardData?.users?.active || 0),
      color: "hsl(var(--success))",
      Icon: CheckCircle2,
    },
    {
      label: "Suspended",
      value: Number(dashboardData?.users?.suspended || 0),
      color: "hsl(var(--warning))",
      Icon: PauseCircle,
    },
    {
      label: "Blocked",
      value: Number(dashboardData?.users?.blocked || 0),
      color: "hsl(var(--destructive))",
      Icon: Ban,
    },
  ];

  const promotionSegments: Segment[] = [
    {
      label: "Running",
      value: Number(dashboardData?.promotions?.active || 0),
      color: "hsl(var(--success))",
      Icon: CheckCircle2,
    },
    {
      label: "Pending",
      value: Number(dashboardData?.promotions?.pending || 0),
      color: "hsl(var(--warning))",
      Icon: Clock,
    },
    {
      label: "Inactive",
      value: Number(dashboardData?.promotions?.inactive || 0),
      color: "hsl(var(--muted-foreground) / 0.55)",
      Icon: CircleSlash,
    },
  ];

  const engagement = [
    {
      label: "Views",
      value: (dashboardData?.engagement?.totalViews || 0).toLocaleString(),
      icon: Eye,
    },
    {
      label: "Clicks",
      value: (dashboardData?.engagement?.totalClicks || 0).toLocaleString(),
      icon: MousePointerClick,
    },
    {
      label: "Click-through rate",
      value: `${dashboardData?.engagement?.clickThroughRate || "0"}%`,
      icon: TrendingUp,
    },
  ];

  const statusVariant = (status: string) =>
    status === "active"
      ? "success"
      : status === "pending"
        ? "warning"
        : status === "blocked" || status === "rejected"
          ? "destructive"
          : "secondary";

  return (
    <div className="space-y-8">
      <PageTitle />

      {/* Headline numbers */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="hd-panel p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">{stat.label}</p>
              <span className="hd-icon-tile h-10 w-10">
                <stat.icon className="h-[1.1rem] w-[1.1rem]" />
              </span>
            </div>
            <p className="mt-3 font-display text-3xl font-semibold tabular-nums text-foreground">
              {stat.value}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">{stat.subText}</p>
          </div>
        ))}
      </div>

      {/* Status mix */}
      <div className="grid gap-5 lg:grid-cols-2">
        <StatusBreakdown title="Shopper accounts" segments={userSegments} />
        <StatusBreakdown title="Promotions by status" segments={promotionSegments} />
      </div>

      {/* Engagement + auto-approve */}
      <div className="grid gap-5 lg:grid-cols-[2fr_1fr]">
        <div className="hd-panel grid divide-y divide-border p-0 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          {engagement.map((item) => (
            <div key={item.label} className="p-5">
              <p className="flex items-center gap-2 text-sm text-muted-foreground">
                <item.icon className="h-4 w-4 text-gold" />
                {item.label}
              </p>
              <p className="mt-2 font-display text-2xl font-semibold tabular-nums">
                {item.value}
              </p>
            </div>
          ))}
        </div>
        <div className="hd-panel flex items-center justify-between gap-4 p-5">
          <div>
            <p className="text-sm text-muted-foreground">
              Businesses on auto-approve
            </p>
            <p className="mt-2 font-display text-2xl font-semibold tabular-nums">
              {dashboardData?.businesses?.withAutoApprove || 0}
            </p>
          </div>
          <span className="hd-icon-tile">
            <ShieldCheck className="h-5 w-5" />
          </span>
        </div>
      </div>

      {/* Recent users */}
      {dashboardData?.recentActivity?.users &&
        dashboardData?.recentActivity?.users?.length > 0 && (
          <div className="hd-panel overflow-hidden p-0">
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <h2 className="font-sans text-base font-semibold tracking-tight">
                Newest shoppers
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-sm">
                <thead className="bg-secondary/40 text-left text-xs text-muted-foreground">
                  <tr>
                    <th className="px-5 py-3 font-semibold">Name</th>
                    <th className="px-5 py-3 font-semibold">Email</th>
                    <th className="px-5 py-3 font-semibold">Role</th>
                    <th className="px-5 py-3 font-semibold">Status</th>
                    <th className="px-5 py-3 font-semibold">Joined</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/70">
                  {dashboardData?.recentActivity?.users
                    ?.slice(0, 5)
                    .map((user: any) => (
                      <tr key={user.id} className="transition-colors hover:bg-accent/40">
                        <td className="px-5 py-3.5 font-medium">{user.fullName}</td>
                        <td className="px-5 py-3.5 text-muted-foreground">
                          {user.email}
                        </td>
                        <td className="px-5 py-3.5">
                          <Badge variant="secondary" className="capitalize">
                            {user.role}
                          </Badge>
                        </td>
                        <td className="px-5 py-3.5">
                          <Badge variant={statusVariant(user.status)} className="capitalize">
                            {user.status}
                          </Badge>
                        </td>
                        <td className="px-5 py-3.5 text-muted-foreground">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      {/* Recent promotions */}
      {dashboardData?.recentActivity?.promotions &&
        dashboardData?.recentActivity?.promotions?.length > 0 && (
          <div className="hd-panel overflow-hidden p-0">
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <h2 className="font-sans text-base font-semibold tracking-tight">
                Latest promotions
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-sm">
                <thead className="bg-secondary/40 text-left text-xs text-muted-foreground">
                  <tr>
                    <th className="px-5 py-3 font-semibold">Business</th>
                    <th className="px-5 py-3 font-semibold">Price</th>
                    <th className="px-5 py-3 font-semibold">Status</th>
                    <th className="px-5 py-3 text-right font-semibold">Views</th>
                    <th className="px-5 py-3 text-right font-semibold">Clicks</th>
                    <th className="px-5 py-3 font-semibold">Created</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/70">
                  {dashboardData?.recentActivity?.promotions
                    ?.slice(0, 5)
                    .map((promo: any) => (
                      <tr key={promo.id} className="transition-colors hover:bg-accent/40">
                        <td className="px-5 py-3.5 font-medium">
                          {promo.business?.name || promo.metadata?.businessName || "Admin promotion"}
                        </td>
                        <td className="px-5 py-3.5 tabular-nums">${promo.price}</td>
                        <td className="px-5 py-3.5">
                          <Badge variant={statusVariant(promo.status)} className="capitalize">
                            {promo.status}
                          </Badge>
                        </td>
                        <td className="px-5 py-3.5 text-right tabular-nums">
                          {promo.views?.toLocaleString() || 0}
                        </td>
                        <td className="px-5 py-3.5 text-right tabular-nums">
                          {promo.clicks?.toLocaleString() || 0}
                        </td>
                        <td className="px-5 py-3.5 text-muted-foreground">
                          {new Date(promo.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
    </div>
  );
};

function PageTitle() {
  return (
    <div className="relative isolate overflow-hidden rounded-3xl border border-white/10 px-6 py-8 sm:px-8 sm:py-10">
      <SceneBackdrop name="tower" fade="left" compact />
      <h1 className="text-2xl text-white sm:text-3xl">Platform overview</h1>
      <p className="mt-2 max-w-md text-white/80">
        Accounts, promotions and engagement across Hopping Deals.
      </p>
    </div>
  );
}

interface Segment {
  label: string;
  value: number;
  color: string;
  Icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
}

// One proportion bar for a status mix. Status colors never stand alone:
// every segment is repeated in the legend with an icon, label and count.
function StatusBreakdown({
  title,
  segments,
}: {
  title: string;
  segments: Segment[];
}) {
  const total = segments.reduce((sum, s) => sum + s.value, 0);
  const pct = (value: number) => (total ? Math.round((value / total) * 100) : 0);

  return (
    <div className="hd-panel p-5">
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="font-sans text-base font-semibold tracking-tight">
          {title}
        </h2>
        <p className="text-sm tabular-nums text-muted-foreground">
          {total.toLocaleString()} total
        </p>
      </div>

      <div
        className="mt-4 flex h-3 w-full gap-[2px] overflow-hidden rounded-[4px] bg-secondary/70"
        role="img"
        aria-label={segments
          .map((s) => `${s.label}: ${s.value} (${pct(s.value)}%)`)
          .join(", ")}
      >
        {total > 0
          ? segments
              .filter((s) => s.value > 0)
              .map((s) => (
                <div
                  key={s.label}
                  title={`${s.label}: ${s.value.toLocaleString()} (${pct(s.value)}%)`}
                  className="h-full transition-opacity first:rounded-l-[4px] last:rounded-r-[4px] hover:opacity-80"
                  style={{ width: `${(s.value / total) * 100}%`, background: s.color }}
                />
              ))
          : null}
      </div>

      <ul className="mt-4 grid gap-2.5 sm:grid-cols-3">
        {segments.map((s) => (
          <li key={s.label} className="flex items-center gap-2 text-sm">
            <s.Icon className="h-4 w-4 shrink-0" style={{ color: s.color }} />
            <span className="text-muted-foreground">{s.label}</span>
            <span className="ml-auto font-semibold tabular-nums text-foreground sm:ml-1">
              {s.value.toLocaleString()}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default AdminDashboard;

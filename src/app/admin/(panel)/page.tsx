"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Users,
  Sparkles,
  Send,
  Workflow,
  CheckCircle2,
  Hourglass,
  BadgeCheck,
  Copy,
  CalendarClock,
  ArrowLeft,
} from "lucide-react";
import { PageHeader } from "@/components/admin/PageHeader";
import { StatCard } from "@/components/admin/StatCard";
import { BarList, DonutChart } from "@/components/admin/Charts";
import { InstallCard } from "@/components/admin/InstallCard";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { getDashboardStats, type DashboardStats } from "@/services/statsService";
import { getStatusMeta } from "@/config/statuses";
import { getSourceMeta } from "@/config/sources";
import { formatDate } from "@/lib/utils";

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    getDashboardStats().then(setStats);
  }, []);

  const loading = !stats;

  return (
    <div>
      <PageHeader
        title="לוח בקרה"
        description="מבט-על על המועמדים, הסטטוסים והמקורות."
      />

      {/* Primary stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        <StatCard label="סה״כ מועמדים" value={stats?.total ?? 0} icon={Users} accent="var(--rf-purple)" loading={loading} />
        <StatCard label="חדשים" value={stats?.new ?? 0} icon={Sparkles} accent="var(--rf-cyan)" loading={loading} />
        <StatCard label="הועברו לחברה" value={stats?.transferred ?? 0} icon={Send} accent="var(--rf-magenta)" loading={loading} />
        <StatCard label="בתהליך" value={stats?.inProcess ?? 0} icon={Workflow} accent="var(--rf-blue)" loading={loading} />
        <StatCard label="התקבלו" value={stats?.hired ?? 0} icon={CheckCircle2} accent="#22C55E" loading={loading} />
        <StatCard label="בונוס בהמתנה" value={stats?.bonusPending ?? 0} icon={Hourglass} accent="#F59E0B" loading={loading} />
        <StatCard label="בונוס התקבל" value={stats?.bonusReceived ?? 0} icon={BadgeCheck} accent="#22C55E" loading={loading} />
        <StatCard label="ייתכן שקיים" value={stats?.possibleDuplicate ?? 0} icon={Copy} accent="#F72585" loading={loading} />
      </div>

      {/* Charts + follow-ups */}
      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>מועמדים לפי תחום</CardTitle>
          </CardHeader>
          {loading ? (
            <div className="flex flex-col gap-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-8 w-full" />
              ))}
            </div>
          ) : (
            <BarList
              data={stats.byField.slice(0, 7).map((f) => ({
                label: f.field,
                value: f.count,
              }))}
            />
          )}
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>מקורות הגעה</CardTitle>
          </CardHeader>
          {loading ? (
            <Skeleton className="h-40 w-full" />
          ) : (
            <DonutChart
              data={stats.bySource.map((s) => ({
                label: getSourceMeta(s.source as never).label,
                value: s.count,
              }))}
            />
          )}
        </Card>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>פילוח לפי סטטוס</CardTitle>
          </CardHeader>
          {loading ? (
            <Skeleton className="h-40 w-full" />
          ) : (
            <div className="flex flex-wrap gap-2">
              {stats.byStatus
                .sort((a, b) => b.count - a.count)
                .map((s) => (
                  <div
                    key={s.status}
                    className="flex items-center gap-2 rounded-xl border border-white/8 bg-white/[0.03] px-3 py-2"
                  >
                    <StatusBadge status={s.status} size="sm" />
                    <span className="text-sm font-bold text-[var(--rf-text)]">
                      {s.count}
                    </span>
                  </div>
                ))}
            </div>
          )}
        </Card>

        {/* Upcoming follow-ups */}
        <Card>
          <CardHeader>
            <CardTitle>מעקבים קרובים</CardTitle>
            <CalendarClock size={18} className="text-[var(--rf-text-muted)]" />
          </CardHeader>
          {loading ? (
            <div className="flex flex-col gap-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : stats.recentFollowUps.length === 0 ? (
            <p className="py-6 text-center text-sm text-[var(--rf-text-muted)]">
              אין מעקבים מתוזמנים.
            </p>
          ) : (
            <ul className="flex flex-col gap-2">
              {stats.recentFollowUps.map((c) => (
                <li key={c.id}>
                  <Link
                    href={`/admin/candidates/${c.id}`}
                    className="flex items-center justify-between gap-2 rounded-xl border border-white/8 bg-white/[0.02] px-3 py-2.5 transition-colors hover:bg-white/5 focus-ring"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-[var(--rf-text)]">
                        {c.full_name}
                      </p>
                      <p className="text-xs text-[var(--rf-text-muted)]">
                        {getStatusMeta(c.status).label} · {formatDate(c.follow_up_date)}
                      </p>
                    </div>
                    <ArrowLeft size={16} className="flex-none text-[var(--rf-text-muted)]" />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <div className="mt-6 max-w-md">
        <InstallCard />
      </div>
    </div>
  );
}

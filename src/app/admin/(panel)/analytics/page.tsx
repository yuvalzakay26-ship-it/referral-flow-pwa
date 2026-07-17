"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { PageHeader } from "@/components/admin/PageHeader";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { BarList, DonutChart } from "@/components/admin/Charts";
import { Skeleton } from "@/components/ui/Skeleton";
import { Icon } from "@/components/ui/Icon";
import { getDashboardStats, type DashboardStats } from "@/services/statsService";
import { getStatusMeta } from "@/config/statuses";
import { getSourceMeta } from "@/config/sources";
import { formatCurrency } from "@/lib/utils";
import type { CandidateStatus, SourceKey } from "@/types";

/** Primary recruitment funnel, in order. */
const FUNNEL: CandidateStatus[] = [
  "new",
  "pending_review",
  "transferred",
  "in_recruitment",
  "accepted",
];

/** Secondary statuses shown compactly, outside the main flow. */
const SECONDARY: CandidateStatus[] = [
  "missing_details",
  "possible_duplicate",
  "not_suitable",
  "closed",
];

const ACCEPTED_FILTER = "accepted,bonus_pending,bonus_received";

export default function AnalyticsPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    getDashboardStats().then(setStats);
  }, []);

  const loading = !stats;
  // With no candidates every chart would be an empty frame or a zeroed donut,
  // which reads as broken rather than empty. Show why instead.
  const noData = !loading && stats.total === 0;

  const statusCount = (s: CandidateStatus) =>
    stats?.byStatus.find((x) => x.status === s)?.count ?? 0;

  const topFields = stats?.byField.slice(0, 5) ?? [];
  const restFields = stats?.byField.slice(5) ?? [];
  const restSum = restFields.reduce((s, f) => s + f.count, 0);

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title="נתונים"
        description="פילוח מלא של המועמדים, המקורות והבונוסים."
      />

      {/* Status funnel */}
      <Card className="mb-4">
        <CardHeader>
          <CardTitle>פילוח לפי סטטוס</CardTitle>
        </CardHeader>
        {loading ? (
          <Skeleton className="h-56 w-full" />
        ) : noData ? (
          <ChartEmpty text="פילוח הסטטוסים יופיע כאן אחרי הוספת המועמד הראשון." />
        ) : (
          <>
            <ol className="flex flex-col">
              {FUNNEL.map((s, i) => {
                const meta = getStatusMeta(s);
                const isLast = s === "accepted";
                const count =
                  s === "accepted" ? stats.hired : statusCount(s);
                const href =
                  s === "accepted"
                    ? `/admin/candidates?status=${ACCEPTED_FILTER}`
                    : `/admin/candidates?status=${s}`;
                const color = isLast ? "var(--rf-success)" : "var(--rf-blue)";
                return (
                  <li key={s} className="relative">
                    {i < FUNNEL.length - 1 && (
                      <span
                        className="absolute right-[19px] top-10 h-[calc(100%-2.5rem)] w-px"
                        style={{ background: "color-mix(in srgb, var(--rf-blue) 30%, transparent)" }}
                        aria-hidden
                      />
                    )}
                    <Link
                      href={href}
                      className="group flex items-center gap-3 rounded-xl px-1 py-2 transition-colors hover:bg-white/[0.04] focus-ring"
                    >
                      <span
                        className="relative z-10 flex h-8 w-8 flex-none items-center justify-center rounded-full"
                        style={{ background: `color-mix(in srgb, ${color} 18%, var(--rf-surface))` }}
                      >
                        <Icon name={meta.icon} size={16} style={{ color }} />
                      </span>
                      <span className="flex-1 text-sm font-medium text-[var(--rf-text)]">
                        {meta.label}
                      </span>
                      <span className="text-lg font-black text-[var(--rf-text)]">
                        {count}
                      </span>
                      <ChevronLeft
                        size={16}
                        className="flex-none text-[var(--rf-text-muted)] opacity-0 transition-opacity group-hover:opacity-100"
                      />
                    </Link>
                  </li>
                );
              })}
            </ol>

            <div className="mt-4 border-t border-white/8 pt-4">
              <p className="mb-2 text-xs font-medium text-[var(--rf-text-muted)]">
                סטטוסים נוספים
              </p>
              <div className="flex flex-wrap gap-2">
                {SECONDARY.map((s) => {
                  const meta = getStatusMeta(s);
                  return (
                    <Link
                      key={s}
                      href={`/admin/candidates?status=${s}`}
                      className="flex items-center gap-2 rounded-xl border border-white/8 bg-white/[0.02] px-3 py-2 transition-colors hover:bg-white/[0.05] focus-ring"
                    >
                      <Icon
                        name={meta.icon}
                        size={14}
                        className="text-[var(--rf-text-muted)]"
                      />
                      <span className="text-sm text-[var(--rf-text)]">
                        {meta.label}
                      </span>
                      <span className="text-sm font-bold text-[var(--rf-text-muted)]">
                        {statusCount(s)}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </Card>

      {/* Candidates by field */}
      <Card className="mb-4">
        <CardHeader>
          <CardTitle>מועמדים לפי תחום</CardTitle>
        </CardHeader>
        {loading ? (
          <div className="flex flex-col gap-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-8 w-full" />
            ))}
          </div>
        ) : noData ? (
          <ChartEmpty text="הפילוח לפי תחום מקצועי יופיע כאן אחרי הוספת מועמדים." />
        ) : (
          <BarList
            data={[
              ...topFields.map((f) => ({
                label: f.field,
                value: f.count,
                href: `/admin/candidates?field=${encodeURIComponent(f.field)}`,
              })),
              ...(restSum > 0
                ? [{ label: `תחומים נוספים (${restFields.length})`, value: restSum }]
                : []),
            ]}
          />
        )}
      </Card>

      {/* Sources */}
      <Card className="mb-4">
        <CardHeader>
          <CardTitle>מקורות הגעה</CardTitle>
        </CardHeader>
        {loading ? (
          <Skeleton className="h-40 w-full" />
        ) : noData ? (
          <ChartEmpty text="מקורות ההגעה יופיעו כאן אחרי הוספת מועמדים." />
        ) : (
          <DonutChart
            data={stats.bySource.map((s) => ({
              label: getSourceMeta(s.source as SourceKey).label,
              value: s.count,
              href: `/admin/candidates?source=${encodeURIComponent(s.source)}`,
            }))}
          />
        )}
      </Card>

      {/* Bonus overview */}
      <Card>
        <CardHeader>
          <CardTitle>בונוסים</CardTitle>
        </CardHeader>
        {loading ? (
          <Skeleton className="h-24 w-full" />
        ) : (
          <div className="grid grid-cols-2 gap-2.5">
            <BonusStat
              label="בונוסים בהמתנה"
              value={stats.bonusPending}
              sub={
                stats.bonusPendingAmount > 0
                  ? `צפוי: ${formatCurrency(stats.bonusPendingAmount)}`
                  : undefined
              }
              icon="Hourglass"
              color="var(--rf-warning)"
              href="/admin/candidates?bonus=pending"
            />
            <BonusStat
              label="בונוסים שהתקבלו"
              value={stats.bonusReceived}
              sub={
                stats.bonusReceivedAmount > 0
                  ? `התקבל: ${formatCurrency(stats.bonusReceivedAmount)}`
                  : undefined
              }
              icon="BadgeCheck"
              color="var(--rf-success)"
              href="/admin/candidates?bonus=received"
            />
          </div>
        )}
      </Card>
    </div>
  );
}

/** Placeholder shown in a chart card while there is nothing to plot. */
function ChartEmpty({ text }: { text: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-white/10 px-4 py-10 text-center">
      <Icon name="BarChart3" size={22} className="mb-3 text-[var(--rf-text-muted)]" />
      <p className="max-w-xs text-sm text-[var(--rf-text-muted)]">{text}</p>
    </div>
  );
}

function BonusStat({
  label,
  value,
  sub,
  icon,
  color,
  href,
}: {
  label: string;
  value: number;
  sub?: string;
  icon: string;
  color: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="glass flex flex-col gap-2 rounded-2xl p-4 transition-colors hover:bg-white/[0.05] focus-ring"
    >
      <span
        className="flex h-8 w-8 items-center justify-center rounded-lg"
        style={{ background: `color-mix(in srgb, ${color} 16%, transparent)` }}
      >
        <Icon name={icon} size={16} style={{ color }} />
      </span>
      <p className="text-2xl font-black leading-none text-[var(--rf-text)]">
        {value}
      </p>
      <p className="text-xs font-medium text-[var(--rf-text-muted)]">{label}</p>
      {sub && (
        <p className="text-[11px] text-[var(--rf-text-muted)]" dir="rtl">
          {sub}
        </p>
      )}
    </Link>
  );
}

"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  UserPlus,
  Users,
  Briefcase,
  MessageSquare,
  Clock,
  AlertCircle,
  CalendarClock,
  Copy,
  Send,
  Workflow,
  CheckCircle2,
  ChevronLeft,
  BarChart3,
  ArrowLeft,
  type LucideIcon,
} from "lucide-react";
import { MockModeBanner } from "@/components/admin/MockModeBanner";
import { StatusBadge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { FollowUpList } from "@/components/admin/FollowUpList";
import { getDashboardStats, type DashboardStats } from "@/services/statsService";
import { formatDate } from "@/lib/utils";

const ACCEPTED_FILTER = "accepted,bonus_pending,bonus_received";

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);

  const refresh = useCallback(() => {
    getDashboardStats().then(setStats);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const loading = !stats;

  return (
    <div className="mx-auto max-w-3xl">
      <MockModeBanner />

      {/* 2 · Primary action */}
      <section className="mb-6">
        <Link
          href="/admin/candidates/new"
          className="btn-gradient flex w-full items-center justify-center gap-2.5 rounded-2xl px-6 py-4 text-base font-bold focus-ring"
        >
          <UserPlus size={22} strokeWidth={2.4} />
          מועמד חדש
        </Link>
        <div className="mt-3 flex items-center justify-center gap-2 text-sm">
          <QuickLink href="/admin/candidates" icon={Users} label="כל המועמדים" />
          <span className="text-white/10">·</span>
          <QuickLink href="/admin/jobs" icon={Briefcase} label="משרה חדשה" />
          <span className="text-white/10">·</span>
          <QuickLink href="/admin/messages" icon={MessageSquare} label="הודעות מוכנות" />
        </div>
      </section>

      {/* 3 · Attention required */}
      <section className="mb-6">
        <SectionTitle>דורש טיפול</SectionTitle>
        {loading ? (
          <div className="grid grid-cols-2 gap-2.5">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full rounded-2xl" />
            ))}
          </div>
        ) : (
          <AttentionGrid stats={stats} />
        )}
      </section>

      {/* 4 · Key metrics */}
      <section className="mb-6">
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
          <MetricCard
            label="סה״כ מועמדים"
            value={stats?.total}
            icon={Users}
            accent="var(--rf-purple)"
            href="/admin/candidates"
            loading={loading}
          />
          <MetricCard
            label="הועברו לחברה"
            value={stats?.transferred}
            icon={Send}
            accent="var(--rf-blue)"
            href="/admin/candidates?status=transferred"
            loading={loading}
          />
          <MetricCard
            label="בתהליך גיוס"
            value={stats?.inRecruitment}
            icon={Workflow}
            accent="var(--rf-cyan)"
            href="/admin/candidates?status=in_recruitment"
            loading={loading}
          />
          <MetricCard
            label="התקבלו"
            value={stats?.hired}
            icon={CheckCircle2}
            accent="var(--rf-success)"
            href={`/admin/candidates?status=${ACCEPTED_FILTER}`}
            loading={loading}
          />
        </div>
      </section>

      {/* 5 · Upcoming follow-ups */}
      <section className="mb-6">
        <div className="mb-3 flex items-center justify-between">
          <SectionTitle className="mb-0">מעקבים קרובים</SectionTitle>
          <Link
            href="/admin/candidates?followUp=due&sort=follow_up_date:asc"
            className="text-xs font-medium text-[var(--rf-text-muted)] hover:text-[var(--rf-cyan)] focus-ring rounded"
          >
            כל המעקבים
          </Link>
        </div>
        {loading ? (
          <div className="flex flex-col gap-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full rounded-2xl" />
            ))}
          </div>
        ) : (
          <FollowUpList items={stats.recentFollowUps} onChange={refresh} />
        )}
      </section>

      {/* 6 · Recent candidates */}
      <section className="mb-6">
        <div className="mb-3 flex items-center justify-between">
          <SectionTitle className="mb-0">מועמדים אחרונים</SectionTitle>
          <Link
            href="/admin/candidates"
            className="text-xs font-medium text-[var(--rf-text-muted)] hover:text-[var(--rf-cyan)] focus-ring rounded"
          >
            צפייה בכל המועמדים
          </Link>
        </div>
        {loading ? (
          <div className="flex flex-col gap-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full rounded-2xl" />
            ))}
          </div>
        ) : stats.recentCandidates.length === 0 ? (
          <div className="glass flex flex-col items-center gap-3 rounded-2xl px-4 py-7 text-center">
            <span
              className="flex h-11 w-11 items-center justify-center rounded-2xl"
              style={{ background: "var(--rf-gradient-soft)" }}
            >
              <Users size={20} className="text-[var(--rf-text-muted)]" />
            </span>
            <p className="text-sm text-[var(--rf-text-muted)]">
              עדיין לא נוספו מועמדים למערכת.
            </p>
            <Link
              href="/admin/candidates/new"
              className="btn-gradient inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold focus-ring"
            >
              + הוספת מועמד ראשון
            </Link>
          </div>
        ) : (
          <ul className="flex flex-col gap-2">
            {stats.recentCandidates.slice(0, 4).map((c) => (
              <li key={c.id}>
                <Link
                  href={`/admin/candidates/${c.id}`}
                  className="glass flex items-center gap-3 rounded-2xl p-3 transition-colors hover:bg-white/[0.05] focus-ring"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-[var(--rf-text)]">
                      {c.full_name}
                    </p>
                    <p className="truncate text-xs text-[var(--rf-text-muted)]">
                      {c.professional_field} · נוסף {formatDate(c.date_received ?? c.created_at)}
                    </p>
                  </div>
                  <StatusBadge status={c.status} size="sm" />
                  <ChevronLeft size={16} className="flex-none text-[var(--rf-text-muted)]" />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* 7 · Analytics link */}
      <Link
        href="/admin/analytics"
        className="glass flex items-center justify-between rounded-2xl px-4 py-3.5 transition-colors hover:bg-white/[0.05] focus-ring"
      >
        <span className="flex items-center gap-2.5 text-sm font-medium text-[var(--rf-text)]">
          <BarChart3 size={18} className="text-[var(--rf-purple)]" />
          נתונים ואנליטיקה מלאה
        </span>
        <ArrowLeft size={16} className="text-[var(--rf-text-muted)]" />
      </Link>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Pieces                                                              */
/* ------------------------------------------------------------------ */

function SectionTitle({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <h2 className={`mb-3 text-sm font-bold text-[var(--rf-text-muted)] ${className}`}>
      {children}
    </h2>
  );
}

function QuickLink({
  href,
  icon: Icon,
  label,
}: {
  href: string;
  icon: LucideIcon;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-1.5 rounded-lg px-1 py-0.5 text-[var(--rf-text-muted)] transition-colors hover:text-[var(--rf-text)] focus-ring"
    >
      <Icon size={15} />
      {label}
    </Link>
  );
}

interface AttentionItem {
  label: string;
  count: number;
  href: string;
  icon: LucideIcon;
  color: string;
}

function AttentionGrid({ stats }: { stats: DashboardStats }) {
  const items: AttentionItem[] = [
    {
      label: "ממתינים לבדיקה",
      count: stats.pendingReview,
      href: "/admin/candidates?status=pending_review",
      icon: Clock,
      color: "var(--rf-blue)",
    },
    {
      label: "חסרים פרטים",
      count: stats.missingDetails,
      href: "/admin/candidates?status=missing_details",
      icon: AlertCircle,
      color: "var(--rf-warning)",
    },
    {
      label: "מעקבים להיום או באיחור",
      count: stats.followUpDue,
      href: "/admin/candidates?followUp=due&sort=follow_up_date:asc",
      icon: CalendarClock,
      color: "var(--rf-danger)",
    },
    {
      label: "ייתכן שכבר קיימים במערכת",
      count: stats.possibleDuplicate,
      href: "/admin/candidates?status=possible_duplicate",
      icon: Copy,
      color: "var(--rf-magenta)",
    },
  ].filter((i) => i.count > 0);

  if (items.length === 0) {
    return (
      <div className="glass flex items-center gap-3 rounded-2xl px-4 py-4">
        <CheckCircle2 size={20} className="flex-none text-[var(--rf-success)]" />
        <p className="text-sm text-[var(--rf-text-muted)]">
          הכול מסודר כרגע — אין משימות דחופות.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-2.5">
      {items.map((item) => (
        <Link
          key={item.label}
          href={item.href}
          className="glass flex items-center gap-3 rounded-2xl p-3 transition-colors hover:bg-white/[0.05] focus-ring"
        >
          <span
            className="flex h-9 w-9 flex-none items-center justify-center rounded-xl"
            style={{ background: `color-mix(in srgb, ${item.color} 16%, transparent)` }}
          >
            <item.icon size={17} style={{ color: item.color }} />
          </span>
          <div className="min-w-0">
            <p className="text-lg font-black leading-none text-[var(--rf-text)]">
              {item.count}
            </p>
            <p className="mt-1 truncate text-[11px] leading-tight text-[var(--rf-text-muted)]">
              {item.label}
            </p>
          </div>
        </Link>
      ))}
    </div>
  );
}

function MetricCard({
  label,
  value,
  icon: Icon,
  accent,
  href,
  loading,
}: {
  label: string;
  value: number | undefined;
  icon: LucideIcon;
  accent: string;
  href: string;
  loading?: boolean;
}) {
  return (
    <Link
      href={href}
      className="glass flex flex-col gap-2 rounded-2xl p-4 transition-colors hover:bg-white/[0.05] focus-ring"
    >
      <span
        className="flex h-8 w-8 items-center justify-center rounded-lg"
        style={{ background: `color-mix(in srgb, ${accent} 16%, transparent)` }}
      >
        <Icon size={16} style={{ color: accent }} />
      </span>
      {loading ? (
        <Skeleton className="h-8 w-10" />
      ) : (
        <p className="text-2xl font-black leading-none tracking-tight text-[var(--rf-text)] sm:text-3xl">
          {value ?? 0}
        </p>
      )}
      <p className="text-xs font-medium text-[var(--rf-text-muted)]">{label}</p>
    </Link>
  );
}

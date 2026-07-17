"use client";

import { useState } from "react";
import Link from "next/link";
import {
  MoreVertical,
  MessageCircle,
  Check,
  CalendarPlus,
  ExternalLink,
  ChevronLeft,
} from "lucide-react";
import { StatusBadge } from "@/components/ui/Badge";
import { setFollowUp } from "@/services/candidateService";
import { cn, formatDate, whatsappLink } from "@/lib/utils";
import type { Candidate } from "@/types";

type Bucket = "overdue" | "today" | "tomorrow" | "later";

const BUCKET_META: Record<Bucket, { label: string; color: string }> = {
  overdue: { label: "באיחור", color: "var(--rf-danger)" },
  today: { label: "היום", color: "var(--rf-warning)" },
  tomorrow: { label: "מחר", color: "var(--rf-blue)" },
  later: { label: "בהמשך השבוע", color: "var(--rf-text-muted)" },
};

function isoDate(offsetDays = 0): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().slice(0, 10);
}

function bucketFor(date: string): Bucket {
  const today = isoDate(0);
  const tomorrow = isoDate(1);
  if (date < today) return "overdue";
  if (date === today) return "today";
  if (date === tomorrow) return "tomorrow";
  return "later";
}

export function FollowUpList({
  items,
  onChange,
}: {
  items: Candidate[];
  onChange: () => void;
}) {
  const [openId, setOpenId] = useState<string | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);

  if (items.length === 0) {
    return (
      <div className="glass rounded-2xl px-4 py-6 text-center">
        <p className="text-sm text-[var(--rf-text-muted)]">אין מעקבים קרובים.</p>
      </div>
    );
  }

  async function complete(id: string) {
    setPendingId(id);
    setOpenId(null);
    await setFollowUp(id, null);
    setPendingId(null);
    onChange();
  }

  async function postpone(id: string) {
    setPendingId(id);
    setOpenId(null);
    await setFollowUp(id, isoDate(1));
    setPendingId(null);
    onChange();
  }

  return (
    <ul className="flex flex-col gap-2">
      {items.map((c, i) => {
        const bucket = bucketFor(c.follow_up_date!);
        const prevBucket =
          i > 0 ? bucketFor(items[i - 1].follow_up_date!) : null;
        const showHeader = bucket !== prevBucket;
        const meta = BUCKET_META[bucket];
        const menuOpen = openId === c.id;

        return (
          <li key={c.id}>
            {showHeader && (
              <div className="mb-1.5 mt-1 flex items-center gap-2 first:mt-0">
                <span
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ background: meta.color }}
                />
                <span
                  className="text-[11px] font-bold"
                  style={{ color: meta.color }}
                >
                  {meta.label}
                </span>
              </div>
            )}

            <div
              className={cn(
                "glass relative flex items-center gap-2 rounded-2xl p-3 transition-opacity",
                pendingId === c.id && "opacity-50",
              )}
            >
              <Link
                href={`/admin/candidates/${c.id}`}
                className="flex min-w-0 flex-1 items-center gap-2 focus-ring rounded-lg"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-[var(--rf-text)]">
                    {c.full_name}
                  </p>
                  <div className="mt-1 flex items-center gap-2">
                    <StatusBadge status={c.status} size="sm" />
                    <span className="text-[11px] text-[var(--rf-text-muted)]">
                      {formatDate(c.follow_up_date)}
                    </span>
                  </div>
                </div>
                <ChevronLeft
                  size={16}
                  className="flex-none text-[var(--rf-text-muted)]"
                />
              </Link>

              {/* Overflow menu */}
              <div className="relative flex-none">
                <button
                  type="button"
                  aria-label="פעולות מעקב"
                  aria-haspopup="menu"
                  aria-expanded={menuOpen}
                  onClick={() => setOpenId(menuOpen ? null : c.id)}
                  className="rounded-lg p-2 text-[var(--rf-text-muted)] transition-colors hover:bg-[var(--hover-background)] hover:text-[var(--rf-text)] focus-ring"
                >
                  <MoreVertical size={18} />
                </button>

                {menuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setOpenId(null)}
                      aria-hidden
                    />
                    <div
                      role="menu"
                      className="glass-elevated absolute left-0 top-full z-50 mt-1 flex w-48 flex-col overflow-hidden rounded-xl p-1 shadow-xl"
                    >
                      <MenuLink
                        href={`/admin/candidates/${c.id}`}
                        icon={ExternalLink}
                        label="פתיחת מועמד"
                      />
                      <MenuLink
                        href={whatsappLink(c.whatsapp_number || c.phone)}
                        icon={MessageCircle}
                        label="פתיחת וואטסאפ"
                        external
                      />
                      <MenuButton
                        icon={Check}
                        label="סמן כבוצע"
                        onClick={() => complete(c.id)}
                      />
                      <MenuButton
                        icon={CalendarPlus}
                        label="דחה למחר"
                        onClick={() => postpone(c.id)}
                      />
                    </div>
                  </>
                )}
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

function MenuLink({
  href,
  icon: Icon,
  label,
  external,
}: {
  href: string;
  icon: typeof Check;
  label: string;
  external?: boolean;
}) {
  return (
    <Link
      href={href}
      role="menuitem"
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-[var(--rf-text)] transition-colors hover:bg-[var(--hover-background)] focus-ring"
    >
      <Icon size={16} className="text-[var(--rf-text-muted)]" />
      {label}
    </Link>
  );
}

function MenuButton({
  icon: Icon,
  label,
  onClick,
}: {
  icon: typeof Check;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      role="menuitem"
      onClick={onClick}
      className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-right text-sm text-[var(--rf-text)] transition-colors hover:bg-[var(--hover-background)] focus-ring"
    >
      <Icon size={16} className="text-[var(--rf-text-muted)]" />
      {label}
    </button>
  );
}

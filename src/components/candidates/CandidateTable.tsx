"use client";

import Link from "next/link";
import { ArrowUpDown, ChevronLeft } from "lucide-react";
import { Badge, StatusBadge, EligibilityBadge } from "@/components/ui/Badge";
import { getSourceMeta } from "@/config/sources";
import { getBonusMeta } from "@/config/bonus";
import { formatDate } from "@/lib/utils";
import type { Candidate } from "@/types";
import type { SortKey } from "@/services/candidateService";

interface Props {
  candidates: Candidate[];
  onSort: (key: SortKey) => void;
}

function SortButton({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1 hover:text-[var(--rf-text)] focus-ring ${
        active ? "text-[var(--rf-text)]" : ""
      }`}
    >
      {label}
      <ArrowUpDown size={13} />
    </button>
  );
}

export function CandidateTable({ candidates, onSort }: Props) {
  return (
    <div className="glass hidden overflow-hidden rounded-2xl lg:block">
      <div className="overflow-x-auto">
        <table className="w-full text-right text-sm">
          <thead>
            <tr className="border-b border-[var(--border-subtle)] text-xs text-[var(--rf-text-muted)]">
              <th className="px-4 py-3 font-medium">
                <SortButton label="שם" active onClick={() => onSort("full_name")} />
              </th>
              <th className="px-4 py-3 font-medium">טלפון</th>
              <th className="px-4 py-3 font-medium">תחום</th>
              <th className="px-4 py-3 font-medium">מקור</th>
              <th className="px-4 py-3 font-medium">זכאות</th>
              <th className="px-4 py-3 font-medium">
                <SortButton label="סטטוס" active onClick={() => onSort("status")} />
              </th>
              <th className="px-4 py-3 font-medium">בונוס</th>
              <th className="px-4 py-3 font-medium">
                <SortButton label="מעקב" active onClick={() => onSort("follow_up_date")} />
              </th>
              <th className="px-4 py-3 font-medium">
                <SortButton label="התקבל" active onClick={() => onSort("created_at")} />
              </th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {candidates.map((c) => (
              <tr
                key={c.id}
                className="border-b border-[var(--border-subtle)] transition-colors last:border-0 hover:bg-[var(--hover-background)]"
              >
                <td className="px-4 py-3">
                  <Link
                    href={`/admin/candidates/${c.id}`}
                    className="font-semibold text-[var(--rf-text)] hover:text-[var(--rf-cyan)] focus-ring"
                  >
                    {c.full_name}
                  </Link>
                  <p className="text-xs text-[var(--rf-text-muted)]">
                    {c.reference_number}
                  </p>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-[var(--rf-text-muted)]" dir="ltr">
                  {c.phone}
                </td>
                <td className="px-4 py-3 text-[var(--rf-text-muted)]">
                  {c.professional_field}
                </td>
                <td className="px-4 py-3 text-[var(--rf-text-muted)]">
                  {getSourceMeta(c.source).label}
                </td>
                <td className="px-4 py-3">
                  <EligibilityBadge status={c.eligibility_status} size="sm" />
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={c.status} size="sm" />
                </td>
                <td className="px-4 py-3">
                  {c.bonus_status === "none" ? (
                    <span className="text-[var(--rf-text-muted)]">—</span>
                  ) : (
                    <Badge
                      label={getBonusMeta(c.bonus_status).label}
                      className={getBonusMeta(c.bonus_status).badgeClass}
                      size="sm"
                    />
                  )}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-[var(--rf-text-muted)]">
                  {formatDate(c.follow_up_date)}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-[var(--rf-text-muted)]">
                  {formatDate(c.date_received ?? c.created_at)}
                </td>
                <td className="px-4 py-3">
                  <Link
                    href={`/admin/candidates/${c.id}`}
                    aria-label={`פרטי ${c.full_name}`}
                    className="inline-flex rounded-lg p-1.5 text-[var(--rf-text-muted)] hover:bg-[var(--hover-background)] hover:text-[var(--rf-text)] focus-ring"
                  >
                    <ChevronLeft size={18} />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

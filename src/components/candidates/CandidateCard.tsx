"use client";

import Link from "next/link";
import { ChevronLeft, MapPin, Briefcase } from "lucide-react";
import { StatusBadge, EligibilityBadge } from "@/components/ui/Badge";
import { getSourceMeta } from "@/config/sources";
import { formatDate } from "@/lib/utils";
import type { Candidate } from "@/types";

export function CandidateCard({ candidate: c }: { candidate: Candidate }) {
  return (
    <Link
      href={`/admin/candidates/${c.id}`}
      className="glass block rounded-2xl p-4 transition-colors hover:bg-white/[0.05] focus-ring"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate font-bold text-[var(--rf-text)]">
            {c.full_name}
          </h3>
          <p className="text-xs text-[var(--rf-text-muted)]">
            {c.reference_number}
          </p>
        </div>
        <ChevronLeft size={18} className="flex-none text-[var(--rf-text-muted)]" />
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-[var(--rf-text-muted)]">
        <span className="inline-flex items-center gap-1">
          <Briefcase size={13} />
          {c.professional_field}
        </span>
        <span className="inline-flex items-center gap-1">
          <MapPin size={13} />
          {c.city}
        </span>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <StatusBadge status={c.status} size="sm" />
        <EligibilityBadge status={c.eligibility_status} size="sm" />
      </div>

      <div className="mt-3 flex items-center justify-between border-t border-white/5 pt-2.5 text-xs text-[var(--rf-text-muted)]">
        <span>{getSourceMeta(c.source).label}</span>
        <span>{formatDate(c.created_at)}</span>
      </div>
    </Link>
  );
}

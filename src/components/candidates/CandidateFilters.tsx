"use client";

import { Search, X } from "lucide-react";
import { SelectInput, TextInput } from "@/components/ui/Field";
import { STATUS_LIST } from "@/config/statuses";
import { SOURCE_LIST } from "@/config/sources";
import { ELIGIBILITY } from "@/config/eligibility";
import { PROFESSIONAL_FIELDS } from "@/config/jobTypes";
import type { CandidateFilters as Filters } from "@/services/candidateService";

interface Props {
  filters: Filters;
  onChange: (patch: Partial<Filters>) => void;
  onReset: () => void;
}

export function CandidateFilters({ filters, onChange, onReset }: Props) {
  const hasActive =
    (filters.search && filters.search.length > 0) ||
    (filters.status && filters.status !== "all") ||
    (filters.field && filters.field !== "all") ||
    (filters.source && filters.source !== "all") ||
    (filters.eligibility && filters.eligibility !== "all") ||
    filters.fromDate ||
    filters.toDate;

  return (
    <div className="glass rounded-2xl p-4">
      <div className="relative mb-3">
        <Search
          size={18}
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[var(--rf-text-muted)]"
        />
        <TextInput
          value={filters.search ?? ""}
          onChange={(e) => onChange({ search: e.target.value })}
          placeholder="חיפוש לפי שם, אימייל, טלפון או מספר פנייה..."
          className="pr-10"
          aria-label="חיפוש מועמדים"
        />
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
        <SelectInput
          value={filters.status ?? "all"}
          onChange={(e) => onChange({ status: e.target.value as Filters["status"] })}
          aria-label="סינון לפי סטטוס"
        >
          <option value="all">כל הסטטוסים</option>
          {STATUS_LIST.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </SelectInput>

        <SelectInput
          value={filters.field ?? "all"}
          onChange={(e) => onChange({ field: e.target.value })}
          aria-label="סינון לפי תחום"
        >
          <option value="all">כל התחומים</option>
          {PROFESSIONAL_FIELDS.map((f) => (
            <option key={f} value={f}>
              {f}
            </option>
          ))}
        </SelectInput>

        <SelectInput
          value={filters.source ?? "all"}
          onChange={(e) => onChange({ source: e.target.value })}
          aria-label="סינון לפי מקור"
        >
          <option value="all">כל המקורות</option>
          {SOURCE_LIST.map((s) => (
            <option key={s.key} value={s.key}>
              {s.label}
            </option>
          ))}
        </SelectInput>

        <SelectInput
          value={filters.eligibility ?? "all"}
          onChange={(e) => onChange({ eligibility: e.target.value })}
          aria-label="סינון לפי זכאות"
        >
          <option value="all">כל הזכאויות</option>
          {Object.values(ELIGIBILITY).map((e) => (
            <option key={e.value} value={e.value}>
              {e.label}
            </option>
          ))}
        </SelectInput>

        <div className="col-span-2 grid grid-cols-2 gap-2 sm:col-span-1 lg:col-span-1">
          <TextInput
            type="date"
            value={filters.fromDate ?? ""}
            onChange={(e) => onChange({ fromDate: e.target.value })}
            aria-label="מתאריך"
            className="text-xs"
          />
          <TextInput
            type="date"
            value={filters.toDate ?? ""}
            onChange={(e) => onChange({ toDate: e.target.value })}
            aria-label="עד תאריך"
            className="text-xs"
          />
        </div>
      </div>

      {hasActive && (
        <button
          onClick={onReset}
          className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-[var(--rf-cyan)] hover:underline focus-ring"
        >
          <X size={14} />
          ניקוי סינון
        </button>
      )}
    </div>
  );
}

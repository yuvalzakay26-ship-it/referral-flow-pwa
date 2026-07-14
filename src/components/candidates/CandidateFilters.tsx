"use client";

import { Search, X } from "lucide-react";
import { SelectInput, TextInput } from "@/components/ui/Field";
import { STATUS_LIST } from "@/config/statuses";
import { SOURCE_LIST } from "@/config/sources";
import { ELIGIBILITY } from "@/config/eligibility";
import { BONUS_STATUS_LIST } from "@/config/bonus";
import { PROFESSIONAL_FIELDS, JOB_TYPE_LIST } from "@/config/jobTypes";
import type {
  CandidateFilters as Filters,
  SortKey,
  SortDir,
} from "@/services/candidateService";

interface Props {
  filters: Filters;
  onChange: (patch: Partial<Filters>) => void;
  sort: { key: SortKey; dir: SortDir };
  onSortChange: (key: SortKey, dir: SortDir) => void;
  onReset: () => void;
}

const SORT_OPTIONS: { value: string; label: string; key: SortKey; dir: SortDir }[] =
  [
    { value: "created_at:desc", label: "החדשים ביותר", key: "created_at", dir: "desc" },
    { value: "created_at:asc", label: "הישנים ביותר", key: "created_at", dir: "asc" },
    { value: "follow_up_date:asc", label: "מעקב הקרוב", key: "follow_up_date", dir: "asc" },
    { value: "updated_at:desc", label: "עודכנו לאחרונה", key: "updated_at", dir: "desc" },
    { value: "full_name:asc", label: "שם מועמד/ת", key: "full_name", dir: "asc" },
  ];

export function CandidateFilters({
  filters,
  onChange,
  sort,
  onSortChange,
  onReset,
}: Props) {
  const hasActive =
    (filters.search && filters.search.length > 0) ||
    (filters.status && filters.status !== "all") ||
    (filters.field && filters.field !== "all") ||
    (filters.source && filters.source !== "all") ||
    (filters.eligibility && filters.eligibility !== "all") ||
    (filters.bonus && filters.bonus !== "all") ||
    (filters.employmentType && filters.employmentType !== "all") ||
    (filters.followUp && filters.followUp !== "all") ||
    filters.fromDate ||
    filters.toDate;

  const sortValue = `${sort.key}:${sort.dir}`;

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
          placeholder="חיפוש לפי שם, טלפון, אימייל, תפקיד או כישורים..."
          className="pr-10"
          aria-label="חיפוש מועמדים"
        />
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
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

        <SelectInput
          value={filters.bonus ?? "all"}
          onChange={(e) => onChange({ bonus: e.target.value })}
          aria-label="סינון לפי בונוס"
        >
          <option value="all">כל מצבי הבונוס</option>
          {BONUS_STATUS_LIST.map((b) => (
            <option key={b.value} value={b.value}>
              בונוס: {b.label}
            </option>
          ))}
        </SelectInput>

        <SelectInput
          value={filters.employmentType ?? "all"}
          onChange={(e) => onChange({ employmentType: e.target.value })}
          aria-label="סינון לפי סוג העסקה"
        >
          <option value="all">כל סוגי העסקה</option>
          {JOB_TYPE_LIST.map((j) => (
            <option key={j.value} value={j.value}>
              {j.label}
            </option>
          ))}
        </SelectInput>

        <SelectInput
          value={filters.followUp ?? "all"}
          onChange={(e) =>
            onChange({ followUp: e.target.value as Filters["followUp"] })
          }
          aria-label="סינון לפי מעקב"
        >
          <option value="all">כל המעקבים</option>
          <option value="with">עם מעקב</option>
          <option value="without">ללא מעקב</option>
          <option value="overdue">מעקב באיחור</option>
        </SelectInput>

        <SelectInput
          value={sortValue}
          onChange={(e) => {
            const opt = SORT_OPTIONS.find((o) => o.value === e.target.value);
            if (opt) onSortChange(opt.key, opt.dir);
          }}
          aria-label="מיון"
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              מיון: {o.label}
            </option>
          ))}
        </SelectInput>

        <div className="col-span-2 grid grid-cols-2 gap-2 sm:col-span-1">
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

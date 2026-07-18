"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Users, SlidersHorizontal, UserPlus } from "lucide-react";
import { PageHeader } from "@/components/admin/PageHeader";
import { EmptyState } from "@/components/admin/EmptyState";
import { Button } from "@/components/ui/Button";
import { CandidateFilters } from "@/components/candidates/CandidateFilters";
import { CandidateTable } from "@/components/candidates/CandidateTable";
import { CandidateCard } from "@/components/candidates/CandidateCard";
import { Skeleton } from "@/components/ui/Skeleton";
import { useMediaQuery } from "@/lib/useMediaQuery";
import { listCandidates } from "@/services/candidateService";
import type {
  CandidateFilters as Filters,
  SortKey,
  SortDir,
} from "@/services/candidateService.types";
import type { Candidate } from "@/types";

const EMPTY_FILTERS: Filters = {
  search: "",
  status: "all",
  field: "all",
  source: "all",
  eligibility: "all",
  bonus: "all",
  employmentType: "all",
  followUp: "all",
  fromDate: "",
  toDate: "",
};

const SORT_KEYS: SortKey[] = [
  "created_at",
  "full_name",
  "status",
  "follow_up_date",
  "updated_at",
];

/** Build initial filters + sort from the URL query string (deep links from the dashboard). */
function readParams(sp: URLSearchParams): {
  filters: Filters;
  sort: { key: SortKey; dir: SortDir };
} {
  const filters: Filters = { ...EMPTY_FILTERS };
  const get = (k: string) => sp.get(k) ?? undefined;

  if (get("search")) filters.search = get("search");
  if (get("status")) filters.status = get("status") as Filters["status"];
  if (get("field")) filters.field = get("field");
  if (get("source")) filters.source = get("source");
  if (get("eligibility")) filters.eligibility = get("eligibility");
  if (get("bonus")) filters.bonus = get("bonus");
  if (get("employmentType")) filters.employmentType = get("employmentType");
  if (get("followUp")) filters.followUp = get("followUp") as Filters["followUp"];
  if (get("fromDate")) filters.fromDate = get("fromDate");
  if (get("toDate")) filters.toDate = get("toDate");

  let sort: { key: SortKey; dir: SortDir } = { key: "created_at", dir: "desc" };
  const rawSort = get("sort");
  if (rawSort) {
    const [key, dir] = rawSort.split(":");
    if (SORT_KEYS.includes(key as SortKey)) {
      sort = { key: key as SortKey, dir: dir === "asc" ? "asc" : "desc" };
    }
  }
  return { filters, sort };
}

/**
 * True when the view is narrowed by any filter. Lets an empty result distinguish
 * "nothing matches this search" from "the database has no candidates yet".
 */
function hasActiveFilters(f: Filters): boolean {
  return (
    Boolean(f.search) ||
    Boolean(f.fromDate) ||
    Boolean(f.toDate) ||
    f.status !== "all" ||
    f.field !== "all" ||
    f.source !== "all" ||
    f.eligibility !== "all" ||
    f.bonus !== "all" ||
    f.employmentType !== "all" ||
    f.followUp !== "all"
  );
}

function CandidatesView() {
  const searchParams = useSearchParams();
  // Render only the layout that is actually visible instead of mounting both the
  // desktop table and the mobile cards (which doubled the list DOM). The `lg`
  // breakpoint matches the Tailwind `lg:` boundary the CSS previously used to
  // show/hide each layout. The list renders only after the async fetch resolves
  // (post-mount), so the media match is correct on first paint — no flash.
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  // Initialize from URL once on mount; subsequent changes are user-driven.
  const [{ filters, sort }, setState] = useState(() =>
    readParams(new URLSearchParams(searchParams.toString())),
  );
  const [candidates, setCandidates] = useState<Candidate[] | null>(null);

  // Fetch whenever filters or sort change. Uses an `active` flag so we never
  // call setState synchronously in the effect and never apply a stale response.
  useEffect(() => {
    let active = true;
    listCandidates(filters, sort).then((res) => {
      if (active) setCandidates(res);
    });
    return () => {
      active = false;
    };
  }, [filters, sort]);

  function patchFilters(patch: Partial<Filters>) {
    setCandidates(null);
    setState((s) => ({ ...s, filters: { ...s.filters, ...patch } }));
  }

  function changeSort(key: SortKey, dir: SortDir) {
    setCandidates(null);
    setState((s) => ({ ...s, sort: { key, dir } }));
  }

  function toggleSort(key: SortKey) {
    setCandidates(null);
    setState((s) => ({
      ...s,
      sort:
        s.sort.key === key
          ? { key, dir: s.sort.dir === "asc" ? "desc" : "asc" }
          : { key, dir: "asc" },
    }));
  }

  const count = candidates?.length ?? 0;
  const filtered = hasActiveFilters(filters);

  let description: string;
  if (!candidates) description = "טוען מועמדים...";
  else if (filtered) description = `${count} מועמדים תואמים לסינון`;
  else if (count === 0) description = "המאגר ריק";
  else description = `${count} מועמדים במאגר`;

  return (
    <div>
      <PageHeader
        title="מועמדים"
        description={description}
        actions={
          <Button variant="gradient" asChild>
            <Link href="/admin/candidates/new">
              <UserPlus size={18} />
              מועמד חדש
            </Link>
          </Button>
        }
      />

      <CandidateFilters
        filters={filters}
        onChange={patchFilters}
        sort={sort}
        onSortChange={changeSort}
        onReset={() => {
          setCandidates(null);
          setState({
            filters: EMPTY_FILTERS,
            sort: { key: "created_at", dir: "desc" },
          });
        }}
      />

      <div className="mt-4">
        {candidates === null ? (
          <div className="flex flex-col gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        ) : count === 0 ? (
          filtered ? (
            <EmptyState
              icon={SlidersHorizontal}
              title="לא נמצאו מועמדים"
              description="נסו לשנות את מסנני החיפוש או לנקות אותם."
            />
          ) : (
            <EmptyState
              icon={Users}
              title="אין מועמדים עדיין"
              description="הוסף את המועמד הראשון כדי להתחיל לנהל הפניות ומעקבים."
              action={
                <Button variant="gradient" asChild>
                  <Link href="/admin/candidates/new">
                    <UserPlus size={18} />
                    הוספת מועמד
                  </Link>
                </Button>
              }
            />
          )
        ) : isDesktop ? (
          <CandidateTable candidates={candidates} onSort={toggleSort} />
        ) : (
          <div className="flex flex-col gap-3">
            {candidates.map((c) => (
              <CandidateCard key={c.id} candidate={c} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function CandidatesPage() {
  return (
    <Suspense fallback={null}>
      <CandidatesView />
    </Suspense>
  );
}

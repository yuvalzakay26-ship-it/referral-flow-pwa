"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Users, SlidersHorizontal, UserPlus } from "lucide-react";
import { PageHeader } from "@/components/admin/PageHeader";
import { EmptyState } from "@/components/admin/EmptyState";
import { Button } from "@/components/ui/Button";
import { CandidateFilters } from "@/components/candidates/CandidateFilters";
import { CandidateTable } from "@/components/candidates/CandidateTable";
import { CandidateCard } from "@/components/candidates/CandidateCard";
import { Skeleton } from "@/components/ui/Skeleton";
import {
  listCandidates,
  type CandidateFilters as Filters,
  type SortKey,
  type SortDir,
} from "@/services/candidateService";
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

export default function CandidatesPage() {
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);
  const [sort, setSort] = useState<{ key: SortKey; dir: SortDir }>({
    key: "created_at",
    dir: "desc",
  });
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
    setFilters((f) => ({ ...f, ...patch }));
  }

  function toggleSort(key: SortKey) {
    setCandidates(null);
    setSort((s) =>
      s.key === key
        ? { key, dir: s.dir === "asc" ? "desc" : "asc" }
        : { key, dir: "asc" },
    );
  }

  function changeSort(key: SortKey, dir: SortDir) {
    setCandidates(null);
    setSort({ key, dir });
  }

  const count = candidates?.length ?? 0;

  return (
    <div>
      <PageHeader
        title="מועמדים"
        description={
          candidates ? `${count} מועמדים תואמים לסינון` : "טוען מועמדים..."
        }
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
          setFilters(EMPTY_FILTERS);
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
          <EmptyState
            icon={filters.search || filters.status !== "all" ? SlidersHorizontal : Users}
            title="לא נמצאו מועמדים"
            description="נסו לשנות את מסנני החיפוש או לנקות אותם."
          />
        ) : (
          <>
            <CandidateTable candidates={candidates} onSort={toggleSort} />
            <div className="flex flex-col gap-3 lg:hidden">
              {candidates.map((c) => (
                <CandidateCard key={c.id} candidate={c} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

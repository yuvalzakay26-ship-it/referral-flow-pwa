/**
 * Shared types for the candidate service. Kept in a plain (non-"use server")
 * module so they can be imported by client components — a "use server" file may
 * only export async functions.
 */

import type { Candidate, CandidateStatus } from "@/types";

export interface CandidateFilters {
  search?: string;
  status?: CandidateStatus | "all";
  field?: string | "all";
  source?: string | "all";
  eligibility?: string | "all";
  bonus?: string | "all";
  employmentType?: string | "all";
  followUp?: "all" | "with" | "without" | "overdue" | "due";
  fromDate?: string;
  toDate?: string;
}

export type SortKey =
  | "created_at"
  | "full_name"
  | "status"
  | "follow_up_date"
  | "updated_at";
export type SortDir = "asc" | "desc";

/**
 * A potential-duplicate match found by normalized phone or email. This is an
 * INTERNAL heuristic only — it never confirms whether the candidate already
 * exists in external recruitment systems.
 */
export interface DuplicateMatch {
  candidate: Candidate;
  reason: "phone" | "email";
}

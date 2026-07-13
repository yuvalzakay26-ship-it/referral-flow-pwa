/**
 * Candidate service — all candidate data access goes through here.
 * Mock mode uses the in-memory store; swap the bodies for Supabase queries later.
 */

import type {
  Candidate,
  CandidateNote,
  CandidateStatus,
  CandidateStatusHistory,
  CandidateSubmission,
  SubmissionResult,
} from "@/types";
import { store, delay, nextId } from "./store";
import { deriveEligibility } from "@/lib/validation";
import { generateReferenceNumber, sanitizeFileName } from "@/lib/utils";

export interface CandidateFilters {
  search?: string;
  status?: CandidateStatus | "all";
  field?: string | "all";
  source?: string | "all";
  eligibility?: string | "all";
  fromDate?: string;
  toDate?: string;
}

export type SortKey = "created_at" | "full_name" | "status";
export type SortDir = "asc" | "desc";

function isoNow(): string {
  return new Date().toISOString();
}

export async function listCandidates(
  filters: CandidateFilters = {},
  sort: { key: SortKey; dir: SortDir } = { key: "created_at", dir: "desc" },
): Promise<Candidate[]> {
  let items = [...store.candidates];

  if (filters.search) {
    const q = filters.search.toLowerCase();
    items = items.filter(
      (c) =>
        c.full_name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.phone.includes(q) ||
        c.reference_number.toLowerCase().includes(q) ||
        c.professional_field.toLowerCase().includes(q),
    );
  }
  if (filters.status && filters.status !== "all") {
    items = items.filter((c) => c.status === filters.status);
  }
  if (filters.field && filters.field !== "all") {
    items = items.filter((c) => c.professional_field === filters.field);
  }
  if (filters.source && filters.source !== "all") {
    items = items.filter((c) => c.source === filters.source);
  }
  if (filters.eligibility && filters.eligibility !== "all") {
    items = items.filter((c) => c.eligibility_status === filters.eligibility);
  }
  if (filters.fromDate) {
    items = items.filter((c) => c.created_at >= filters.fromDate!);
  }
  if (filters.toDate) {
    // include the whole "to" day
    const to = filters.toDate + "T23:59:59.999Z";
    items = items.filter((c) => c.created_at <= to);
  }

  items.sort((a, b) => {
    let cmp = 0;
    if (sort.key === "full_name") cmp = a.full_name.localeCompare(b.full_name, "he");
    else if (sort.key === "status") cmp = a.status.localeCompare(b.status);
    else cmp = a.created_at.localeCompare(b.created_at);
    return sort.dir === "asc" ? cmp : -cmp;
  });

  return delay(items);
}

export async function getCandidate(id: string): Promise<Candidate | null> {
  return delay(store.candidates.find((c) => c.id === id) ?? null);
}

export async function getStatusHistory(
  candidateId: string,
): Promise<CandidateStatusHistory[]> {
  const items = store.history
    .filter((h) => h.candidate_id === candidateId)
    .sort((a, b) => b.created_at.localeCompare(a.created_at));
  return delay(items);
}

export async function getNotes(candidateId: string): Promise<CandidateNote[]> {
  const items = store.notes
    .filter((n) => n.candidate_id === candidateId)
    .sort((a, b) => b.created_at.localeCompare(a.created_at));
  return delay(items);
}

export async function updateCandidateStatus(
  id: string,
  status: CandidateStatus,
  changedBy: string,
  note?: string,
): Promise<Candidate | null> {
  const candidate = store.candidates.find((c) => c.id === id);
  if (!candidate) return delay(null);
  const from = candidate.status;
  candidate.status = status;
  candidate.updated_at = isoNow();
  if (status === "bonus_pending") candidate.bonus_status = "pending";
  if (status === "bonus_received") candidate.bonus_status = "received";
  store.history.push({
    id: nextId("h"),
    candidate_id: id,
    from_status: from,
    to_status: status,
    changed_by: changedBy,
    note: note ?? null,
    created_at: isoNow(),
  });
  return delay(candidate);
}

export async function addNote(
  candidateId: string,
  author: string,
  body: string,
): Promise<CandidateNote> {
  const note: CandidateNote = {
    id: nextId("n"),
    candidate_id: candidateId,
    author,
    body,
    created_at: isoNow(),
  };
  store.notes.push(note);
  return delay(note);
}

export async function updateCandidate(
  id: string,
  patch: Partial<Candidate>,
): Promise<Candidate | null> {
  const candidate = store.candidates.find((c) => c.id === id);
  if (!candidate) return delay(null);
  Object.assign(candidate, patch, { updated_at: isoNow() });
  return delay(candidate);
}

export async function setFollowUp(
  id: string,
  date: string | null,
): Promise<Candidate | null> {
  return updateCandidate(id, { follow_up_date: date });
}

/**
 * Create a candidate from a public submission. In mock mode this appends to the
 * in-memory store and returns a reference number. In Supabase mode this should
 * run through a secure server action / API route with server-side validation.
 */
export async function createCandidate(
  submission: CandidateSubmission,
  referenceOverride?: string,
): Promise<SubmissionResult> {
  const now = isoNow();
  const id = nextId("c");
  const reference = referenceOverride ?? generateReferenceNumber();
  const eligibility = deriveEligibility(submission);
  const candidate: Candidate = {
    id,
    reference_number: reference,
    full_name: submission.full_name,
    phone: submission.phone,
    email: submission.email,
    city: submission.city,
    professional_field: submission.professional_field,
    current_role: submission.current_role,
    years_of_experience: submission.years_of_experience,
    education: submission.education,
    study_year: submission.study_year ?? null,
    preferred_job_types: submission.preferred_job_types,
    preferred_locations: submission.preferred_locations,
    professional_summary: submission.professional_summary,
    cv_file_name: submission.cv_file_name
      ? sanitizeFileName(submission.cv_file_name)
      : null,
    cv_storage_path: submission.cv_file_name
      ? `cvs/${id}/${sanitizeFileName(submission.cv_file_name)}`
      : null,
    applied_last_12_months: submission.applied_last_12_months,
    referred_by_another_employee: submission.referred_by_another_employee,
    contacted_recruiter_before: submission.contacted_recruiter_before,
    eligibility_status: eligibility,
    source: submission.source,
    status: "new",
    internal_notes: "",
    referral_date: null,
    referred_position: null,
    follow_up_date: null,
    bonus_status: "none",
    bonus_amount: null,
    created_at: now,
    updated_at: now,
  };
  store.candidates.unshift(candidate);
  store.history.push({
    id: nextId("h"),
    candidate_id: id,
    from_status: null,
    to_status: "new",
    changed_by: "system",
    note: "מועמדות חדשה התקבלה.",
    created_at: now,
  });
  return delay({
    reference_number: reference,
    full_name: submission.full_name,
    created_at: now,
  });
}

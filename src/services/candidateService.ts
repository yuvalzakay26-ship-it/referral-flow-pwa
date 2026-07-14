/**
 * Candidate service — all candidate data access goes through here.
 * Mock mode uses the in-memory store; swap the bodies for Supabase queries later.
 */

import type {
  Candidate,
  CandidateInput,
  CandidateNote,
  CandidateStatus,
  CandidateStatusHistory,
} from "@/types";
import { store, delay, nextId } from "./store";
import { deriveEligibility } from "@/lib/validation";
import {
  generateReferenceNumber,
  sanitizeFileName,
  normalizePhone,
} from "@/lib/utils";

export interface CandidateFilters {
  search?: string;
  status?: CandidateStatus | "all";
  field?: string | "all";
  source?: string | "all";
  eligibility?: string | "all";
  bonus?: string | "all";
  employmentType?: string | "all";
  followUp?: "all" | "with" | "without" | "overdue";
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
        c.professional_field.toLowerCase().includes(q) ||
        c.current_role.toLowerCase().includes(q) ||
        (c.technical_skills ?? []).some((s) => s.toLowerCase().includes(q)),
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
  if (filters.bonus && filters.bonus !== "all") {
    items = items.filter((c) => c.bonus_status === filters.bonus);
  }
  if (filters.employmentType && filters.employmentType !== "all") {
    items = items.filter((c) =>
      c.preferred_job_types.includes(filters.employmentType as never),
    );
  }
  if (filters.followUp && filters.followUp !== "all") {
    const today = new Date().toISOString().slice(0, 10);
    if (filters.followUp === "with") {
      items = items.filter((c) => Boolean(c.follow_up_date));
    } else if (filters.followUp === "without") {
      items = items.filter((c) => !c.follow_up_date);
    } else if (filters.followUp === "overdue") {
      items = items.filter((c) => c.follow_up_date && c.follow_up_date < today);
    }
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
    if (sort.key === "full_name")
      cmp = a.full_name.localeCompare(b.full_name, "he");
    else if (sort.key === "status") cmp = a.status.localeCompare(b.status);
    else if (sort.key === "updated_at")
      cmp = a.updated_at.localeCompare(b.updated_at);
    else if (sort.key === "follow_up_date") {
      // Records without a follow-up date sort last regardless of direction.
      const av = a.follow_up_date ?? "";
      const bv = b.follow_up_date ?? "";
      if (!av && !bv) cmp = 0;
      else if (!av) return 1;
      else if (!bv) return -1;
      else cmp = av.localeCompare(bv);
    } else cmp = a.created_at.localeCompare(b.created_at);
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
 * A potential-duplicate match found by normalized phone or email.
 * This is an INTERNAL heuristic only — it never confirms whether the candidate
 * already exists in NESS recruitment systems.
 */
export interface DuplicateMatch {
  candidate: Candidate;
  reason: "phone" | "email";
}

/**
 * Find existing mock candidates that share a normalized phone or email with the
 * given values. Used to warn the administrator before saving. Optionally
 * excludes a candidate id (when editing an existing record).
 */
export async function findDuplicates(
  phone: string,
  email: string,
  excludeId?: string,
): Promise<DuplicateMatch[]> {
  const normPhone = normalizePhone(phone);
  const normEmail = email.trim().toLowerCase();
  const matches: DuplicateMatch[] = [];
  for (const c of store.candidates) {
    if (excludeId && c.id === excludeId) continue;
    if (normPhone && normalizePhone(c.phone) === normPhone) {
      matches.push({ candidate: c, reason: "phone" });
    } else if (normEmail && c.email.trim().toLowerCase() === normEmail) {
      matches.push({ candidate: c, reason: "email" });
    }
  }
  return delay(matches, 60);
}

/**
 * Create a candidate from an admin manual-entry payload. In mock mode this
 * appends to the in-memory store. In Supabase mode this should run through a
 * secure server action using the service-role client behind RLS, with the CV
 * uploaded to the private `cvs` bucket. No candidate data is logged.
 */
export async function createCandidate(
  input: CandidateInput,
): Promise<Candidate> {
  const now = isoNow();
  const id = nextId("c");
  const reference = generateReferenceNumber();
  const eligibility = input.eligibility_status ?? deriveEligibility(input);
  const cvName = input.cv_file_name ? sanitizeFileName(input.cv_file_name) : null;
  const status = input.status ?? "new";
  const candidate: Candidate = {
    id,
    reference_number: reference,
    full_name: input.full_name,
    phone: input.phone,
    email: input.email,
    city: input.city,
    linkedin_url: input.linkedin_url ?? null,
    whatsapp_number: input.whatsapp_number || input.phone,
    professional_field: input.professional_field,
    current_role: input.current_role,
    years_of_experience: input.years_of_experience,
    education: input.education,
    study_year: input.study_year ?? null,
    preferred_job_types: input.preferred_job_types,
    preferred_locations: input.preferred_locations,
    preferred_job_categories: input.preferred_job_categories ?? [],
    technical_skills: input.technical_skills ?? [],
    professional_summary: input.professional_summary,
    cv_file_name: cvName,
    cv_storage_path: cvName ? `cvs/${id}/${cvName}` : null,
    applied_last_12_months: input.applied_last_12_months,
    referred_by_another_employee: input.referred_by_another_employee,
    contacted_recruiter_before: input.contacted_recruiter_before,
    eligibility_status: eligibility,
    source: input.source,
    source_details: input.source_details ?? "",
    date_received: input.date_received ?? now,
    status,
    internal_notes: input.internal_notes ?? "",
    referral_date: input.referral_date ?? null,
    referred_position: input.referred_position ?? null,
    general_category: input.general_category ?? null,
    follow_up_date: input.follow_up_date ?? null,
    bonus_status: input.bonus_status ?? "none",
    bonus_amount: input.bonus_amount ?? null,
    closure_reason: input.closure_reason ?? null,
    created_at: now,
    updated_at: now,
  };
  store.candidates.unshift(candidate);
  store.history.push({
    id: nextId("h"),
    candidate_id: id,
    from_status: null,
    to_status: status,
    changed_by: "admin",
    note: "הרשומה נוצרה ידנית על ידי המנהל.",
    created_at: now,
  });
  return delay(candidate);
}

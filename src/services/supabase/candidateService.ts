import "server-only";

/**
 * Candidate service — SUPABASE implementation. All access is owner-scoped by
 * RLS via the cookie-bound session (requireOwner). No candidate PII is logged.
 */

import type {
  Candidate,
  CandidateInput,
  CandidateNote,
  CandidateStatus,
  CandidateStatusHistory,
} from "@/types";
import { requireOwner } from "@/lib/supabase/guard";
import { deriveEligibility } from "@/lib/eligibility";
import { generateReferenceNumber, normalizePhone } from "@/lib/utils";
import type {
  CandidateFilters,
  SortKey,
  SortDir,
  DuplicateMatch,
} from "../candidateService.types";
import { removeCandidateCvObjects } from "./cvService";

const CANDIDATE_COLUMNS = "*";
const LIST_LIMIT = 500;

function orderColumn(key: SortKey): string {
  return key; // column names match the SortKey values 1:1
}

export async function listCandidates(
  filters: CandidateFilters = {},
  sort: { key: SortKey; dir: SortDir } = { key: "created_at", dir: "desc" },
): Promise<Candidate[]> {
  const { supabase } = await requireOwner();
  let query = supabase
    .from("candidates")
    .select(CANDIDATE_COLUMNS)
    .limit(LIST_LIMIT);

  if (filters.status && filters.status !== "all") {
    const set = String(filters.status).split(",");
    query = query.in("status", set);
  }
  if (filters.field && filters.field !== "all") {
    query = query.eq("professional_field", filters.field);
  }
  if (filters.source && filters.source !== "all") {
    query = query.eq("source", filters.source);
  }
  if (filters.eligibility && filters.eligibility !== "all") {
    query = query.eq("eligibility_status", filters.eligibility);
  }
  if (filters.bonus && filters.bonus !== "all") {
    query = query.eq("bonus_status", filters.bonus);
  }
  if (filters.employmentType && filters.employmentType !== "all") {
    query = query.contains("preferred_job_types", [filters.employmentType]);
  }
  if (filters.followUp && filters.followUp !== "all") {
    const today = new Date().toISOString().slice(0, 10);
    if (filters.followUp === "with") query = query.not("follow_up_date", "is", null);
    else if (filters.followUp === "without") query = query.is("follow_up_date", null);
    else if (filters.followUp === "overdue") query = query.lt("follow_up_date", today);
    else if (filters.followUp === "due") query = query.lte("follow_up_date", today);
  }
  if (filters.fromDate) query = query.gte("created_at", filters.fromDate);
  if (filters.toDate) query = query.lte("created_at", filters.toDate + "T23:59:59.999Z");
  if (filters.search) {
    const q = filters.search.replace(/[%,()]/g, " ").trim();
    if (q) {
      // Case-insensitive match across the key searchable text columns.
      query = query.or(
        [
          `full_name.ilike.%${q}%`,
          `email.ilike.%${q}%`,
          `phone.ilike.%${q}%`,
          `reference_number.ilike.%${q}%`,
          `professional_field.ilike.%${q}%`,
          `current_role.ilike.%${q}%`,
        ].join(","),
      );
    }
  }

  // follow_up_date: nulls last regardless of direction.
  query = query.order(orderColumn(sort.key), {
    ascending: sort.dir === "asc",
    nullsFirst: false,
  });

  const { data, error } = await query;
  if (error) throw new Error("שגיאה בטעינת המועמדים.");
  return (data ?? []) as unknown as Candidate[];
}

export async function getCandidate(id: string): Promise<Candidate | null> {
  const { supabase } = await requireOwner();
  const { data, error } = await supabase
    .from("candidates")
    .select(CANDIDATE_COLUMNS)
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error("שגיאה בטעינת המועמד.");
  return (data as unknown as Candidate) ?? null;
}

export async function getStatusHistory(
  candidateId: string,
): Promise<CandidateStatusHistory[]> {
  const { supabase } = await requireOwner();
  const { data, error } = await supabase
    .from("candidate_status_history")
    .select("*")
    .eq("candidate_id", candidateId)
    .order("created_at", { ascending: false });
  if (error) throw new Error("שגיאה בטעינת ההיסטוריה.");
  return (data ?? []) as unknown as CandidateStatusHistory[];
}

export async function getNotes(candidateId: string): Promise<CandidateNote[]> {
  const { supabase } = await requireOwner();
  const { data, error } = await supabase
    .from("candidate_notes")
    .select("*")
    .eq("candidate_id", candidateId)
    .order("created_at", { ascending: false });
  if (error) throw new Error("שגיאה בטעינת ההערות.");
  return (data ?? []) as unknown as CandidateNote[];
}

export async function updateCandidateStatus(
  id: string,
  status: CandidateStatus,
  changedBy: string,
  note?: string,
): Promise<Candidate | null> {
  const { supabase } = await requireOwner();
  const current = await getCandidate(id);
  if (!current) return null;

  const patch: Partial<Candidate> = { status };
  if (status === "bonus_pending") patch.bonus_status = "pending";
  if (status === "bonus_received") patch.bonus_status = "received";

  const { data, error } = await supabase
    .from("candidates")
    .update(patch)
    .eq("id", id)
    .select(CANDIDATE_COLUMNS)
    .single();
  if (error) throw new Error("שגיאה בעדכון הסטטוס.");

  const { error: histError } = await supabase
    .from("candidate_status_history")
    .insert({
      candidate_id: id,
      from_status: current.status,
      to_status: status,
      changed_by: changedBy,
      note: note ?? null,
    });
  if (histError) throw new Error("שגיאה בשמירת ההיסטוריה.");

  return data as unknown as Candidate;
}

export async function addNote(
  candidateId: string,
  author: string,
  body: string,
): Promise<CandidateNote> {
  const { supabase } = await requireOwner();
  const { data, error } = await supabase
    .from("candidate_notes")
    .insert({ candidate_id: candidateId, author, body })
    .select("*")
    .single();
  if (error) throw new Error("שגיאה בשמירת ההערה.");
  return data as unknown as CandidateNote;
}

export async function updateCandidate(
  id: string,
  patch: Partial<Candidate>,
): Promise<Candidate | null> {
  const { supabase } = await requireOwner();
  // Never allow client-supplied identity/audit columns to be overwritten.
  const {
    id: _id,
    reference_number: _ref,
    created_at: _c,
    updated_at: _u,
    ...safe
  } = patch;
  void _id;
  void _ref;
  void _c;
  void _u;
  const { data, error } = await supabase
    .from("candidates")
    .update(safe)
    .eq("id", id)
    .select(CANDIDATE_COLUMNS)
    .maybeSingle();
  if (error) throw new Error("שגיאה בעדכון המועמד.");
  return (data as unknown as Candidate) ?? null;
}

export async function setFollowUp(
  id: string,
  date: string | null,
): Promise<Candidate | null> {
  return updateCandidate(id, { follow_up_date: date });
}

export async function findDuplicates(
  phone: string,
  email: string,
  excludeId?: string,
): Promise<DuplicateMatch[]> {
  const { supabase } = await requireOwner();
  const normPhone = normalizePhone(phone);
  const normEmail = email.trim().toLowerCase();
  if (!normPhone && !normEmail) return [];

  // Fetch candidates whose email matches OR who have a phone, then normalize
  // and compare in memory (single-owner scale). Email is matched precisely;
  // phone is normalized to digits to ignore formatting differences.
  const { data, error } = await supabase
    .from("candidates")
    .select(CANDIDATE_COLUMNS)
    .limit(LIST_LIMIT);
  if (error) throw new Error("שגיאה בבדיקת כפילויות.");

  const matches: DuplicateMatch[] = [];
  for (const c of (data ?? []) as unknown as Candidate[]) {
    if (excludeId && c.id === excludeId) continue;
    if (normPhone && normalizePhone(c.phone) === normPhone) {
      matches.push({ candidate: c, reason: "phone" });
    } else if (normEmail && c.email.trim().toLowerCase() === normEmail) {
      matches.push({ candidate: c, reason: "email" });
    }
  }
  return matches;
}

export async function createCandidate(
  input: CandidateInput,
): Promise<Candidate> {
  const { supabase } = await requireOwner();
  const reference = generateReferenceNumber();
  const eligibility = input.eligibility_status ?? deriveEligibility(input);
  const status = input.status ?? "new";

  const row = {
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
    // CV bytes (if any) are uploaded separately via cvService after creation.
    applied_last_12_months: input.applied_last_12_months,
    referred_by_another_employee: input.referred_by_another_employee,
    contacted_recruiter_before: input.contacted_recruiter_before,
    eligibility_status: eligibility,
    source: input.source,
    source_details: input.source_details ?? "",
    date_received: input.date_received ?? new Date().toISOString().slice(0, 10),
    status,
    internal_notes: input.internal_notes ?? "",
    referral_date: input.referral_date ?? null,
    referred_position: input.referred_position ?? null,
    general_category: input.general_category ?? null,
    follow_up_date: input.follow_up_date ?? null,
    bonus_status: input.bonus_status ?? "none",
    bonus_amount: input.bonus_amount ?? null,
    closure_reason: input.closure_reason ?? null,
  };

  const { data, error } = await supabase
    .from("candidates")
    .insert(row)
    .select(CANDIDATE_COLUMNS)
    .single();
  if (error) throw new Error("שגיאה ביצירת המועמד.");
  const candidate = data as unknown as Candidate;

  const { error: histError } = await supabase
    .from("candidate_status_history")
    .insert({
      candidate_id: candidate.id,
      from_status: null,
      to_status: status,
      changed_by: "admin",
      note: "הרשומה נוצרה ידנית על ידי המנהל.",
    });
  if (histError) throw new Error("שגיאה בשמירת ההיסטוריה.");

  return candidate;
}

export async function deleteCandidate(id: string): Promise<boolean> {
  const { supabase } = await requireOwner();
  // Remove the CV objects first (best-effort), then delete the row. Related
  // notes / history / follow-ups cascade via ON DELETE CASCADE.
  await removeCandidateCvObjects(id).catch(() => undefined);
  const { error } = await supabase.from("candidates").delete().eq("id", id);
  if (error) throw new Error("שגיאה במחיקת המועמד.");
  return true;
}

/**
 * Core domain types for ReferralFlow.
 * These mirror the planned Supabase schema (see supabase/schema.sql).
 */

// ---------------------------------------------------------------------------
// Candidate status
// ---------------------------------------------------------------------------

export type CandidateStatus =
  | "new"
  | "pending_review"
  | "missing_details"
  | "possible_duplicate"
  | "transferred"
  | "in_recruitment"
  | "not_suitable"
  | "accepted"
  | "bonus_pending"
  | "bonus_received"
  | "closed";

// ---------------------------------------------------------------------------
// Eligibility
// ---------------------------------------------------------------------------

/** Answer to a yes / no / unsure eligibility question. */
export type YesNoUnsure = "yes" | "no" | "unsure";

/** Derived eligibility standing for referral. */
export type EligibilityStatus = "eligible" | "review" | "likely_existing";

// ---------------------------------------------------------------------------
// Bonus
// ---------------------------------------------------------------------------

export type BonusStatus = "none" | "not_eligible" | "pending" | "received";

// ---------------------------------------------------------------------------
// Sources
// ---------------------------------------------------------------------------

export type SourceKey =
  | "whatsapp-channel"
  | "whatsapp-group"
  | "facebook"
  | "linkedin"
  | "friend"
  | "college-group"
  | "direct-link"
  | "other";

// ---------------------------------------------------------------------------
// Employment preferences
// ---------------------------------------------------------------------------

export type JobType =
  | "full_time"
  | "part_time"
  | "student"
  | "shifts"
  | "flexible";

// ---------------------------------------------------------------------------
// Candidate
// ---------------------------------------------------------------------------

export interface Candidate {
  id: string;
  reference_number: string;
  full_name: string;
  phone: string;
  email: string;
  city: string;
  /** Personal — optional links / contact. */
  linkedin_url?: string | null;
  /** WhatsApp number; defaults to `phone` when not set separately. */
  whatsapp_number?: string | null;
  professional_field: string;
  current_role: string;
  years_of_experience: number;
  education: string;
  study_year: string | null;
  preferred_job_types: JobType[];
  preferred_locations: string[];
  /** Preferred job categories (broader than a single professional field). */
  preferred_job_categories?: string[];
  /** Free-form technical skills / keywords. */
  technical_skills?: string[];
  professional_summary: string;
  cv_file_name: string | null;
  cv_storage_path: string | null;
  applied_last_12_months: YesNoUnsure;
  referred_by_another_employee: YesNoUnsure;
  contacted_recruiter_before: YesNoUnsure;
  eligibility_status: EligibilityStatus;
  source: SourceKey;
  /** Source details / group name (e.g. the specific WhatsApp group). */
  source_details?: string;
  /** Date the candidate was received (may differ from created_at). */
  date_received?: string | null;
  status: CandidateStatus;
  internal_notes: string;
  referral_date: string | null;
  referred_position: string | null;
  /** General professional category when there is no specific position. */
  general_category?: string | null;
  follow_up_date: string | null;
  bonus_status: BonusStatus;
  bonus_amount: number | null;
  /** Optional rejection / closure reason. */
  closure_reason?: string | null;
  created_at: string;
  updated_at: string;
}

// ---------------------------------------------------------------------------
// Status history
// ---------------------------------------------------------------------------

export interface CandidateStatusHistory {
  id: string;
  candidate_id: string;
  from_status: CandidateStatus | null;
  to_status: CandidateStatus;
  changed_by: string;
  note: string | null;
  created_at: string;
}

// ---------------------------------------------------------------------------
// Notes
// ---------------------------------------------------------------------------

export interface CandidateNote {
  id: string;
  candidate_id: string;
  author: string;
  body: string;
  created_at: string;
}

// ---------------------------------------------------------------------------
// Jobs
// ---------------------------------------------------------------------------

export type JobPriority = "low" | "medium" | "high";
export type JobStatus = "draft" | "published";

export interface Job {
  id: string;
  title: string;
  category: string;
  location: string;
  employment_type: JobType;
  short_description: string;
  requirements: string[];
  priority: JobPriority;
  status: JobStatus;
  /** Internal notes — never included in a generated post. */
  internal_notes: string;
  /** Optional external reference (e.g. an internal req id). */
  external_reference: string;
  /** Active/inactive (archived) flag. */
  is_active: boolean;
  created_at: string;
}

// ---------------------------------------------------------------------------
// Message templates
// ---------------------------------------------------------------------------

export type MessageTemplateKey =
  | "initial"
  | "missing_details"
  | "request_cv"
  | "cv_received"
  | "transferred"
  | "possible_duplicate"
  | "not_suitable"
  | "follow_up"
  | "congratulations"
  | "bonus_not_eligible";

export interface MessageTemplate {
  key: MessageTemplateKey;
  title: string;
  body: string;
}

// ---------------------------------------------------------------------------
// Follow-ups
// ---------------------------------------------------------------------------

export interface FollowUp {
  id: string;
  candidate_id: string;
  due_date: string;
  note: string;
  done: boolean;
  created_at: string;
}

// ---------------------------------------------------------------------------
// App settings
// ---------------------------------------------------------------------------

export interface AppSettings {
  app_name: string;
  admin_display_name: string;
  default_whatsapp_number: string;
  whatsapp_channel_url: string;
  /** Configurable closing line appended to generated job posts. */
  default_job_post_ending: string;
  /** Public disclaimer text included in generated job posts. */
  disclaimer_text: string;
  default_follow_up_days: number;
  /** Optional default referral bonus amount (ILS). */
  default_bonus_amount: number | null;
}

// ---------------------------------------------------------------------------
// Admin users
// ---------------------------------------------------------------------------

export interface AdminUser {
  id: string;
  email: string;
  display_name: string;
  created_at: string;
}

// ---------------------------------------------------------------------------
// Candidate input payload (admin manual entry -> service)
//
// This is an internal, admin-only payload. There is NO public submission path.
// The administrator creates and edits records manually inside the admin area.
// ---------------------------------------------------------------------------

export interface CandidateInput {
  full_name: string;
  phone: string;
  email: string;
  city: string;
  linkedin_url?: string | null;
  whatsapp_number?: string | null;
  professional_field: string;
  current_role: string;
  years_of_experience: number;
  education: string;
  study_year?: string | null;
  preferred_job_types: JobType[];
  preferred_locations: string[];
  preferred_job_categories?: string[];
  technical_skills?: string[];
  professional_summary: string;
  cv_file_name?: string | null;
  applied_last_12_months: YesNoUnsure;
  referred_by_another_employee: YesNoUnsure;
  contacted_recruiter_before: YesNoUnsure;
  eligibility_status?: EligibilityStatus;
  source: SourceKey;
  source_details?: string;
  date_received?: string | null;
  status?: CandidateStatus;
  internal_notes?: string;
  referral_date?: string | null;
  referred_position?: string | null;
  general_category?: string | null;
  follow_up_date?: string | null;
  bonus_status?: BonusStatus;
  bonus_amount?: number | null;
  closure_reason?: string | null;
}

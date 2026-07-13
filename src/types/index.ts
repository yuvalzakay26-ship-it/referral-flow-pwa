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

export type BonusStatus = "none" | "pending" | "received";

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
  professional_field: string;
  current_role: string;
  years_of_experience: number;
  education: string;
  study_year: string | null;
  preferred_job_types: JobType[];
  preferred_locations: string[];
  professional_summary: string;
  cv_file_name: string | null;
  cv_storage_path: string | null;
  applied_last_12_months: YesNoUnsure;
  referred_by_another_employee: YesNoUnsure;
  contacted_recruiter_before: YesNoUnsure;
  eligibility_status: EligibilityStatus;
  source: SourceKey;
  status: CandidateStatus;
  internal_notes: string;
  referral_date: string | null;
  referred_position: string | null;
  follow_up_date: string | null;
  bonus_status: BonusStatus;
  bonus_amount: number | null;
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
  application_link: string;
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
  | "congratulations";

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
  admin_display_name: string;
  whatsapp_channel_url: string;
  default_whatsapp_number: string;
  disclaimer_text: string;
  privacy_notice: string;
  default_follow_up_days: number;
  app_name: string;
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
// Candidate submission payload (public form -> service)
// ---------------------------------------------------------------------------

export interface CandidateSubmission {
  full_name: string;
  phone: string;
  email: string;
  city: string;
  professional_field: string;
  current_role: string;
  years_of_experience: number;
  education: string;
  study_year?: string | null;
  preferred_job_types: JobType[];
  preferred_locations: string[];
  professional_summary: string;
  cv_file_name: string | null;
  applied_last_12_months: YesNoUnsure;
  referred_by_another_employee: YesNoUnsure;
  contacted_recruiter_before: YesNoUnsure;
  source: SourceKey;
  consent: boolean;
}

export interface SubmissionResult {
  reference_number: string;
  full_name: string;
  created_at: string;
}

import type { YesNoUnsure } from "@/types";
import { YES_NO_UNSURE_LABELS } from "@/config/eligibility";

/**
 * Shared form value shape for the candidate form and its section components.
 * Kept in one place so each extracted section can type its react-hook-form
 * props (register/control/errors) against the same source of truth.
 */
export type Values = {
  full_name: string;
  phone: string;
  email: string;
  city: string;
  linkedin_url: string;
  whatsapp_number: string;
  professional_field: string;
  current_role: string;
  years_of_experience: number;
  education: string;
  study_year: string;
  preferred_job_types: string[];
  preferred_locations: string[];
  preferred_job_categories: string[];
  technical_skills: string[];
  professional_summary: string;
  applied_last_12_months: YesNoUnsure;
  referred_by_another_employee: YesNoUnsure;
  contacted_recruiter_before: YesNoUnsure;
  source: string;
  source_details: string;
  date_received: string;
  referred_position: string;
  general_category: string;
  internal_notes: string;
  status: string;
  eligibility_status: string;
  referral_date: string;
  follow_up_date: string;
  bonus_status: string;
  bonus_amount: number | null;
  closure_reason: string;
};

export const yesNoOptions: { value: YesNoUnsure; label: string }[] = [
  { value: "yes", label: YES_NO_UNSURE_LABELS.yes },
  { value: "no", label: YES_NO_UNSURE_LABELS.no },
  { value: "unsure", label: YES_NO_UNSURE_LABELS.unsure },
];

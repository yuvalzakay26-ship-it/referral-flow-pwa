import { z } from "zod";
import {
  CV_ACCEPTED_EXTENSIONS,
  CV_MAX_SIZE_BYTES,
  CV_MAX_SIZE_MB,
} from "@/config/app";
import type { EligibilityStatus, YesNoUnsure } from "@/types";

const jobTypeEnum = z.enum([
  "full_time",
  "part_time",
  "student",
  "shifts",
  "flexible",
]);

const yesNoUnsure = z.enum(["yes", "no", "unsure"]);

const israeliPhone = z
  .string()
  .trim()
  .regex(/^0\d{1,2}-?\d{7}$|^\+?972\d{8,9}$/, "מספר טלפון לא תקין");

// ---------------------------------------------------------------------------
// Admin candidate form schema (manual entry — no public path, no consent)
// ---------------------------------------------------------------------------

export const candidateInputSchema = z.object({
  // Personal
  full_name: z.string().trim().min(2, "יש להזין שם מלא"),
  phone: israeliPhone,
  email: z.string().trim().email("כתובת אימייל לא תקינה"),
  city: z.string().trim().min(1, "יש להזין עיר או אזור"),
  linkedin_url: z
    .string()
    .trim()
    .url("כתובת URL לא תקינה")
    .or(z.literal(""))
    .optional(),
  whatsapp_number: z.string().trim().optional(),
  // Professional
  professional_field: z.string().trim().min(1, "יש לבחור תחום מקצועי"),
  current_role: z.string().trim().optional().default(""),
  years_of_experience: z
    .number({ message: "יש להזין מספר שנים" })
    .min(0, "ערך לא תקין")
    .max(60, "ערך לא תקין"),
  education: z.string().trim().optional().default(""),
  study_year: z.string().trim().optional().default(""),
  preferred_job_types: z.array(jobTypeEnum),
  preferred_locations: z.array(z.string()),
  preferred_job_categories: z.array(z.string()),
  technical_skills: z.array(z.string()),
  professional_summary: z.string().trim().max(2000, "עד 2000 תווים").default(""),
  // Referral
  applied_last_12_months: yesNoUnsure,
  referred_by_another_employee: yesNoUnsure,
  contacted_recruiter_before: yesNoUnsure,
  source: z.enum([
    "whatsapp-channel",
    "whatsapp-group",
    "facebook",
    "linkedin",
    "friend",
    "college-group",
    "direct-link",
    "other",
  ]),
  source_details: z.string().trim().optional().default(""),
  date_received: z.string().optional().default(""),
  referred_position: z.string().trim().optional().default(""),
  general_category: z.string().trim().optional().default(""),
  internal_notes: z.string().trim().optional().default(""),
  // Tracking
  status: z.enum([
    "new",
    "pending_review",
    "missing_details",
    "possible_duplicate",
    "transferred",
    "in_recruitment",
    "not_suitable",
    "accepted",
    "bonus_pending",
    "bonus_received",
    "closed",
  ]),
  eligibility_status: z.enum(["eligible", "review", "likely_existing"]),
  referral_date: z.string().optional().default(""),
  follow_up_date: z.string().optional().default(""),
  bonus_status: z.enum(["none", "not_eligible", "pending", "received"]),
  bonus_amount: z.number().min(0).nullable().optional(),
  closure_reason: z.string().trim().optional().default(""),
});

export type CandidateFormValues = z.infer<typeof candidateInputSchema>;

// --- CV file validation (safe, client + server) -----------------------------

export function validateCvFile(file: File): string | null {
  const ext = "." + (file.name.split(".").pop()?.toLowerCase() ?? "");
  if (
    !CV_ACCEPTED_EXTENSIONS.includes(
      ext as (typeof CV_ACCEPTED_EXTENSIONS)[number],
    )
  ) {
    return `יש להעלות קובץ מסוג PDF, DOC או DOCX`;
  }
  if (file.size > CV_MAX_SIZE_BYTES) {
    return `הקובץ גדול מדי (עד ${CV_MAX_SIZE_MB}MB)`;
  }
  if (file.size === 0) {
    return "הקובץ ריק";
  }
  return null;
}

// --- Eligibility derivation -------------------------------------------------

/**
 * Derive eligibility standing from the three referral questions.
 * If the candidate already applied or was already referred / contacted a
 * recruiter, they are likely already in the system and may not qualify as a
 * new referral.
 */
export function deriveEligibility(answers: {
  applied_last_12_months: YesNoUnsure;
  referred_by_another_employee: YesNoUnsure;
  contacted_recruiter_before: YesNoUnsure;
}): EligibilityStatus {
  const values = [
    answers.applied_last_12_months,
    answers.referred_by_another_employee,
    answers.contacted_recruiter_before,
  ];
  if (values.includes("yes")) return "likely_existing";
  if (values.includes("unsure")) return "review";
  return "eligible";
}

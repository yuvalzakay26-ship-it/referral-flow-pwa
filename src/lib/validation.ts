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

// --- Per-step schemas (used to validate the multi-step form incrementally) ---

export const step1Schema = z.object({
  full_name: z.string().trim().min(2, "יש להזין שם מלא"),
  phone: israeliPhone,
  email: z.string().trim().email("כתובת אימייל לא תקינה"),
  city: z.string().trim().min(2, "יש להזין עיר או אזור מגורים"),
});

export const step2Schema = z.object({
  professional_field: z.string().trim().min(1, "יש לבחור תחום מקצועי"),
  current_role: z.string().trim().min(2, "יש להזין תפקיד נוכחי"),
  years_of_experience: z
    .number({ message: "יש להזין מספר שנים" })
    .min(0, "ערך לא תקין")
    .max(60, "ערך לא תקין"),
  education: z.string().trim().min(1, "יש לבחור השכלה"),
  study_year: z.string().trim(),
  preferred_job_types: z
    .array(jobTypeEnum)
    .min(1, "יש לבחור לפחות סוג משרה אחד"),
  preferred_locations: z
    .array(z.string())
    .min(1, "יש לבחור לפחות אזור עבודה אחד"),
  professional_summary: z.string().trim().max(1000, "עד 1000 תווים"),
});

export const step4Schema = z.object({
  applied_last_12_months: yesNoUnsure,
  referred_by_another_employee: yesNoUnsure,
  contacted_recruiter_before: yesNoUnsure,
});

export const step5Schema = z.object({
  consent: z.literal(true, {
    message: "יש לאשר את תנאי השימוש ומדיניות הפרטיות",
  }),
});

// --- Full form schema (client side, without the File object) ---

export const candidateFormSchema = step1Schema
  .merge(step2Schema)
  .merge(step4Schema)
  .merge(step5Schema);

export type CandidateFormValues = z.infer<typeof candidateFormSchema>;

// --- Server submission schema (source injected, file validated separately) ---

export const submissionSchema = z.object({
  full_name: z.string().trim().min(2).max(120),
  phone: israeliPhone,
  email: z.string().trim().email(),
  city: z.string().trim().min(2).max(120),
  professional_field: z.string().trim().min(1).max(120),
  current_role: z.string().trim().min(2).max(120),
  years_of_experience: z.coerce.number().min(0).max(60),
  education: z.string().trim().min(1).max(120),
  study_year: z.string().trim().max(60).optional().nullable(),
  preferred_job_types: z.array(jobTypeEnum).min(1),
  preferred_locations: z.array(z.string().max(60)).min(1),
  professional_summary: z.string().trim().max(2000).optional().default(""),
  cv_file_name: z.string().max(200).nullable(),
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
  consent: z.literal(true),
});

// --- CV file validation (safe, server + client) ---

export function validateCvFile(file: File): string | null {
  const ext = "." + (file.name.split(".").pop()?.toLowerCase() ?? "");
  if (!CV_ACCEPTED_EXTENSIONS.includes(ext as (typeof CV_ACCEPTED_EXTENSIONS)[number])) {
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

// --- Eligibility derivation ---

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

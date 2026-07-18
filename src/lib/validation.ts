import { z } from "zod";

// Note: Zod-free business rules (deriveEligibility, validateCvFile) live in
// `@/lib/eligibility` so that data-access and list/dashboard code can use them
// without pulling Zod into routes that never validate a form. This module is
// intentionally the only Zod entry point for candidate data.

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
  city: z.string().trim().optional().default(""),
  linkedin_url: z
    .string()
    .trim()
    .url("כתובת URL לא תקינה")
    .or(z.literal(""))
    .optional(),
  whatsapp_number: z.string().trim().optional(),
  // Professional
  // Optional: the admin only forwards the CV; recruitment teams decide the
  // fit. Kept available for internal search, filters, and dashboard stats.
  professional_field: z.string().trim().optional().default(""),
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

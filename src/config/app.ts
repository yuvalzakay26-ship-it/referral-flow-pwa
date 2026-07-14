/**
 * Central application configuration derived from environment variables.
 * Everything degrades gracefully when env vars are missing so the app
 * compiles and runs in mock mode without any Supabase setup.
 */

export const APP_NAME = "ReferralFlow";
export const APP_SUBTITLE = "הפניות עבודה עם יובל";

/** True when Supabase is not configured OR mock mode is explicitly requested. */
export const USE_MOCK_DATA: boolean =
  process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true" ||
  !process.env.NEXT_PUBLIC_SUPABASE_URL ||
  !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export const WHATSAPP_CHANNEL_URL =
  process.env.NEXT_PUBLIC_WHATSAPP_CHANNEL_URL ?? "https://whatsapp.com/channel/";

export const WHATSAPP_NUMBER =
  process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "972500000000";

export const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? "admin@referralflow.local";

/**
 * Disclaimer appended to generated WhatsApp job posts. Honest language — no
 * promise of a response, interview, acceptance or bonus.
 */
export const DISCLAIMER_TEXT =
  "הפרסום נעשה במסגרת תוכנית הפניית עובדים. אין התחייבות לחזרה, לראיון או לקבלה.";

/** Configurable closing line for generated job posts (no public form link). */
export const JOB_POST_ENDING =
  "לשליחת קורות חיים ופרטים, ניתן לפנות אליי בהודעה פרטית.";

/** Shown privately in settings/about — this is NOT an official company system. */
export const NON_OFFICIAL_NOTICE =
  "המערכת היא כלי ניהול פרטי ואינה מערכת רשמית של NESS Technologies או Intel.";

/** Prominent warning shown across the admin area while mock mode is active. */
export const MOCK_MODE_WARNING =
  "מצב הדגמה פעיל — הנתונים נשמרים באופן זמני בלבד ואין להזין פרטים או קורות חיים אמיתיים.";

/** Default follow-up window in days. */
export const DEFAULT_FOLLOW_UP_DAYS = 7;

/** Default referral bonus amount (ILS), used as a form default. */
export const DEFAULT_BONUS_AMOUNT = 4000;

/** CV upload constraints. */
export const CV_MAX_SIZE_MB = 8;
export const CV_MAX_SIZE_BYTES = CV_MAX_SIZE_MB * 1024 * 1024;
export const CV_ACCEPTED_EXTENSIONS = [".pdf", ".doc", ".docx"] as const;
export const CV_ACCEPTED_MIME = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

/** Mock admin credentials (development only). */
export const MOCK_ADMIN = {
  email: "admin",
  password: "admin",
};

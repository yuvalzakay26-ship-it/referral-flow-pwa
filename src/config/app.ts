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

/** Public-facing legal / honesty copy reused across the app. */
export const DISCLAIMER_TEXT =
  "המועמדות מועברת לבדיקה בלבד. ההתאמה והמשך התהליך נקבעים על ידי צוותי הגיוס, ואין התחייבות לראיון או לקבלה.";

export const NON_OFFICIAL_NOTICE =
  "אתר זה הוא כלי פרטי לניהול הפניות עובדים ואינו אתר רשמי של NESS Technologies, Intel או כל חברה אחרת. אין באמור כאן משום ייצוג רשמי מטעם חברה כלשהי.";

export const PRIVACY_NOTICE =
  "הפרטים וקורות החיים שתשלחו נשמרים באופן מאובטח ומשמשים אך ורק לצורך בדיקת התאמה והעברה אפשרית לצוותי הגיוס הרלוונטיים. לא יועברו פרטים לגורמים שאינם רלוונטיים לתהליך, וניתן לבקש את הסרת הפרטים בכל עת.";

/** Default follow-up window in days. */
export const DEFAULT_FOLLOW_UP_DAYS = 7;

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

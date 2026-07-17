import type { CandidateStatus } from "@/types";

export interface StatusMeta {
  value: CandidateStatus;
  label: string;
  description: string;
  /**
   * Badge hue class. `.rf-badge` derives the tint, border and ink from the hue
   * per appearance (see globals.css), so one value serves dark and light.
   */
  badgeClass: string;
  /** Lucide icon name (resolved in components to avoid importing icons here). */
  icon: string;
}

/**
 * Single source of truth for candidate statuses.
 * Every status has an English enum, a Hebrew label, an icon, a badge style,
 * and a description.
 */
export const STATUSES: Record<CandidateStatus, StatusMeta> = {
  new: {
    value: "new",
    label: "חדש",
    description: "מועמדות חדשה שהתקבלה זה עתה וטרם נבדקה.",
    badgeClass: "rf-badge badge-cyan",
    icon: "Sparkles",
  },
  pending_review: {
    value: "pending_review",
    label: "ממתין לבדיקה",
    description: "המועמדות ממתינה לבדיקה ראשונית של הפרטים וקורות החיים.",
    badgeClass: "rf-badge badge-blue",
    icon: "Clock",
  },
  missing_details: {
    value: "missing_details",
    label: "חסרים פרטים",
    description: "נדרשים פרטים או מסמכים נוספים מהמועמד/ת.",
    badgeClass: "rf-badge badge-amber",
    icon: "AlertCircle",
  },
  possible_duplicate: {
    value: "possible_duplicate",
    label: "ייתכן שקיים במערכת",
    description: "ייתכן שהמועמד/ת כבר קיים/ת במערכת הגיוס ואינו/ה זכאי/ת כהפניה חדשה.",
    badgeClass: "rf-badge badge-fuchsia",
    icon: "Copy",
  },
  transferred: {
    value: "transferred",
    label: "הועבר לחברה",
    description: "קורות החיים הועברו לצוותי הגיוס לבדיקת התאמה.",
    badgeClass: "rf-badge badge-purple",
    icon: "Send",
  },
  in_recruitment: {
    value: "in_recruitment",
    label: "בתהליך גיוס",
    description: "המועמד/ת נמצא/ת בתהליך גיוס פעיל מול צוותי הגיוס.",
    badgeClass: "rf-badge badge-indigo",
    icon: "Workflow",
  },
  not_suitable: {
    value: "not_suitable",
    label: "לא נמצא מתאים",
    description: "לא נמצאה התאמה למשרה בשלב זה.",
    badgeClass: "rf-badge badge-slate",
    icon: "XCircle",
  },
  accepted: {
    value: "accepted",
    label: "התקבל",
    description: "המועמד/ת התקבל/ה לעבודה.",
    badgeClass: "rf-badge badge-emerald",
    icon: "CheckCircle2",
  },
  bonus_pending: {
    value: "bonus_pending",
    label: "בונוס בהמתנה",
    description: "המועמד/ת התקבל/ה ובונוס ההפניה ממתין לאישור או תשלום.",
    badgeClass: "rf-badge badge-orange",
    icon: "Hourglass",
  },
  bonus_received: {
    value: "bonus_received",
    label: "בונוס התקבל",
    description: "בונוס ההפניה שולם בהצלחה.",
    badgeClass: "rf-badge badge-green",
    icon: "BadgeCheck",
  },
  closed: {
    value: "closed",
    label: "נסגר",
    description: "המועמדות נסגרה ואינה פעילה עוד.",
    badgeClass: "rf-badge badge-zinc",
    icon: "Archive",
  },
};

export const STATUS_ORDER: CandidateStatus[] = [
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
];

export const STATUS_LIST: StatusMeta[] = STATUS_ORDER.map((s) => STATUSES[s]);

export function getStatusMeta(status: CandidateStatus): StatusMeta {
  return STATUSES[status];
}

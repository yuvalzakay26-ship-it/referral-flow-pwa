import type { CandidateStatus } from "@/types";

export interface StatusMeta {
  value: CandidateStatus;
  label: string;
  description: string;
  /** Tailwind classes for the badge (glass style with colored accent). */
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
    badgeClass: "bg-cyan-500/15 text-cyan-300 border-cyan-400/30",
    icon: "Sparkles",
  },
  pending_review: {
    value: "pending_review",
    label: "ממתין לבדיקה",
    description: "המועמדות ממתינה לבדיקה ראשונית של הפרטים וקורות החיים.",
    badgeClass: "bg-blue-500/15 text-blue-300 border-blue-400/30",
    icon: "Clock",
  },
  missing_details: {
    value: "missing_details",
    label: "חסרים פרטים",
    description: "נדרשים פרטים או מסמכים נוספים מהמועמד/ת.",
    badgeClass: "bg-amber-500/15 text-amber-300 border-amber-400/30",
    icon: "AlertCircle",
  },
  possible_duplicate: {
    value: "possible_duplicate",
    label: "ייתכן שקיים במערכת",
    description: "ייתכן שהמועמד/ת כבר קיים/ת במערכת הגיוס ואינו/ה זכאי/ת כהפניה חדשה.",
    badgeClass: "bg-fuchsia-500/15 text-fuchsia-300 border-fuchsia-400/30",
    icon: "Copy",
  },
  transferred: {
    value: "transferred",
    label: "הועבר לחברה",
    description: "קורות החיים הועברו לצוותי הגיוס לבדיקת התאמה.",
    badgeClass: "bg-purple-500/15 text-purple-300 border-purple-400/30",
    icon: "Send",
  },
  in_recruitment: {
    value: "in_recruitment",
    label: "בתהליך גיוס",
    description: "המועמד/ת נמצא/ת בתהליך גיוס פעיל מול צוותי הגיוס.",
    badgeClass: "bg-indigo-500/15 text-indigo-300 border-indigo-400/30",
    icon: "Workflow",
  },
  not_suitable: {
    value: "not_suitable",
    label: "לא נמצא מתאים",
    description: "לא נמצאה התאמה למשרה בשלב זה.",
    badgeClass: "bg-slate-500/15 text-slate-300 border-slate-400/30",
    icon: "XCircle",
  },
  accepted: {
    value: "accepted",
    label: "התקבל",
    description: "המועמד/ת התקבל/ה לעבודה.",
    badgeClass: "bg-emerald-500/15 text-emerald-300 border-emerald-400/30",
    icon: "CheckCircle2",
  },
  bonus_pending: {
    value: "bonus_pending",
    label: "בונוס בהמתנה",
    description: "המועמד/ת התקבל/ה ובונוס ההפניה ממתין לאישור או תשלום.",
    badgeClass: "bg-orange-500/15 text-orange-300 border-orange-400/30",
    icon: "Hourglass",
  },
  bonus_received: {
    value: "bonus_received",
    label: "בונוס התקבל",
    description: "בונוס ההפניה שולם בהצלחה.",
    badgeClass: "bg-green-500/15 text-green-300 border-green-400/30",
    icon: "BadgeCheck",
  },
  closed: {
    value: "closed",
    label: "נסגר",
    description: "המועמדות נסגרה ואינה פעילה עוד.",
    badgeClass: "bg-zinc-500/15 text-zinc-400 border-zinc-400/30",
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

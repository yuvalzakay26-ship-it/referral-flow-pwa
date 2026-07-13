import type { JobType } from "@/types";

export interface JobTypeMeta {
  value: JobType;
  label: string;
}

/** Employment / job type options used across the form and jobs board. */
export const JOB_TYPES: Record<JobType, JobTypeMeta> = {
  full_time: { value: "full_time", label: "משרה מלאה" },
  part_time: { value: "part_time", label: "משרה חלקית" },
  student: { value: "student", label: "משרת סטודנט" },
  shifts: { value: "shifts", label: "משמרות" },
  flexible: { value: "flexible", label: "גמיש" },
};

export const JOB_TYPE_LIST: JobTypeMeta[] = Object.values(JOB_TYPES);

export function getJobTypeLabel(value: JobType): string {
  return JOB_TYPES[value]?.label ?? value;
}

/** Professional fields offered in the candidate form. */
export const PROFESSIONAL_FIELDS: string[] = [
  "פיתוח תוכנה",
  "QA ובדיקות",
  "DevOps ותשתיות",
  "אבטחת מידע וסייבר",
  "דאטה ו-BI",
  "מוצר וניהול מוצר",
  "עיצוב UX/UI",
  "IT ותמיכה טכנית",
  "חומרה ואלקטרוניקה",
  "ניהול פרויקטים",
  "כספים והנהלת חשבונות",
  "משאבי אנוש וגיוס",
  "שיווק ומכירות",
  "אחר",
];

/** Preferred work areas / regions in Israel. */
export const WORK_AREAS: string[] = [
  "תל אביב והמרכז",
  "ירושלים והסביבה",
  "חיפה והצפון",
  "באר שבע והדרום",
  "השרון",
  "השפלה",
  "עבודה מהבית",
  "היברידי",
];

/** Education levels. */
export const EDUCATION_LEVELS: string[] = [
  "תיכונית",
  "על-תיכונית / הנדסאי",
  "סטודנט/ית לתואר ראשון",
  "תואר ראשון",
  "סטודנט/ית לתואר שני",
  "תואר שני ומעלה",
  "בוגר/ת מחזור / קורס הסבה",
  "אחר",
];

/** Study years shown when the candidate is a student. */
export const STUDY_YEARS: string[] = [
  "שנה א'",
  "שנה ב'",
  "שנה ג'",
  "שנה ד'",
  "שנה ה'",
  "שנת סיום",
];

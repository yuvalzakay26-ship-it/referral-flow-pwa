import type { EligibilityStatus, YesNoUnsure } from "@/types";

export interface EligibilityMeta {
  value: EligibilityStatus;
  label: string;
  description: string;
  badgeClass: string;
  icon: string;
}

export const ELIGIBILITY: Record<EligibilityStatus, EligibilityMeta> = {
  eligible: {
    value: "eligible",
    label: "זכאי להפניה",
    description: "לפי התשובות, נראה שהמועמד/ת זכאי/ת כהפניה חדשה.",
    badgeClass: "rf-badge badge-emerald",
    icon: "ShieldCheck",
  },
  review: {
    value: "review",
    label: "דורש בדיקה",
    description: "חלק מהתשובות אינן חד-משמעיות ויש לוודא זכאות.",
    badgeClass: "rf-badge badge-amber",
    icon: "ShieldQuestion",
  },
  likely_existing: {
    value: "likely_existing",
    label: "ייתכן שקיים במערכת",
    description: "ייתכן שהמועמד/ת כבר קיים/ת במערכת ואינו/ה זכאי/ת כהפניה חדשה.",
    badgeClass: "rf-badge badge-fuchsia",
    icon: "ShieldAlert",
  },
};

export function getEligibilityMeta(value: EligibilityStatus): EligibilityMeta {
  return ELIGIBILITY[value];
}

export const YES_NO_UNSURE_LABELS: Record<YesNoUnsure, string> = {
  yes: "כן",
  no: "לא",
  unsure: "לא בטוח/ה",
};

/** The three referral eligibility questions shown in the form and details page. */
export const ELIGIBILITY_QUESTIONS: {
  key: "applied_last_12_months" | "referred_by_another_employee" | "contacted_recruiter_before";
  question: string;
}[] = [
  {
    key: "applied_last_12_months",
    question: "האם הגשת מועמדות ל-NESS במהלך 12 החודשים האחרונים?",
  },
  {
    key: "referred_by_another_employee",
    question: "האם עובד אחר כבר העביר את קורות החיים שלך?",
  },
  {
    key: "contacted_recruiter_before",
    question: "האם יצרת קשר בעבר עם מגייס או מגייסת של החברה?",
  },
];

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
    badgeClass: "bg-emerald-500/15 text-emerald-300 border-emerald-400/30",
    icon: "ShieldCheck",
  },
  review: {
    value: "review",
    label: "דורש בדיקה",
    description: "חלק מהתשובות אינן חד-משמעיות ויש לוודא זכאות.",
    badgeClass: "bg-amber-500/15 text-amber-300 border-amber-400/30",
    icon: "ShieldQuestion",
  },
  likely_existing: {
    value: "likely_existing",
    label: "ייתכן שקיים במערכת",
    description: "ייתכן שהמועמד/ת כבר קיים/ת במערכת ואינו/ה זכאי/ת כהפניה חדשה.",
    badgeClass: "bg-fuchsia-500/15 text-fuchsia-300 border-fuchsia-400/30",
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

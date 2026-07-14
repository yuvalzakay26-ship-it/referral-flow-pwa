import type { Job } from "@/types";

/** Mock job announcements (no confidential company information). */
export const MOCK_JOBS: Job[] = [
  {
    id: "j1",
    title: "מפתח/ת Fullstack",
    category: "פיתוח תוכנה",
    location: "תל אביב / היברידי",
    employment_type: "full_time",
    short_description:
      "מחפשים מפתח/ת Fullstack לצוות מוצר דינמי. עבודה עם React, Node.js וענן.",
    requirements: [
      "3+ שנות ניסיון בפיתוח Fullstack",
      "ניסיון ב-React ו-TypeScript",
      "היכרות עם Node.js וסביבות ענן",
      "יכולת עבודה בצוות ותקשורת טובה",
    ],
    priority: "high",
    status: "published",
    internal_notes: "עדיפות גבוהה — לוודא זמינות לראיון טכני.",
    external_reference: "",
    is_active: true,
    created_at: "2026-07-01T09:00:00.000Z",
  },
  {
    id: "j2",
    title: "אנליסט/ית סייבר (SOC)",
    category: "אבטחת מידע וסייבר",
    location: "באר שבע / משמרות",
    employment_type: "shifts",
    short_description:
      "דרוש/ה אנליסט/ית סייבר למרכז SOC. ניטור, זיהוי ותגובה לאירועי אבטחה.",
    requirements: [
      "ניסיון בעבודה עם מערכות SIEM",
      "הבנה ברשתות ופרוטוקולים",
      "נכונות לעבודה במשמרות",
      "תעודת הסמכה בתחום — יתרון",
    ],
    priority: "medium",
    status: "published",
    internal_notes: "",
    external_reference: "",
    is_active: true,
    created_at: "2026-06-28T11:00:00.000Z",
  },
  {
    id: "j3",
    title: "משרת סטודנט/ית QA",
    category: "QA ובדיקות",
    location: "הרצליה / חלקית",
    employment_type: "student",
    short_description:
      "משרת סטודנט/ית בתחום ה-QA. הזדמנות מצוינת לצבור ניסיון בבדיקות תוכנה.",
    requirements: [
      "סטודנט/ית לתואר רלוונטי",
      "זמינות ל-3 ימים בשבוע לפחות",
      "תשומת לב לפרטים",
      "אנגלית ברמה טובה",
    ],
    priority: "low",
    status: "draft",
    internal_notes: "טיוטה — להשלים פרטים לפני פרסום.",
    external_reference: "",
    is_active: true,
    created_at: "2026-07-05T08:30:00.000Z",
  },
];

import type { MessageTemplate, MessageTemplateKey } from "@/types";

/**
 * Default Hebrew message templates. Placeholders use {{variable}} syntax and
 * are resolved by lib/templates.ts. All copy keeps honest language — no promise
 * of interview, response, or acceptance.
 */
export const DEFAULT_TEMPLATES: Record<MessageTemplateKey, MessageTemplate> = {
  initial: {
    key: "initial",
    title: "מענה ראשוני",
    body:
      "היי {{name}}, קיבלנו את פנייתך וקורות החיים שלך נקלטו במערכת (מספר פנייה {{ref}}). " +
      "הפרטים יועברו לבדיקת התאמה. חשוב לציין שאין התחייבות לחזרה, לראיון או לקבלה. בהצלחה!",
  },
  missing_details: {
    key: "missing_details",
    title: "חסרים פרטים",
    body:
      "היי {{name}}, כדי להשלים את בדיקת המועמדות חסרים לנו מספר פרטים. " +
      "נשמח אם תוכל/י להשלים אותם ולחזור אלינו. תודה!",
  },
  request_cv: {
    key: "request_cv",
    title: "בקשת קורות חיים",
    body:
      "היי {{name}}, נשמח לקבל קובץ קורות חיים מעודכן (PDF או Word) כדי שנוכל לבדוק התאמה. " +
      "אפשר לשלוח בתגובה להודעה זו. תודה!",
  },
  cv_received: {
    key: "cv_received",
    title: "קורות חיים התקבלו",
    body:
      "היי {{name}}, קורות החיים שלך התקבלו ונכנסו לבדיקה. " +
      "נעדכן אם תימצא התאמה. אין התחייבות לחזרה או לראיון. תודה על הסבלנות!",
  },
  transferred: {
    key: "transferred",
    title: "המועמדות הועברה",
    body:
      "היי {{name}}, קורות החיים שלך הועברו לבדיקה. אם תימצא התאמה, צוות הגיוס עשוי ליצור איתך קשר ישירות. " +
      "חשוב לציין שאין התחייבות לחזרה, לראיון או לקבלה. בהצלחה!",
  },
  possible_duplicate: {
    key: "possible_duplicate",
    title: "ייתכן שקיים במערכת",
    body:
      "היי {{name}}, מבדיקה ראשונית ייתכן שהפרטים שלך כבר קיימים במערכת הגיוס. " +
      "במקרה כזה לא תמיד ניתן להעביר את המועמדות כהפניה חדשה. נעדכן אם יתאפשר להמשיך. תודה על ההבנה.",
  },
  not_suitable: {
    key: "not_suitable",
    title: "לא נמצאה התאמה",
    body:
      "היי {{name}}, תודה על הפנייה. בשלב זה לא נמצאה התאמה למשרה מתאימה. " +
      "נשמור את הפרטים ונחזור אם יעלה משהו רלוונטי בהמשך. מאחלים לך הצלחה רבה!",
  },
  follow_up: {
    key: "follow_up",
    title: "הודעת המשך",
    body:
      "היי {{name}}, רק רציתי לעדכן שהמועמדות שלך עדיין בבדיקה. " +
      "אם משהו השתנה בפרטים או בזמינות שלך, אשמח לדעת. תודה!",
  },
  congratulations: {
    key: "congratulations",
    title: "ברכות על הקבלה",
    body:
      "היי {{name}}, כל הכבוד ומזל טוב על הקבלה! שמחתי מאוד להיות חלק מהדרך. " +
      "מאחל/ת לך הצלחה גדולה בתפקיד החדש 🎉",
  },
};

export const TEMPLATE_LIST: MessageTemplate[] = Object.values(DEFAULT_TEMPLATES);

/** Available placeholder variables shown in the editor. */
export const TEMPLATE_VARIABLES: { token: string; label: string }[] = [
  { token: "{{name}}", label: "שם המועמד/ת" },
  { token: "{{ref}}", label: "מספר פנייה" },
  { token: "{{position}}", label: "משרה / תחום" },
  { token: "{{field}}", label: "תחום מקצועי" },
];

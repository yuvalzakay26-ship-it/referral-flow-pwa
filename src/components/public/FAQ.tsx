"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { FadeIn } from "@/components/ui/Motion";

const FAQS = [
  {
    q: "האם שליחת המועמדות מבטיחה ראיון או קבלה?",
    a: "לא. המועמדות מועברת לבדיקה בלבד. ההתאמה והמשך התהליך נקבעים על ידי צוותי הגיוס, ואין התחייבות לחזרה, לראיון או לקבלה.",
  },
  {
    q: "מי רואה את הפרטים וקורות החיים שלי?",
    a: "הפרטים נשמרים באחסון מאובטח ופרטי, ומשמשים אך ורק לצורך בדיקת התאמה והעברה אפשרית לצוותי הגיוס הרלוונטיים.",
  },
  {
    q: "כבר הגשתי מועמדות לחברה בעבר — האם זה משנה?",
    a: "ייתכן. מועמדים שכבר קיימים במערכת הגיוס לא תמיד זכאים כהפניית עובד חדשה. בטופס תישאל/י מספר שאלות שיעזרו לנו לבדוק זאת.",
  },
  {
    q: "אילו קבצים אפשר להעלות?",
    a: "אפשר להעלות קורות חיים בפורמט PDF, DOC או DOCX, עד 8MB.",
  },
  {
    q: "כמה זמן לוקח לקבל תשובה?",
    a: "אין לוח זמנים מובטח. הבדיקה תלויה בצוותי הגיוס ובמשרות הפתוחות. נשתדל לעדכן אם וכאשר תימצא התאמה.",
  },
];

export function FAQ() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <FadeIn className="mb-10 text-center">
        <h2 className="text-3xl font-black tracking-tight sm:text-4xl">
          שאלות <span className="text-gradient">נפוצות</span>
        </h2>
      </FadeIn>

      <div className="flex flex-col gap-3">
        {FAQS.map((item, i) => {
          const isOpen = open === i;
          return (
            <div
              key={i}
              className="glass overflow-hidden rounded-2xl border border-white/8"
            >
              <button
                type="button"
                onClick={() => setOpen(isOpen ? null : i)}
                className="flex w-full items-center justify-between gap-4 px-5 py-4 text-right focus-ring"
                aria-expanded={isOpen}
              >
                <span className="font-semibold text-[var(--rf-text)]">
                  {item.q}
                </span>
                <ChevronDown
                  size={20}
                  className={`flex-none text-[var(--rf-text-muted)] transition-transform ${
                    isOpen ? "rotate-180" : ""
                  }`}
                />
              </button>
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                  >
                    <p className="px-5 pb-4 text-sm leading-relaxed text-[var(--rf-text-muted)]">
                      {item.a}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </section>
  );
}

import { Lock, Zap, Users, BellRing } from "lucide-react";
import { FadeIn, StaggerGroup, StaggerItem } from "@/components/ui/Motion";
import { Card } from "@/components/ui/Card";

const BENEFITS = [
  {
    icon: Zap,
    title: "מהיר ופשוט",
    text: "שליחה בכמה דקות מהנייד, בלי טפסים מסובכים.",
  },
  {
    icon: Lock,
    title: "מאובטח ופרטי",
    text: "הפרטים וקורות החיים נשמרים באחסון מאובטח ופרטי בלבד.",
  },
  {
    icon: Users,
    title: "הפניה אישית",
    text: "המועמדות מועברת לבדיקה דרך תוכנית הפניית עובדים.",
  },
  {
    icon: BellRing,
    title: "עדכונים בערוץ",
    text: "אפשר להישאר מעודכן במשרות חדשות דרך ערוץ הוואטסאפ.",
  },
];

export function Benefits() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <FadeIn className="mb-10 text-center">
        <h2 className="text-3xl font-black tracking-tight sm:text-4xl">
          למה <span className="text-gradient">ReferralFlow</span>
        </h2>
        <p className="mt-3 text-[var(--rf-text-muted)]">
          כל מה שצריך כדי לשלוח מועמדות בביטחון
        </p>
      </FadeIn>

      <StaggerGroup className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {BENEFITS.map((b) => (
          <StaggerItem key={b.title}>
            <Card className="h-full">
              <span
                className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl"
                style={{ background: "var(--rf-gradient-soft)" }}
              >
                <b.icon size={20} className="text-[var(--rf-magenta)]" />
              </span>
              <h3 className="font-bold">{b.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-[var(--rf-text-muted)]">
                {b.text}
              </p>
            </Card>
          </StaggerItem>
        ))}
      </StaggerGroup>
    </section>
  );
}

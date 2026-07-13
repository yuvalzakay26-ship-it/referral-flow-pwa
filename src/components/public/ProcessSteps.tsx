import { ClipboardList, FileUp, SearchCheck } from "lucide-react";
import { FadeIn, StaggerGroup, StaggerItem } from "@/components/ui/Motion";
import { Card } from "@/components/ui/Card";

const STEPS = [
  {
    icon: ClipboardList,
    title: "ממלאים פרטים",
    text: "טופס קצר וברור עם הפרטים האישיים והמקצועיים שלך.",
  },
  {
    icon: FileUp,
    title: "שולחים קורות חיים",
    text: "מעלים קובץ PDF או Word בצורה מאובטחת, בכמה שניות.",
  },
  {
    icon: SearchCheck,
    title: "צוותי הגיוס בודקים התאמה",
    text: "המועמדות מועברת לבדיקה, וההתאמה נקבעת על ידי צוותי הגיוס.",
  },
];

export function ProcessSteps() {
  return (
    <section id="how" className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <FadeIn className="mb-10 text-center">
        <h2 className="text-3xl font-black tracking-tight sm:text-4xl">
          איך זה <span className="text-gradient">עובד</span>
        </h2>
        <p className="mt-3 text-[var(--rf-text-muted)]">
          שלושה צעדים פשוטים מהשליחה ועד הבדיקה
        </p>
      </FadeIn>

      <StaggerGroup className="grid gap-4 sm:grid-cols-3">
        {STEPS.map((step, i) => (
          <StaggerItem key={step.title}>
            <Card variant="gradient" className="h-full">
              <div className="mb-4 flex items-center justify-between">
                <span
                  className="flex h-12 w-12 items-center justify-center rounded-2xl text-white"
                  style={{ background: "var(--rf-gradient-soft)" }}
                >
                  <step.icon size={22} className="text-[var(--rf-cyan)]" />
                </span>
                <span className="text-4xl font-black text-white/5">
                  {i + 1}
                </span>
              </div>
              <h3 className="text-lg font-bold">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-[var(--rf-text-muted)]">
                {step.text}
              </p>
            </Card>
          </StaggerItem>
        ))}
      </StaggerGroup>
    </section>
  );
}

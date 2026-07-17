import Link from "next/link";
import { WifiOff } from "lucide-react";
import { LogoMark } from "@/components/ui/Logo";
import { Button } from "@/components/ui/Button";

export const metadata = { title: "אין חיבור לאינטרנט" };

export default function OfflinePage() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-6 text-center">
      <LogoMark size={64} />
      <span className="mt-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--surface-muted)]">
        <WifiOff size={26} className="text-[var(--rf-text-muted)]" />
      </span>
      <h1 className="mt-4 text-2xl font-black tracking-tight">אין חיבור לאינטרנט</h1>
      <p className="mt-2 max-w-sm text-sm text-[var(--rf-text-muted)]">
        נראה שאין כרגע חיבור. בדקו את החיבור ונסו שוב — חלק מהתכנים זמינים גם ללא
        חיבור.
      </p>
      <Button asChild variant="gradient" size="lg" className="mt-6">
        <Link href="/">חזרה לדף הבית</Link>
      </Button>
    </div>
  );
}

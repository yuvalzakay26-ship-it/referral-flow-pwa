import Link from "next/link";
import { LogoMark } from "@/components/ui/Logo";
import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-6 text-center">
      <LogoMark size={64} />
      <p className="mt-6 text-6xl font-black text-gradient">404</p>
      <h1 className="mt-2 text-2xl font-black tracking-tight">הדף לא נמצא</h1>
      <p className="mt-2 max-w-sm text-sm text-[var(--rf-text-muted)]">
        ייתכן שהקישור שגוי או שהדף הוסר.
      </p>
      <Button asChild variant="gradient" size="lg" className="mt-6">
        <Link href="/">חזרה לדף הבית</Link>
      </Button>
    </div>
  );
}

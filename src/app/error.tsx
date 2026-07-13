"use client";

import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-6 text-center">
      <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500/10">
        <AlertTriangle size={30} className="text-red-400" />
      </span>
      <h1 className="mt-5 text-2xl font-black tracking-tight">משהו השתבש</h1>
      <p className="mt-2 max-w-sm text-sm text-[var(--rf-text-muted)]">
        אירעה שגיאה בלתי צפויה. אפשר לנסות שוב.
      </p>
      <Button variant="gradient" size="lg" className="mt-6" onClick={reset}>
        ניסיון חוזר
      </Button>
    </div>
  );
}

import { AlertTriangle } from "lucide-react";

/**
 * Shown when the app is required to use Supabase but the configuration is
 * missing. Fails closed — never falls back to exposing data — and avoids
 * leaking any technical details to the visitor.
 */
export function ConfigError() {
  return (
    <div className="flex min-h-dvh items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[color-mix(in_srgb,var(--rf-warning)_18%,transparent)]">
          <AlertTriangle size={24} className="text-[var(--rf-warning)]" />
        </div>
        <h1 className="text-lg font-bold text-[var(--rf-text)]">
          המערכת אינה מוגדרת
        </h1>
        <p className="mt-2 text-sm text-[var(--rf-text-muted)]">
          חסרה תצורת החיבור לשרת. לא ניתן לגשת לנתונים עד להשלמת ההגדרה. פנו
          למנהל המערכת.
        </p>
      </div>
    </div>
  );
}

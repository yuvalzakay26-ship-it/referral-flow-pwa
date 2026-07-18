"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, Lock, LogIn } from "lucide-react";
import { LogoMark } from "@/components/ui/Logo";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Field, TextInput } from "@/components/ui/Field";
import { AnimatedBackground } from "@/components/ui/AnimatedBackground";
import { signInOwner } from "@/lib/auth-actions";

export default function AdminLoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const result = await signInOwner(email, password);
      if (result.ok) {
        // Return to the intended route when it is a safe in-app path.
        const next = searchParams.get("next");
        const dest = next && next.startsWith("/") ? next : "/admin";
        router.replace(dest);
        router.refresh();
      } else {
        setError(result.error ?? "פרטי התחברות שגויים.");
        setLoading(false);
      }
    } catch {
      setError("אירעה שגיאה. נסו שוב.");
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-dvh items-center justify-center px-4">
      <AnimatedBackground />
      <div className="w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center text-center">
          <LogoMark size={64} />
          <h1 className="mt-4 text-2xl font-black tracking-tight">כניסת מנהל</h1>
          <p className="mt-1 text-sm text-[var(--rf-text-muted)]">
            כניסה פרטית לבעל המערכת
          </p>
        </div>

        <Card variant="elevated">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Field label="אימייל" htmlFor="email">
              <TextInput
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                autoComplete="username"
                dir="ltr"
                required
              />
            </Field>
            <Field label="סיסמה" htmlFor="password" error={error ?? undefined}>
              <TextInput
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                dir="ltr"
                required
              />
            </Field>
            <Button type="submit" variant="gradient" size="lg" disabled={loading}>
              {loading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <LogIn size={18} />
              )}
              התחברות
            </Button>
          </form>

          <div className="mt-4 flex items-start gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] p-3 text-xs text-[var(--rf-text-muted)]">
            <Lock size={14} className="mt-0.5 flex-none text-[var(--rf-cyan)]" />
            <span>
              הגישה מוגבלת לבעל המערכת בלבד. אין הרשמה ואין יצירת חשבון.
            </span>
          </div>
        </Card>
      </div>
    </div>
  );
}

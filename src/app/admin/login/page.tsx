"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Lock, LogIn } from "lucide-react";
import { LogoMark } from "@/components/ui/Logo";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Field, TextInput } from "@/components/ui/Field";
import { AnimatedBackground } from "@/components/ui/AnimatedBackground";
import { isAuthed, login } from "@/lib/auth";
import { USE_MOCK_DATA } from "@/config/app";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthed()) router.replace("/admin");
  }, [router]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const ok = login(email, password);
    if (ok) {
      router.replace("/admin");
    } else {
      setError("פרטי התחברות שגויים.");
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
            אזור ניהול ReferralFlow
          </p>
        </div>

        <Card variant="elevated">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Field label="שם משתמש / אימייל" htmlFor="email">
              <TextInput
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin"
                autoComplete="username"
              />
            </Field>
            <Field label="סיסמה" htmlFor="password" error={error ?? undefined}>
              <TextInput
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••"
                autoComplete="current-password"
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

          {USE_MOCK_DATA && (
            <div className="mt-4 flex items-start gap-2 rounded-xl border border-white/10 bg-white/[0.03] p-3 text-xs text-[var(--rf-text-muted)]">
              <Lock size={14} className="mt-0.5 flex-none text-[var(--rf-cyan)]" />
              <span>
                מצב הדגמה (Mock): התחברו עם המשתמש <b className="text-[var(--rf-text)]">admin</b> והסיסמה{" "}
                <b className="text-[var(--rf-text)]">admin</b>.
              </span>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

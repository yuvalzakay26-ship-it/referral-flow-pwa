"use client";

import { useEffect, useRef, useState } from "react";
import {
  Save,
  RotateCcw,
  CheckCircle2,
  Settings2,
  MessageCircle,
  FileText,
  Smartphone,
  Download,
  ShieldAlert,
  Database,
  Info,
} from "lucide-react";
import { PageHeader } from "@/components/admin/PageHeader";
import { InstallCard } from "@/components/admin/InstallCard";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Field, TextInput, TextArea } from "@/components/ui/Field";
import { Skeleton } from "@/components/ui/Skeleton";
import { getSettings, updateSettings } from "@/services/settingsService";
import { DEFAULT_SETTINGS } from "@/config/settings";
import {
  USE_MOCK_DATA,
  NON_OFFICIAL_NOTICE,
  MOCK_MODE_WARNING,
} from "@/config/app";
import type { AppSettings } from "@/types";

export default function SettingsPage() {
  const [form, setForm] = useState<AppSettings | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const savedTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    getSettings().then(setForm);
  }, []);

  // Clear a pending "saved" reset if the page unmounts.
  useEffect(() => {
    return () => {
      if (savedTimer.current) clearTimeout(savedTimer.current);
    };
  }, []);

  function update<K extends keyof AppSettings>(key: K, value: AppSettings[K]) {
    setForm((prev) => (prev ? { ...prev, [key]: value } : prev));
  }

  async function handleSave() {
    if (!form) return;
    setSaving(true);
    const next = await updateSettings(form);
    setForm(next);
    setSaving(false);
    setSaved(true);
    if (savedTimer.current) clearTimeout(savedTimer.current);
    savedTimer.current = setTimeout(() => setSaved(false), 2000);
  }

  function handleReset() {
    setForm({ ...DEFAULT_SETTINGS });
  }

  if (!form) {
    return (
      <div>
        <PageHeader
          title="הגדרות"
          description="הגדרות כלליות של המערכת וההודעות."
        />
        <div className="flex flex-col gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <Skeleton className="mb-4 h-5 w-40" />
              <div className="flex flex-col gap-4">
                <Skeleton className="h-11 w-full" />
                <Skeleton className="h-11 w-full" />
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="הגדרות"
        description="הגדרות כלליות של המערכת, ההודעות והפוסטים."
        actions={
          <>
            <Button variant="ghost" size="md" onClick={handleReset}>
              <RotateCcw size={16} />
              איפוס
            </Button>
            <Button
              variant="gradient"
              size="md"
              onClick={handleSave}
              disabled={saving}
            >
              <Save size={16} />
              שמירת הגדרות
            </Button>
          </>
        }
      />

      <div className="flex flex-col gap-4">
        {/* General */}
        <Card>
          <CardHeader>
            <CardTitle>כללי</CardTitle>
            <Settings2 size={18} className="text-[var(--rf-text-muted)]" />
          </CardHeader>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="שם המערכת" htmlFor="app_name">
              <TextInput
                id="app_name"
                value={form.app_name}
                onChange={(e) => update("app_name", e.target.value)}
              />
            </Field>
            <Field label="שם המנהל להצגה" htmlFor="admin_display_name">
              <TextInput
                id="admin_display_name"
                value={form.admin_display_name}
                onChange={(e) => update("admin_display_name", e.target.value)}
              />
            </Field>
            <Field
              label="ימי מעקב ברירת מחדל"
              htmlFor="default_follow_up_days"
              hint="מספר הימים עד למעקב הבא (1–90)."
            >
              <TextInput
                id="default_follow_up_days"
                type="number"
                min={1}
                max={90}
                dir="ltr"
                value={form.default_follow_up_days}
                onChange={(e) => {
                  const n = Number(e.target.value);
                  update(
                    "default_follow_up_days",
                    Number.isNaN(n) ? form.default_follow_up_days : n,
                  );
                }}
              />
            </Field>
            <Field
              label="סכום בונוס ברירת מחדל (₪)"
              htmlFor="default_bonus_amount"
              hint="רשות — משמש כערך ברירת מחדל."
            >
              <TextInput
                id="default_bonus_amount"
                type="number"
                min={0}
                dir="ltr"
                value={form.default_bonus_amount ?? ""}
                onChange={(e) => {
                  const v = e.target.value;
                  update(
                    "default_bonus_amount",
                    v === "" ? null : Number(v),
                  );
                }}
              />
            </Field>
          </div>
        </Card>

        {/* WhatsApp */}
        <Card>
          <CardHeader>
            <CardTitle>וואטסאפ</CardTitle>
            <MessageCircle size={18} className="text-[var(--rf-text-muted)]" />
          </CardHeader>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="קישור לערוץ וואטסאפ" htmlFor="whatsapp_channel_url">
              <TextInput
                id="whatsapp_channel_url"
                dir="ltr"
                placeholder="https://whatsapp.com/channel/..."
                value={form.whatsapp_channel_url}
                onChange={(e) => update("whatsapp_channel_url", e.target.value)}
              />
            </Field>
            <Field
              label="מספר וואטסאפ ברירת מחדל"
              htmlFor="default_whatsapp_number"
              hint="בפורמט בינלאומי ללא +"
            >
              <TextInput
                id="default_whatsapp_number"
                dir="ltr"
                placeholder="972500000000"
                value={form.default_whatsapp_number}
                onChange={(e) =>
                  update("default_whatsapp_number", e.target.value)
                }
              />
            </Field>
          </div>
        </Card>

        {/* Job posts */}
        <Card>
          <CardHeader>
            <CardTitle>פוסטים למשרות</CardTitle>
            <FileText size={18} className="text-[var(--rf-text-muted)]" />
          </CardHeader>
          <div className="flex flex-col gap-4">
            <Field
              label="שורת סיום לפוסט"
              htmlFor="default_job_post_ending"
              hint="נוסף לפוסטים שנוצרים לוואטסאפ (ללא קישור הגשה ציבורי)."
            >
              <TextArea
                id="default_job_post_ending"
                value={form.default_job_post_ending}
                onChange={(e) =>
                  update("default_job_post_ending", e.target.value)
                }
              />
            </Field>
            <Field
              label="טקסט הבהרה ציבורי"
              htmlFor="disclaimer_text"
              hint="נכלל בפוסטים המפורסמים לוואטסאפ."
            >
              <TextArea
                id="disclaimer_text"
                value={form.disclaimer_text}
                onChange={(e) => update("disclaimer_text", e.target.value)}
              />
            </Field>
          </div>
        </Card>

        {/* Mock mode + Supabase status */}
        <Card>
          <CardHeader>
            <CardTitle>מצב נתונים וחיבור</CardTitle>
            <Database size={18} className="text-[var(--rf-text-muted)]" />
          </CardHeader>
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-muted)] px-4 py-3">
              <span className="flex items-center gap-2 text-sm text-[var(--rf-text)]">
                <Database size={16} className="text-[var(--rf-text-muted)]" />
                חיבור Supabase
              </span>
              <span
                className={
                  USE_MOCK_DATA
                    ? "rf-badge badge-amber rounded-full border px-3 py-1 text-xs font-medium"
                    : "rf-badge badge-emerald rounded-full border px-3 py-1 text-xs font-medium"
                }
              >
                {USE_MOCK_DATA ? "לא מחובר (מצב הדגמה)" : "מחובר"}
              </span>
            </div>
            {USE_MOCK_DATA && (
              <p className="rf-badge badge-amber flex items-start gap-2 rounded-xl border px-4 py-3 text-sm leading-relaxed">
                <ShieldAlert size={16} className="mt-0.5 flex-none" />
                {MOCK_MODE_WARNING} ההתחברות הנוכחית היא לצורכי פיתוח בלבד ואינה
                מאובטחת לייצור.
              </p>
            )}
          </div>
        </Card>

        {/* PWA install */}
        <Card>
          <CardHeader>
            <CardTitle>התקנת האפליקציה (PWA)</CardTitle>
            <Smartphone size={18} className="text-[var(--rf-text-muted)]" />
          </CardHeader>
          <div className="flex flex-col gap-4">
            <div className="max-w-md">
              <InstallCard />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-muted)] p-4">
                <h4 className="mb-2 font-bold text-[var(--rf-text)]">
                  אנדרואיד (Chrome)
                </h4>
                <ol className="list-inside list-decimal space-y-1 text-sm leading-relaxed text-[var(--rf-text-muted)]">
                  <li>פתחו את תפריט הדפדפן (⋮).</li>
                  <li>בחרו &quot;הוספה למסך הבית&quot;.</li>
                  <li>אשרו את ההתקנה.</li>
                </ol>
              </div>
              <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-muted)] p-4">
                <h4 className="mb-2 font-bold text-[var(--rf-text)]">
                  אייפון (Safari)
                </h4>
                <ol className="list-inside list-decimal space-y-1 text-sm leading-relaxed text-[var(--rf-text-muted)]">
                  <li>הקישו על כפתור השיתוף.</li>
                  <li>בחרו &quot;הוספה למסך הבית&quot;.</li>
                  <li>הקישו &quot;הוספה&quot; לאישור.</li>
                </ol>
              </div>
            </div>
          </div>
        </Card>

        {/* Data export (placeholder) */}
        <Card>
          <CardHeader>
            <CardTitle>ייצוא נתונים</CardTitle>
            <Download size={18} className="text-[var(--rf-text-muted)]" />
          </CardHeader>
          <div className="flex flex-col items-start gap-3">
            <Button variant="outline" size="md" disabled>
              <Download size={16} />
              ייצוא ל-CSV (בקרוב)
            </Button>
            <p className="text-sm text-[var(--rf-text-muted)]">
              ייצוא הנתונים יהיה זמין לאחר חיבור Supabase.
            </p>
          </div>
        </Card>

        {/* About / non-official notice */}
        <Card>
          <CardHeader>
            <CardTitle>אודות</CardTitle>
            <Info size={18} className="text-[var(--rf-text-muted)]" />
          </CardHeader>
          <p className="rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] px-4 py-3 text-sm leading-relaxed text-[var(--rf-text-muted)]">
            {NON_OFFICIAL_NOTICE}
          </p>
        </Card>
      </div>

      {/* Bottom save bar — sits above the fixed mobile nav via the shared
          .sticky-above-mobile-nav utility (see globals.css). */}
      <div className="sticky-above-mobile-nav z-10 mt-6">
        <div className="glass-elevated flex items-center justify-between gap-3 rounded-2xl px-4 py-3">
          <div className="min-h-6">
            {saved && (
              <span className="rf-badge badge-emerald inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium">
                <CheckCircle2 size={14} />
                ההגדרות נשמרו
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="md" onClick={handleReset}>
              <RotateCcw size={16} />
              איפוס
            </Button>
            <Button
              variant="gradient"
              size="md"
              onClick={handleSave}
              disabled={saving}
            >
              <Save size={16} />
              שמירת הגדרות
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import {
  Save,
  RotateCcw,
  CheckCircle2,
  Settings2,
  MessageCircle,
  FileText,
  Smartphone,
  Download,
} from "lucide-react";
import { PageHeader } from "@/components/admin/PageHeader";
import { InstallCard } from "@/components/admin/InstallCard";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Field, TextInput, TextArea } from "@/components/ui/Field";
import { Skeleton } from "@/components/ui/Skeleton";
import { getSettings, updateSettings } from "@/services/settingsService";
import { DEFAULT_SETTINGS } from "@/config/settings";
import type { AppSettings } from "@/types";

export default function SettingsPage() {
  const [form, setForm] = useState<AppSettings | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    getSettings().then(setForm);
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
    window.setTimeout(() => setSaved(false), 2000);
  }

  function handleReset() {
    setForm({ ...DEFAULT_SETTINGS });
  }

  if (!form) {
    return (
      <div>
        <PageHeader
          title="הגדרות"
          description="הגדרות כלליות של האפליקציה וההודעות."
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
        description="הגדרות כלליות של האפליקציה וההודעות."
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
            <Field label="שם האפליקציה" htmlFor="app_name">
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

        {/* Public texts */}
        <Card>
          <CardHeader>
            <CardTitle>טקסטים ציבוריים</CardTitle>
            <FileText size={18} className="text-[var(--rf-text-muted)]" />
          </CardHeader>
          <div className="flex flex-col gap-4">
            <Field
              label="טקסט הבהרה"
              htmlFor="disclaimer_text"
              hint="מוצג למועמדים בעמוד השליחה ובאתר"
            >
              <TextArea
                id="disclaimer_text"
                value={form.disclaimer_text}
                onChange={(e) => update("disclaimer_text", e.target.value)}
              />
            </Field>
            <Field label="הודעת פרטיות" htmlFor="privacy_notice">
              <TextArea
                id="privacy_notice"
                value={form.privacy_notice}
                onChange={(e) => update("privacy_notice", e.target.value)}
              />
            </Field>
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
              <div className="rounded-xl border border-white/8 bg-white/[0.02] p-4">
                <h4 className="mb-2 font-bold text-[var(--rf-text)]">
                  אנדרואיד (Chrome)
                </h4>
                <ol className="list-inside list-decimal space-y-1 text-sm leading-relaxed text-[var(--rf-text-muted)]">
                  <li>פתחו את תפריט הדפדפן (⋮).</li>
                  <li>בחרו &quot;הוספה למסך הבית&quot;.</li>
                  <li>אשרו את ההתקנה.</li>
                </ol>
              </div>
              <div className="rounded-xl border border-white/8 bg-white/[0.02] p-4">
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
      </div>

      {/* Bottom save bar */}
      <div className="sticky bottom-4 z-10 mt-6">
        <div className="glass-elevated flex items-center justify-between gap-3 rounded-2xl px-4 py-3">
          <div className="min-h-6">
            {saved && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-medium text-emerald-300">
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

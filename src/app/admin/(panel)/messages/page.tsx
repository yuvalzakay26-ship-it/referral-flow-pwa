"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { MessageCircle, Variable } from "lucide-react";
import { PageHeader } from "@/components/admin/PageHeader";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Field, TextArea } from "@/components/ui/Field";
import { CopyButton } from "@/components/ui/CopyButton";
import { Skeleton } from "@/components/ui/Skeleton";
import { TEMPLATE_VARIABLES } from "@/config/messageTemplates";
import { resolveTemplate, type TemplateContext } from "@/lib/templates";
import { whatsappLink } from "@/lib/utils";
import {
  listTemplates,
  updateTemplate,
  resetTemplate,
} from "@/services/templateService";
import { WHATSAPP_NUMBER } from "@/config/app";
import type { MessageTemplate } from "@/types";

const previewCtx: TemplateContext = {
  name: "נועה",
  ref: "RF-20260701-1042",
  position: "מפתחת Frontend",
  field: "פיתוח תוכנה",
  jobTitle: "מפתחת Frontend",
  followUpDate: "16/07/2026",
};

export default function MessagesPage() {
  const [templates, setTemplates] = useState<MessageTemplate[] | null>(null);

  useEffect(() => {
    listTemplates().then(setTemplates);
  }, []);

  return (
    <div>
      <PageHeader
        title="תבניות הודעה"
        description="ניהול תבניות הודעה מוכנות לשליחה במהירות."
      />

      {/* Placeholder variables helper */}
      <Card variant="elevated" className="mb-6">
        <CardHeader>
          <CardTitle>משתנים זמינים</CardTitle>
          <Variable size={18} className="text-[var(--rf-text-muted)]" />
        </CardHeader>
        <p className="mb-3 text-sm text-[var(--rf-text-muted)]">
          המשתנים הבאים מוחלפים אוטומטית בפרטי המועמד/ת בעת השליחה.
        </p>
        <div className="flex flex-wrap gap-2">
          {TEMPLATE_VARIABLES.map((v) => (
            <div
              key={v.token}
              className="flex items-center gap-2 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-muted)] px-3 py-1.5"
            >
              <code className="font-mono text-sm text-[var(--rf-cyan)]">
                {v.token}
              </code>
              <span className="text-xs text-[var(--rf-text-muted)]">
                {v.label}
              </span>
            </div>
          ))}
        </div>
      </Card>

      {/* Templates */}
      {templates === null ? (
        <div className="flex flex-col gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <Skeleton className="mb-4 h-6 w-40" />
              <Skeleton className="mb-4 h-28 w-full" />
              <Skeleton className="h-9 w-64" />
            </Card>
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {templates.map((tpl) => (
            <TemplateRow key={tpl.key} template={tpl} />
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * A single editable template. Owns its own draft so typing in one template only
 * re-renders that row, and the preview is memoised so `resolveTemplate` runs
 * only when this row's body actually changes — not for every template on every
 * keystroke across the page.
 */
function TemplateRow({ template }: { template: MessageTemplate }) {
  const [body, setBody] = useState(template.body);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const savedTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    return () => {
      if (savedTimer.current) clearTimeout(savedTimer.current);
    };
  }, []);

  const resolved = useMemo(() => resolveTemplate(body, previewCtx), [body]);

  async function handleSave() {
    setSaving(true);
    try {
      await updateTemplate(template.key, body);
      setSaved(true);
      if (savedTimer.current) clearTimeout(savedTimer.current);
      savedTimer.current = setTimeout(() => setSaved(false), 1800);
    } finally {
      setSaving(false);
    }
  }

  async function handleReset() {
    const tpl = await resetTemplate(template.key);
    if (tpl) setBody(tpl.body);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{template.title}</CardTitle>
        <code className="font-mono text-xs text-[var(--rf-text-muted)]">
          {template.key}
        </code>
      </CardHeader>

      <div className="grid gap-4 lg:grid-cols-2">
        <Field label="תוכן ההודעה" htmlFor={`tpl-${template.key}`}>
          <TextArea
            id={`tpl-${template.key}`}
            rows={5}
            value={body}
            onChange={(e) => setBody(e.target.value)}
          />
        </Field>

        <div className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-[var(--rf-text)]">
            תצוגה מקדימה
          </span>
          <div className="whitespace-pre-wrap rounded-2xl border border-[color-mix(in_srgb,var(--rf-success)_30%,transparent)] bg-[color-mix(in_srgb,var(--rf-success)_7%,transparent)] px-4 py-3 text-sm leading-relaxed text-[var(--rf-text)]">
            {resolved}
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Button
          variant="gradient"
          size="sm"
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? "שומר…" : saved ? "נשמר" : "שמירה"}
        </Button>

        <Button variant="ghost" size="sm" onClick={handleReset}>
          איפוס לברירת מחדל
        </Button>

        <CopyButton value={resolved} label="העתקה" />

        <Button variant="outline" size="sm" asChild>
          <a
            href={whatsappLink(WHATSAPP_NUMBER, resolved)}
            target="_blank"
            rel="noopener noreferrer"
          >
            <MessageCircle size={15} />
            פתח בוואטסאפ
          </a>
        </Button>
      </div>
    </Card>
  );
}

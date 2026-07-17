"use client";

import { useEffect, useState } from "react";
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
import type { MessageTemplate, MessageTemplateKey } from "@/types";

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
  const [drafts, setDrafts] = useState<Record<MessageTemplateKey, string>>(
    {} as Record<MessageTemplateKey, string>,
  );
  const [savingKey, setSavingKey] = useState<MessageTemplateKey | null>(null);
  const [savedKey, setSavedKey] = useState<MessageTemplateKey | null>(null);

  useEffect(() => {
    listTemplates().then((list) => {
      setTemplates(list);
      setDrafts(
        Object.fromEntries(list.map((t) => [t.key, t.body])) as Record<
          MessageTemplateKey,
          string
        >,
      );
    });
  }, []);

  function handleChange(key: MessageTemplateKey, value: string) {
    setDrafts((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSave(key: MessageTemplateKey) {
    setSavingKey(key);
    try {
      await updateTemplate(key, drafts[key] ?? "");
      setSavedKey(key);
      setTimeout(() => {
        setSavedKey((current) => (current === key ? null : current));
      }, 1800);
    } finally {
      setSavingKey((current) => (current === key ? null : current));
    }
  }

  async function handleReset(key: MessageTemplateKey) {
    const tpl = await resetTemplate(key);
    if (tpl) {
      setDrafts((prev) => ({ ...prev, [key]: tpl.body }));
    }
  }

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
          {templates.map((tpl) => {
            const body = drafts[tpl.key] ?? tpl.body;
            const resolved = resolveTemplate(body, previewCtx);
            const isSaving = savingKey === tpl.key;
            const isSaved = savedKey === tpl.key;

            return (
              <Card key={tpl.key}>
                <CardHeader>
                  <CardTitle>{tpl.title}</CardTitle>
                  <code className="font-mono text-xs text-[var(--rf-text-muted)]">
                    {tpl.key}
                  </code>
                </CardHeader>

                <div className="grid gap-4 lg:grid-cols-2">
                  <Field label="תוכן ההודעה" htmlFor={`tpl-${tpl.key}`}>
                    <TextArea
                      id={`tpl-${tpl.key}`}
                      rows={5}
                      value={body}
                      onChange={(e) => handleChange(tpl.key, e.target.value)}
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
                    onClick={() => handleSave(tpl.key)}
                    disabled={isSaving}
                  >
                    {isSaving ? "שומר…" : isSaved ? "נשמר" : "שמירה"}
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleReset(tpl.key)}
                  >
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
          })}
        </div>
      )}
    </div>
  );
}

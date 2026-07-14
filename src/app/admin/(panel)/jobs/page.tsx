"use client";

import { useEffect, useState } from "react";
import {
  Plus,
  Briefcase,
  X,
  Pencil,
  Copy,
  Archive,
  ArchiveRestore,
  MapPin,
  FolderTree,
  Clock,
  MessageCircle,
} from "lucide-react";
import { PageHeader } from "@/components/admin/PageHeader";
import { EmptyState } from "@/components/admin/EmptyState";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { CopyButton } from "@/components/ui/CopyButton";
import { Field, TextInput, SelectInput, TextArea } from "@/components/ui/Field";
import { JOB_TYPE_LIST, getJobTypeLabel } from "@/config/jobTypes";
import {
  listJobs,
  createJob,
  updateJob,
} from "@/services/jobService";
import { getSettings } from "@/services/settingsService";
import type {
  Job,
  JobType,
  JobPriority,
  JobStatus,
  AppSettings,
} from "@/types";

// --- Local option lists -----------------------------------------------------

const JOB_CATEGORIES: string[] = [
  "פיתוח תוכנה",
  "QA ובדיקות",
  "DevOps ותשתיות",
  "אבטחת מידע וסייבר",
  "דאטה ו-BI",
  "IT ותמיכה טכנית",
  "אחר",
];

const PRIORITY_OPTIONS: { value: JobPriority; label: string }[] = [
  { value: "low", label: "נמוכה" },
  { value: "medium", label: "בינונית" },
  { value: "high", label: "גבוהה" },
];

const STATUS_OPTIONS: { value: JobStatus; label: string }[] = [
  { value: "draft", label: "טיוטה" },
  { value: "published", label: "מפורסם" },
];

const PRIORITY_META: Record<JobPriority, { label: string; badgeClass: string }> =
  {
    low: {
      label: "עדיפות נמוכה",
      badgeClass: "bg-slate-500/15 text-slate-300 border-slate-400/30",
    },
    medium: {
      label: "עדיפות בינונית",
      badgeClass: "bg-amber-500/15 text-amber-300 border-amber-400/30",
    },
    high: {
      label: "עדיפות גבוהה",
      badgeClass: "bg-[var(--rf-magenta)]/15 text-red-300 border-red-400/30",
    },
  };

const STATUS_META: Record<JobStatus, { label: string; badgeClass: string }> = {
  published: {
    label: "מפורסם",
    badgeClass: "bg-emerald-500/15 text-emerald-300 border-emerald-400/30",
  },
  draft: {
    label: "טיוטה",
    badgeClass: "bg-slate-500/15 text-slate-300 border-slate-400/30",
  },
};

// --- WhatsApp post formatter (no public application-form link) ---------------

function buildWhatsappPost(job: Job, settings: AppSettings): string {
  const requirements = job.requirements.map((req) => `- ${req}`).join("\n");
  const lines = [
    `🚀 *${job.title}*`,
    `📁 ${job.category}`,
    job.location ? `📍 ${job.location}` : "",
    `🕒 ${getJobTypeLabel(job.employment_type)}`,
    "",
    job.short_description,
    "",
  ];
  if (requirements) {
    lines.push("*דרישות:*", requirements, "");
  }
  if (settings.default_job_post_ending) {
    lines.push(settings.default_job_post_ending);
  }
  if (settings.disclaimer_text) {
    lines.push("", settings.disclaimer_text);
  }
  return lines.filter((l, i, arr) => !(l === "" && arr[i - 1] === "")).join("\n");
}

function shareWhatsappLink(text: string): string {
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}

// --- Form state -------------------------------------------------------------

interface FormState {
  title: string;
  category: string;
  location: string;
  employment_type: JobType;
  priority: JobPriority;
  status: JobStatus;
  short_description: string;
  requirements: string;
  internal_notes: string;
  external_reference: string;
}

function emptyForm(): FormState {
  return {
    title: "",
    category: "",
    location: "",
    employment_type: "full_time",
    priority: "medium",
    status: "draft",
    short_description: "",
    requirements: "",
    internal_notes: "",
    external_reference: "",
  };
}

function formFromJob(job: Job): FormState {
  return {
    title: job.title,
    category: job.category,
    location: job.location,
    employment_type: job.employment_type,
    priority: job.priority,
    status: job.status,
    short_description: job.short_description,
    requirements: job.requirements.join("\n"),
    internal_notes: job.internal_notes,
    external_reference: job.external_reference,
  };
}

function parseRequirements(raw: string): string[] {
  return raw
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
}

// --- Page -------------------------------------------------------------------

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [showArchived, setShowArchived] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function refresh() {
    const data = await listJobs();
    setJobs(data);
    setLoading(false);
  }

  useEffect(() => {
    let active = true;
    Promise.all([listJobs(), getSettings()]).then(([data, s]) => {
      if (!active) return;
      setJobs(data);
      setSettings(s);
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, []);

  function openCreate() {
    setEditingId(null);
    setForm(emptyForm());
    setError(null);
    setFormOpen(true);
  }

  function openEdit(job: Job) {
    setEditingId(job.id);
    setForm(formFromJob(job));
    setError(null);
    setFormOpen(true);
  }

  function closeForm() {
    setFormOpen(false);
  }

  async function handleArchiveToggle(job: Job) {
    await updateJob(job.id, { is_active: !job.is_active });
    await refresh();
  }

  async function handleDuplicate(job: Job) {
    await createJob({
      title: `${job.title} (עותק)`,
      category: job.category,
      location: job.location,
      employment_type: job.employment_type,
      short_description: job.short_description,
      requirements: [...job.requirements],
      priority: job.priority,
      status: "draft",
      internal_notes: job.internal_notes,
      external_reference: job.external_reference,
      is_active: true,
    });
    await refresh();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim() || !form.category.trim()) {
      setError("יש למלא כותרת ותחום לפני השמירה.");
      return;
    }
    setSaving(true);
    const payload: Omit<Job, "id" | "created_at"> = {
      title: form.title.trim(),
      category: form.category.trim(),
      location: form.location.trim(),
      employment_type: form.employment_type,
      short_description: form.short_description.trim(),
      requirements: parseRequirements(form.requirements),
      priority: form.priority,
      status: form.status,
      internal_notes: form.internal_notes.trim(),
      external_reference: form.external_reference.trim(),
      is_active: editingId
        ? jobs.find((j) => j.id === editingId)?.is_active ?? true
        : true,
    };
    if (editingId) {
      await updateJob(editingId, payload);
    } else {
      await createJob(payload);
    }
    setSaving(false);
    setFormOpen(false);
    await refresh();
  }

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  const createButton = (
    <Button variant="gradient" onClick={openCreate}>
      <Plus size={18} />
      משרה חדשה
    </Button>
  );

  const visibleJobs = jobs.filter((j) => showArchived || j.is_active);

  return (
    <div>
      <PageHeader
        title="משרות"
        description="ניהול פנימי של משרות ויצירת פוסטים מוכנים לוואטסאפ (ללא קישור הגשה ציבורי)."
        actions={
          <>
            <Button
              variant="ghost"
              onClick={() => setShowArchived((v) => !v)}
            >
              <Archive size={16} />
              {showArchived ? "הסתרת ארכיון" : "הצגת ארכיון"}
            </Button>
            {createButton}
          </>
        }
      />

      {loading ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-56 animate-pulse rounded-[var(--rf-radius)] bg-white/[0.03]"
            />
          ))}
        </div>
      ) : visibleJobs.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title="אין משרות עדיין"
          description="צרו משרה ראשונה כדי להכין פוסט לשיתוף בערוץ."
          action={createButton}
        />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {visibleJobs.map((job) => (
            <Card
              key={job.id}
              className={`flex flex-col gap-4 ${
                job.is_active ? "" : "opacity-60"
              }`}
            >
              <div className="flex flex-col gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge
                    label={PRIORITY_META[job.priority].label}
                    className={PRIORITY_META[job.priority].badgeClass}
                  />
                  <Badge
                    label={STATUS_META[job.status].label}
                    className={STATUS_META[job.status].badgeClass}
                  />
                  {!job.is_active && (
                    <Badge
                      label="בארכיון"
                      className="bg-zinc-500/15 text-zinc-400 border-zinc-400/30"
                    />
                  )}
                </div>

                <h3 className="text-lg font-bold text-[var(--rf-text)]">
                  {job.title}
                </h3>

                <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-sm text-[var(--rf-text-muted)]">
                  <span className="inline-flex items-center gap-1.5">
                    <FolderTree size={15} />
                    {job.category}
                  </span>
                  {job.location && (
                    <span className="inline-flex items-center gap-1.5">
                      <MapPin size={15} />
                      {job.location}
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1.5">
                    <Clock size={15} />
                    {getJobTypeLabel(job.employment_type)}
                  </span>
                </div>

                {job.short_description && (
                  <p className="text-sm leading-relaxed text-[var(--rf-text)]">
                    {job.short_description}
                  </p>
                )}

                {job.requirements.length > 0 && (
                  <div>
                    <p className="mb-1.5 text-sm font-semibold text-[var(--rf-text)]">
                      דרישות:
                    </p>
                    <ul className="flex list-disc flex-col gap-1 pr-5 text-sm text-[var(--rf-text-muted)]">
                      {job.requirements.map((req, i) => (
                        <li key={i}>{req}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {job.internal_notes && (
                  <p className="rounded-lg border border-amber-400/20 bg-amber-500/5 px-3 py-2 text-xs text-amber-200/80">
                    הערה פנימית: {job.internal_notes}
                  </p>
                )}
              </div>

              <div className="mt-auto flex flex-wrap items-center gap-2 border-t border-white/8 pt-4">
                {settings && (
                  <>
                    <CopyButton
                      value={buildWhatsappPost(job, settings)}
                      label="העתקת פוסט"
                    />
                    <Button variant="outline" size="sm" asChild>
                      <a
                        href={shareWhatsappLink(buildWhatsappPost(job, settings))}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <MessageCircle size={15} />
                        וואטסאפ
                      </a>
                    </Button>
                  </>
                )}
                <Button variant="ghost" size="sm" onClick={() => openEdit(job)}>
                  <Pencil size={15} />
                  עריכה
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDuplicate(job)}
                >
                  <Copy size={15} />
                  שכפול
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleArchiveToggle(job)}
                >
                  {job.is_active ? (
                    <>
                      <Archive size={15} />
                      ארכיון
                    </>
                  ) : (
                    <>
                      <ArchiveRestore size={15} />
                      שחזור
                    </>
                  )}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {formOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={closeForm}
            aria-hidden="true"
          />
          <Card
            variant="elevated"
            className="relative z-10 max-h-[90vh] w-full max-w-lg overflow-y-auto"
          >
            <div className="mb-5 flex items-center justify-between gap-3">
              <h2 className="text-lg font-bold text-[var(--rf-text)]">
                {editingId ? "עריכת משרה" : "משרה חדשה"}
              </h2>
              <button
                type="button"
                onClick={closeForm}
                aria-label="סגירה"
                className="flex h-9 w-9 items-center justify-center rounded-lg text-[var(--rf-text-muted)] transition-colors hover:bg-white/5 hover:text-[var(--rf-text)] focus-ring"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <Field label="כותרת המשרה" htmlFor="job-title" required>
                <TextInput
                  id="job-title"
                  value={form.title}
                  onChange={(e) => updateField("title", e.target.value)}
                  placeholder="לדוגמה: מפתח/ת Fullstack"
                />
              </Field>

              <Field label="תחום" htmlFor="job-category" required>
                <SelectInput
                  id="job-category"
                  value={form.category}
                  onChange={(e) => updateField("category", e.target.value)}
                >
                  <option value="">בחרו תחום…</option>
                  {JOB_CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </SelectInput>
              </Field>

              <Field label="מיקום" htmlFor="job-location">
                <TextInput
                  id="job-location"
                  value={form.location}
                  onChange={(e) => updateField("location", e.target.value)}
                  placeholder="לדוגמה: תל אביב / היברידי"
                />
              </Field>

              <Field label="היקף משרה" htmlFor="job-employment">
                <SelectInput
                  id="job-employment"
                  value={form.employment_type}
                  onChange={(e) =>
                    updateField("employment_type", e.target.value as JobType)
                  }
                >
                  {JOB_TYPE_LIST.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </SelectInput>
              </Field>

              <div className="grid grid-cols-2 gap-4">
                <Field label="עדיפות" htmlFor="job-priority">
                  <SelectInput
                    id="job-priority"
                    value={form.priority}
                    onChange={(e) =>
                      updateField("priority", e.target.value as JobPriority)
                    }
                  >
                    {PRIORITY_OPTIONS.map((p) => (
                      <option key={p.value} value={p.value}>
                        {p.label}
                      </option>
                    ))}
                  </SelectInput>
                </Field>

                <Field label="סטטוס" htmlFor="job-status">
                  <SelectInput
                    id="job-status"
                    value={form.status}
                    onChange={(e) =>
                      updateField("status", e.target.value as JobStatus)
                    }
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s.value} value={s.value}>
                        {s.label}
                      </option>
                    ))}
                  </SelectInput>
                </Field>
              </div>

              <Field label="תיאור קצר" htmlFor="job-description">
                <TextArea
                  id="job-description"
                  value={form.short_description}
                  onChange={(e) =>
                    updateField("short_description", e.target.value)
                  }
                  placeholder="תיאור תמציתי של המשרה…"
                />
              </Field>

              <Field
                label="דרישות"
                htmlFor="job-requirements"
                hint="דרישה אחת בכל שורה."
              >
                <TextArea
                  id="job-requirements"
                  value={form.requirements}
                  onChange={(e) => updateField("requirements", e.target.value)}
                  placeholder={"3+ שנות ניסיון\nניסיון ב-React"}
                />
              </Field>

              <Field
                label="הערות פנימיות"
                htmlFor="job-notes"
                hint="לא נכללות בפוסט המפורסם."
              >
                <TextArea
                  id="job-notes"
                  value={form.internal_notes}
                  onChange={(e) => updateField("internal_notes", e.target.value)}
                  placeholder="לשימוש פנימי בלבד…"
                />
              </Field>

              <Field label="אסמכתא חיצונית (רשות)" htmlFor="job-ref">
                <TextInput
                  id="job-ref"
                  value={form.external_reference}
                  onChange={(e) =>
                    updateField("external_reference", e.target.value)
                  }
                  placeholder="לדוגמה: מספר משרה פנימי"
                />
              </Field>

              {error && (
                <p className="text-sm font-medium text-red-400" role="alert">
                  {error}
                </p>
              )}

              <div className="mt-1 flex items-center justify-end gap-2">
                <Button type="button" variant="ghost" onClick={closeForm}>
                  ביטול
                </Button>
                <Button type="submit" variant="gradient" disabled={saving}>
                  {saving ? "שומר…" : editingId ? "שמירת שינויים" : "יצירת משרה"}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}

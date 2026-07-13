"use client";

import { useEffect, useState } from "react";
import {
  Plus,
  Briefcase,
  X,
  Pencil,
  Trash2,
  MapPin,
  FolderTree,
  Clock,
} from "lucide-react";
import { PageHeader } from "@/components/admin/PageHeader";
import { EmptyState } from "@/components/admin/EmptyState";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { CopyButton } from "@/components/ui/CopyButton";
import { Field, TextInput, SelectInput, TextArea } from "@/components/ui/Field";
import {
  JOB_TYPE_LIST,
  getJobTypeLabel,
} from "@/config/jobTypes";
import {
  listJobs,
  createJob,
  updateJob,
  deleteJob,
} from "@/services/jobService";
import type { Job, JobType, JobPriority, JobStatus } from "@/types";

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

// --- WhatsApp post formatter ------------------------------------------------

function buildWhatsappPost(job: Job): string {
  const requirements = job.requirements
    .map((req) => `- ${req}`)
    .join("\n");
  return [
    `🚀 *${job.title}*`,
    `📁 ${job.category}`,
    `📍 ${job.location}`,
    `🕒 ${getJobTypeLabel(job.employment_type)}`,
    "",
    job.short_description,
    "",
    "*דרישות:*",
    requirements,
    "",
    `🔗 להגשה: ${job.application_link}`,
    "",
    "(המשרה מפורסמת דרך תוכנית הפניית עובדים)",
  ].join("\n");
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
  application_link: string;
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
    application_link: "",
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
    application_link: job.application_link,
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
  const [loading, setLoading] = useState(true);
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

  // Initial load — active flag avoids synchronous setState in the effect.
  useEffect(() => {
    let active = true;
    listJobs().then((data) => {
      if (!active) return;
      setJobs(data);
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

  async function handleDelete(id: string) {
    await deleteJob(id);
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
      application_link: form.application_link.trim(),
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

  function updateField<K extends keyof FormState>(
    key: K,
    value: FormState[K],
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  const createButton = (
    <Button variant="gradient" onClick={openCreate}>
      <Plus size={18} />
      משרה חדשה
    </Button>
  );

  return (
    <div>
      <PageHeader
        title="משרות"
        description="ניהול משרות לפרסום בערוץ הוואטסאפ."
        actions={createButton}
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
      ) : jobs.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title="אין משרות עדיין"
          description="צרו משרה ראשונה כדי לשתף בערוץ."
          action={createButton}
        />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {jobs.map((job) => (
            <Card key={job.id} className="flex flex-col gap-4">
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
                </div>

                <h3 className="text-lg font-bold text-[var(--rf-text)]">
                  {job.title}
                </h3>

                <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-sm text-[var(--rf-text-muted)]">
                  <span className="inline-flex items-center gap-1.5">
                    <FolderTree size={15} />
                    {job.category}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin size={15} />
                    {job.location}
                  </span>
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
              </div>

              <div className="mt-auto flex flex-wrap items-center gap-2 border-t border-white/8 pt-4">
                <CopyButton
                  value={buildWhatsappPost(job)}
                  label="העתקת פוסט לוואטסאפ"
                />
                <Button variant="ghost" size="sm" onClick={() => openEdit(job)}>
                  <Pencil size={15} />
                  עריכה
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => handleDelete(job.id)}
                >
                  <Trash2 size={15} />
                  מחיקה
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

              <Field label="קישור להגשה" htmlFor="job-link">
                <TextInput
                  id="job-link"
                  dir="ltr"
                  value={form.application_link}
                  onChange={(e) =>
                    updateField("application_link", e.target.value)
                  }
                  placeholder="https://"
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

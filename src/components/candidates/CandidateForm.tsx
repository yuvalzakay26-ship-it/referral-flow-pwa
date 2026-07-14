"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  User,
  Briefcase,
  Radio,
  FileText,
  Target,
  Loader2,
  Save,
  ExternalLink,
  MessageCircle,
  Wand2,
  X,
  AlertTriangle,
  FileWarning,
} from "lucide-react";

import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Field, TextInput, SelectInput, TextArea } from "@/components/ui/Field";
import { RadioPills, ChipMultiSelect } from "@/components/ui/Choice";
import { CopyButton } from "@/components/ui/CopyButton";
import { CvUpload } from "./CvUpload";

import { candidateInputSchema, deriveEligibility } from "@/lib/validation";
import {
  PROFESSIONAL_FIELDS,
  WORK_AREAS,
  EDUCATION_LEVELS,
  STUDY_YEARS,
  JOB_TYPE_LIST,
} from "@/config/jobTypes";
import { SOURCE_LIST } from "@/config/sources";
import { STATUS_LIST } from "@/config/statuses";
import { ELIGIBILITY, getEligibilityMeta } from "@/config/eligibility";
import {
  ELIGIBILITY_QUESTIONS,
  YES_NO_UNSURE_LABELS,
} from "@/config/eligibility";
import { BONUS_STATUS_LIST } from "@/config/bonus";
import { DEFAULT_SETTINGS } from "@/config/settings";
import { USE_MOCK_DATA } from "@/config/app";
import {
  createCandidate,
  updateCandidate,
  updateCandidateStatus,
  findDuplicates,
  type DuplicateMatch,
} from "@/services/candidateService";
import {
  sanitizeFileName,
  formatIsraeliPhone,
  whatsappLink,
} from "@/lib/utils";
import type { Candidate, YesNoUnsure } from "@/types";

const DRAFT_KEY = "rf_new_candidate_draft";

type Values = {
  full_name: string;
  phone: string;
  email: string;
  city: string;
  linkedin_url: string;
  whatsapp_number: string;
  professional_field: string;
  current_role: string;
  years_of_experience: number;
  education: string;
  study_year: string;
  preferred_job_types: string[];
  preferred_locations: string[];
  preferred_job_categories: string[];
  technical_skills: string[];
  professional_summary: string;
  applied_last_12_months: YesNoUnsure;
  referred_by_another_employee: YesNoUnsure;
  contacted_recruiter_before: YesNoUnsure;
  source: string;
  source_details: string;
  date_received: string;
  referred_position: string;
  general_category: string;
  internal_notes: string;
  status: string;
  eligibility_status: string;
  referral_date: string;
  follow_up_date: string;
  bonus_status: string;
  bonus_amount: number | null;
  closure_reason: string;
};

const yesNoOptions: { value: YesNoUnsure; label: string }[] = [
  { value: "yes", label: YES_NO_UNSURE_LABELS.yes },
  { value: "no", label: YES_NO_UNSURE_LABELS.no },
  { value: "unsure", label: YES_NO_UNSURE_LABELS.unsure },
];

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

function emptyValues(): Values {
  return {
    full_name: "",
    phone: "",
    email: "",
    city: "",
    linkedin_url: "",
    whatsapp_number: "",
    professional_field: "",
    current_role: "",
    years_of_experience: 0,
    education: "",
    study_year: "",
    preferred_job_types: [],
    preferred_locations: [],
    preferred_job_categories: [],
    technical_skills: [],
    professional_summary: "",
    applied_last_12_months: "no",
    referred_by_another_employee: "no",
    contacted_recruiter_before: "no",
    source: "whatsapp-channel",
    source_details: "",
    date_received: todayISO(),
    referred_position: "",
    general_category: "",
    internal_notes: "",
    status: "new",
    eligibility_status: "eligible",
    referral_date: "",
    follow_up_date: "",
    bonus_status: "none",
    bonus_amount: null,
    closure_reason: "",
  };
}

function valuesFromCandidate(c: Candidate): Values {
  return {
    full_name: c.full_name,
    phone: c.phone,
    email: c.email,
    city: c.city,
    linkedin_url: c.linkedin_url ?? "",
    whatsapp_number: c.whatsapp_number ?? "",
    professional_field: c.professional_field,
    current_role: c.current_role,
    years_of_experience: c.years_of_experience,
    education: c.education,
    study_year: c.study_year ?? "",
    preferred_job_types: c.preferred_job_types,
    preferred_locations: c.preferred_locations,
    preferred_job_categories: c.preferred_job_categories ?? [],
    technical_skills: c.technical_skills ?? [],
    professional_summary: c.professional_summary,
    applied_last_12_months: c.applied_last_12_months,
    referred_by_another_employee: c.referred_by_another_employee,
    contacted_recruiter_before: c.contacted_recruiter_before,
    source: c.source,
    source_details: c.source_details ?? "",
    date_received: (c.date_received ?? c.created_at).slice(0, 10),
    referred_position: c.referred_position ?? "",
    general_category: c.general_category ?? "",
    internal_notes: c.internal_notes,
    status: c.status,
    eligibility_status: c.eligibility_status,
    referral_date: c.referral_date ?? "",
    follow_up_date: c.follow_up_date ?? "",
    bonus_status: c.bonus_status,
    bonus_amount: c.bonus_amount,
    closure_reason: c.closure_reason ?? "",
  };
}

interface CandidateFormProps {
  mode: "create" | "edit";
  initial?: Candidate;
  onSaved?: (c: Candidate) => void;
  onCancel?: () => void;
}

export function CandidateForm({
  mode,
  initial,
  onSaved,
  onCancel,
}: CandidateFormProps) {
  const router = useRouter();
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [existingCv, setExistingCv] = useState<string | null>(
    mode === "edit" ? initial?.cv_file_name ?? null : null,
  );
  const [saving, setSaving] = useState<null | "save" | "open">(null);
  const [duplicates, setDuplicates] = useState<DuplicateMatch[]>([]);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    getValues,
    reset,
    formState: { errors, isDirty },
  } = useForm<Values>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(candidateInputSchema) as any,
    mode: "onTouched",
    defaultValues:
      mode === "edit" && initial
        ? valuesFromCandidate(initial)
        : emptyValues(),
  });

  const education = watch("education");
  const isStudent = education?.includes("סטודנט");
  const status = watch("status");
  const bonusStatus = watch("bonus_status");

  // --- Local draft autosave (create mode only, non-file data) ---------------
  const hydrated = useRef(false);
  useEffect(() => {
    if (mode !== "create" || hydrated.current) return;
    hydrated.current = true;
    try {
      const raw = window.localStorage.getItem(DRAFT_KEY);
      if (raw) {
        const draft = JSON.parse(raw) as Partial<Values>;
        reset({ ...emptyValues(), ...draft });
      }
    } catch {
      /* ignore malformed drafts */
    }
  }, [mode, reset]);

  useEffect(() => {
    if (mode !== "create") return;
    const sub = watch((values) => {
      try {
        window.localStorage.setItem(DRAFT_KEY, JSON.stringify(values));
      } catch {
        /* storage may be unavailable */
      }
    });
    return () => sub.unsubscribe();
  }, [mode, watch]);

  // --- Confirm before discarding unsaved changes ----------------------------
  useEffect(() => {
    function onBeforeUnload(e: BeforeUnloadEvent) {
      if (isDirty && !saving) {
        e.preventDefault();
        e.returnValue = "";
      }
    }
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [isDirty, saving]);

  // --- Duplicate detection (by normalized phone / email) --------------------
  async function checkDuplicates() {
    const { phone, email } = getValues();
    if (!phone && !email) return;
    const matches = await findDuplicates(phone, email, initial?.id);
    setDuplicates(matches);
  }

  function applyDerivedEligibility() {
    const v = getValues();
    setValue("eligibility_status", deriveEligibility(v), {
      shouldDirty: true,
    });
  }

  function normalizePhoneField() {
    const v = getValues();
    setValue("phone", formatIsraeliPhone(v.phone), { shouldDirty: true });
  }

  function clearDraft() {
    try {
      window.localStorage.removeItem(DRAFT_KEY);
    } catch {
      /* ignore */
    }
  }

  function buildInput(values: Values) {
    const cvName = cvFile
      ? sanitizeFileName(cvFile.name)
      : mode === "edit"
        ? existingCv
        : null;
    return {
      full_name: values.full_name.trim(),
      phone: values.phone.trim(),
      email: values.email.trim(),
      city: values.city.trim(),
      linkedin_url: values.linkedin_url.trim() || null,
      whatsapp_number: values.whatsapp_number.trim() || values.phone.trim(),
      professional_field: values.professional_field,
      current_role: values.current_role.trim(),
      years_of_experience: values.years_of_experience,
      education: values.education,
      study_year: isStudent ? values.study_year || null : null,
      preferred_job_types: values.preferred_job_types as never,
      preferred_locations: values.preferred_locations,
      preferred_job_categories: values.preferred_job_categories,
      technical_skills: values.technical_skills,
      professional_summary: values.professional_summary.trim(),
      cv_file_name: cvName,
      applied_last_12_months: values.applied_last_12_months,
      referred_by_another_employee: values.referred_by_another_employee,
      contacted_recruiter_before: values.contacted_recruiter_before,
      eligibility_status: values.eligibility_status as never,
      source: values.source as never,
      source_details: values.source_details.trim(),
      date_received: values.date_received || null,
      status: values.status as never,
      internal_notes: values.internal_notes.trim(),
      referral_date: values.referral_date || null,
      referred_position: values.referred_position.trim() || null,
      general_category: values.general_category.trim() || null,
      follow_up_date: values.follow_up_date || null,
      bonus_status: values.bonus_status as never,
      bonus_amount:
        values.bonus_amount != null && !Number.isNaN(values.bonus_amount)
          ? values.bonus_amount
          : null,
      closure_reason: values.closure_reason.trim() || null,
    };
  }

  async function submit(values: Values, andOpen: boolean) {
    setSaving(andOpen ? "open" : "save");
    setServerError(null);
    try {
      const input = buildInput(values);
      if (mode === "create") {
        const created = await createCandidate(input);
        clearDraft();
        if (andOpen) router.push(`/admin/candidates/${created.id}`);
        else router.push("/admin/candidates");
        return;
      }
      // edit mode
      const id = initial!.id;
      if (values.status !== initial!.status) {
        await updateCandidateStatus(
          id,
          values.status as never,
          DEFAULT_SETTINGS.admin_display_name,
        );
      }
      const cvName = input.cv_file_name;
      const updated = await updateCandidate(id, {
        ...input,
        cv_storage_path: cvName ? `cvs/${id}/${cvName}` : null,
        eligibility_status: input.eligibility_status,
      });
      if (updated) onSaved?.(updated);
    } catch {
      setServerError("אירעה שגיאה בשמירה. נסו שוב.");
    } finally {
      setSaving(null);
    }
  }

  function handleCancel() {
    if (isDirty) {
      const ok = window.confirm(
        "יש שינויים שלא נשמרו. לצאת ולבטל את השינויים?",
      );
      if (!ok) return;
    }
    if (mode === "create") {
      clearDraft();
      router.push("/admin/candidates");
    } else {
      onCancel?.();
    }
  }

  const phoneVal = watch("phone");
  const emailVal = watch("email");
  const busy = saving !== null;

  return (
    <form
      onSubmit={handleSubmit((v) => submit(v, false))}
      noValidate
      className="pb-24 lg:pb-0"
    >
      {/* Duplicate warning */}
      {duplicates.length > 0 && (
        <div className="mb-4 rounded-2xl border border-amber-400/30 bg-amber-500/10 p-4">
          <div className="flex items-start gap-2">
            <AlertTriangle
              size={18}
              className="mt-0.5 flex-none text-amber-300"
            />
            <div className="text-sm text-amber-100">
              <p className="font-semibold">אזהרת כפילות פנימית בלבד</p>
              <p className="mt-0.5 leading-relaxed text-amber-100/90">
                נמצאו רשומות עם טלפון או אימייל זהים. זו בדיקה פנימית של רשומות
                המערכת שלך בלבד — ואינה אישור שהמועמד/ת קיים/ת במערכות הגיוס של
                NESS.
              </p>
              <ul className="mt-2 flex flex-col gap-1">
                {duplicates.map((d) => (
                  <li key={d.candidate.id}>
                    <a
                      href={`/admin/candidates/${d.candidate.id}`}
                      className="font-medium underline hover:no-underline"
                    >
                      {d.candidate.full_name}
                    </a>{" "}
                    <span className="text-amber-100/70">
                      ({d.reason === "phone" ? "טלפון זהה" : "אימייל זהה"})
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Personal details */}
        <Card>
          <CardHeader>
            <CardTitle>פרטים אישיים</CardTitle>
            <User size={18} className="text-[var(--rf-text-muted)]" />
          </CardHeader>
          <div className="flex flex-col gap-4">
            <Field
              label="שם מלא"
              htmlFor="full_name"
              required
              error={errors.full_name?.message}
            >
              <TextInput
                id="full_name"
                autoComplete="off"
                placeholder="ישראל ישראלי"
                {...register("full_name")}
              />
            </Field>
            <Field
              label="טלפון"
              htmlFor="phone"
              required
              error={errors.phone?.message}
            >
              <TextInput
                id="phone"
                inputMode="tel"
                dir="ltr"
                placeholder="050-0000000"
                {...register("phone", { onBlur: checkDuplicates })}
              />
              <div className="mt-2 flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={normalizePhoneField}
                >
                  <Wand2 size={14} />
                  נורמליזציה
                </Button>
                <CopyButton value={phoneVal} label="העתקת טלפון" />
                <Button type="button" variant="ghost" size="sm" asChild>
                  <a
                    href={whatsappLink(phoneVal)}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <MessageCircle size={14} />
                    וואטסאפ
                  </a>
                </Button>
              </div>
            </Field>
            <Field
              label="אימייל"
              htmlFor="email"
              required
              error={errors.email?.message}
            >
              <TextInput
                id="email"
                inputMode="email"
                dir="ltr"
                placeholder="name@example.com"
                {...register("email", { onBlur: checkDuplicates })}
              />
              <div className="mt-2">
                <CopyButton value={emailVal} label="העתקת אימייל" />
              </div>
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                label="עיר / אזור"
                htmlFor="city"
                required
                error={errors.city?.message}
              >
                <TextInput id="city" placeholder="תל אביב" {...register("city")} />
              </Field>
              <Field label="וואטסאפ (רשות)" htmlFor="whatsapp_number">
                <TextInput
                  id="whatsapp_number"
                  dir="ltr"
                  placeholder="ברירת מחדל: הטלפון"
                  {...register("whatsapp_number")}
                />
              </Field>
            </div>
            <Field
              label="קישור LinkedIn (רשות)"
              htmlFor="linkedin_url"
              error={errors.linkedin_url?.message}
            >
              <TextInput
                id="linkedin_url"
                dir="ltr"
                placeholder="https://linkedin.com/in/..."
                {...register("linkedin_url")}
              />
            </Field>
          </div>
        </Card>

        {/* Professional details */}
        <Card>
          <CardHeader>
            <CardTitle>פרטים מקצועיים</CardTitle>
            <Briefcase size={18} className="text-[var(--rf-text-muted)]" />
          </CardHeader>
          <div className="flex flex-col gap-4">
            <Field
              label="תחום מקצועי"
              htmlFor="professional_field"
              required
              error={errors.professional_field?.message}
            >
              <SelectInput
                id="professional_field"
                {...register("professional_field")}
              >
                <option value="">בחרו תחום…</option>
                {PROFESSIONAL_FIELDS.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </SelectInput>
            </Field>
            <Field label="תפקיד נוכחי" htmlFor="current_role">
              <TextInput
                id="current_role"
                placeholder="לדוגמה: מפתח/ת Frontend"
                {...register("current_role")}
              />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                label="שנות ניסיון"
                htmlFor="years_of_experience"
                error={errors.years_of_experience?.message}
              >
                <TextInput
                  id="years_of_experience"
                  type="number"
                  min={0}
                  max={60}
                  dir="ltr"
                  inputMode="numeric"
                  {...register("years_of_experience", { valueAsNumber: true })}
                />
              </Field>
              <Field label="השכלה" htmlFor="education">
                <SelectInput id="education" {...register("education")}>
                  <option value="">בחרו…</option>
                  {EDUCATION_LEVELS.map((e) => (
                    <option key={e} value={e}>
                      {e}
                    </option>
                  ))}
                </SelectInput>
              </Field>
            </div>
            {isStudent && (
              <Field label="שנת לימודים" htmlFor="study_year">
                <SelectInput id="study_year" {...register("study_year")}>
                  <option value="">בחרו שנה…</option>
                  {STUDY_YEARS.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </SelectInput>
              </Field>
            )}
            <Field label="קטגוריות משרה מועדפות">
              <Controller
                control={control}
                name="preferred_job_categories"
                render={({ field }) => (
                  <ChipMultiSelect
                    options={PROFESSIONAL_FIELDS.map((f) => ({
                      value: f,
                      label: f,
                    }))}
                    value={field.value ?? []}
                    onChange={field.onChange}
                  />
                )}
              />
            </Field>
            <Field label="סוגי העסקה מועדפים">
              <Controller
                control={control}
                name="preferred_job_types"
                render={({ field }) => (
                  <ChipMultiSelect
                    options={JOB_TYPE_LIST.map((j) => ({
                      value: j.value,
                      label: j.label,
                    }))}
                    value={field.value ?? []}
                    onChange={field.onChange}
                  />
                )}
              />
            </Field>
            <Field label="אזורי עבודה מועדפים">
              <Controller
                control={control}
                name="preferred_locations"
                render={({ field }) => (
                  <ChipMultiSelect
                    options={WORK_AREAS.map((w) => ({ value: w, label: w }))}
                    value={field.value ?? []}
                    onChange={field.onChange}
                  />
                )}
              />
            </Field>
            <Field
              label="כישורים / מילות מפתח"
              htmlFor="technical_skills"
              hint="הפרידו בפסיקים (למשל: React, TypeScript, AWS)"
            >
              <Controller
                control={control}
                name="technical_skills"
                render={({ field }) => (
                  <TextInput
                    id="technical_skills"
                    value={(field.value ?? []).join(", ")}
                    onChange={(e) =>
                      field.onChange(
                        e.target.value
                          .split(",")
                          .map((s) => s.trim())
                          .filter(Boolean),
                      )
                    }
                    placeholder="React, TypeScript, Node.js"
                  />
                )}
              />
            </Field>
            <Field label="תקציר מקצועי" htmlFor="professional_summary">
              <TextArea
                id="professional_summary"
                rows={3}
                placeholder="כמה מילים על הניסיון והשאיפות…"
                {...register("professional_summary")}
              />
            </Field>
          </div>
        </Card>

        {/* Referral details */}
        <Card>
          <CardHeader>
            <CardTitle>פרטי הפניה</CardTitle>
            <Radio size={18} className="text-[var(--rf-text-muted)]" />
          </CardHeader>
          <div className="flex flex-col gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="מקור" htmlFor="source">
                <SelectInput id="source" {...register("source")}>
                  {SOURCE_LIST.map((s) => (
                    <option key={s.key} value={s.key}>
                      {s.label}
                    </option>
                  ))}
                </SelectInput>
              </Field>
              <Field label="פרטי מקור / שם קבוצה" htmlFor="source_details">
                <TextInput
                  id="source_details"
                  placeholder="לדוגמה: קבוצת הייטק דרום"
                  {...register("source_details")}
                />
              </Field>
            </div>
            <Field label="תאריך קבלה" htmlFor="date_received">
              <TextInput
                id="date_received"
                type="date"
                dir="ltr"
                {...register("date_received")}
              />
            </Field>

            <div className="rounded-xl border border-amber-400/15 bg-amber-500/[0.04] p-3">
              <p className="mb-3 text-xs leading-relaxed text-amber-200/80">
                שאלות זכאות — מועמד/ת שכבר קיים/ת במערכת עשוי/ה שלא להיות זכאי/ת
                כהפניה חדשה.
              </p>
              <div className="flex flex-col gap-3">
                {ELIGIBILITY_QUESTIONS.map((q) => (
                  <Field key={q.key} label={q.question}>
                    <Controller
                      control={control}
                      name={q.key}
                      render={({ field }) => (
                        <RadioPills
                          options={yesNoOptions}
                          value={field.value}
                          onChange={field.onChange}
                          name={q.key}
                        />
                      )}
                    />
                  </Field>
                ))}
              </div>
            </div>

            <Field label="סטטוס זכאות" htmlFor="eligibility_status">
              <SelectInput
                id="eligibility_status"
                {...register("eligibility_status")}
              >
                {Object.values(ELIGIBILITY).map((e) => (
                  <option key={e.value} value={e.value}>
                    {e.label}
                  </option>
                ))}
              </SelectInput>
              <button
                type="button"
                onClick={applyDerivedEligibility}
                className="mt-1.5 self-start text-xs font-medium text-[var(--rf-cyan)] hover:underline"
              >
                החלת המלצה אוטומטית (
                {getEligibilityMeta(deriveEligibility(getValues())).label})
              </button>
            </Field>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="משרה רלוונטית" htmlFor="referred_position">
                <TextInput
                  id="referred_position"
                  placeholder="שם המשרה"
                  {...register("referred_position")}
                />
              </Field>
              <Field label="קטגוריה מקצועית כללית" htmlFor="general_category">
                <TextInput
                  id="general_category"
                  placeholder="כשאין משרה ספציפית"
                  {...register("general_category")}
                />
              </Field>
            </div>
            <Field label="הערות פנימיות" htmlFor="internal_notes">
              <TextArea
                id="internal_notes"
                rows={2}
                placeholder="הערות לשימוש פנימי בלבד…"
                {...register("internal_notes")}
              />
            </Field>
          </div>
        </Card>

        {/* CV + tracking */}
        <div className="flex flex-col gap-4">
          <Card>
            <CardHeader>
              <CardTitle>קורות חיים</CardTitle>
              <FileText size={18} className="text-[var(--rf-text-muted)]" />
            </CardHeader>
            {existingCv && !cvFile ? (
              <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-[var(--rf-surface-2)]/60 p-4">
                <FileText
                  size={20}
                  className="flex-none text-[var(--rf-magenta)]"
                />
                <span className="min-w-0 flex-1 truncate text-sm text-[var(--rf-text)]">
                  {existingCv}
                </span>
                <button
                  type="button"
                  onClick={() => setExistingCv(null)}
                  aria-label="הסרת הקובץ"
                  className="rounded-lg p-1.5 text-[var(--rf-text-muted)] hover:bg-white/5 hover:text-red-400 focus-ring"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <CvUpload file={cvFile} onChange={setCvFile} />
            )}
            {USE_MOCK_DATA && (
              <p className="mt-3 flex items-start gap-2 rounded-xl border border-amber-400/20 bg-amber-500/5 px-3 py-2 text-xs leading-relaxed text-amber-200/80">
                <FileWarning size={14} className="mt-0.5 flex-none" />
                מצב הדגמה: הקובץ אינו נשמר בפועל ואין להעלות קורות חיים אמיתיים.
                בסביבת אמת הקובץ נשמר ב-Supabase Storage פרטי בלבד.
              </p>
            )}
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>מעקב וסטטוס</CardTitle>
              <Target size={18} className="text-[var(--rf-text-muted)]" />
            </CardHeader>
            <div className="flex flex-col gap-4">
              <Field label="סטטוס מועמד/ת" htmlFor="status">
                <SelectInput id="status" {...register("status")}>
                  {STATUS_LIST.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </SelectInput>
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="תאריך הפניה" htmlFor="referral_date">
                  <TextInput
                    id="referral_date"
                    type="date"
                    dir="ltr"
                    {...register("referral_date")}
                  />
                </Field>
                <Field label="תאריך מעקב" htmlFor="follow_up_date">
                  <TextInput
                    id="follow_up_date"
                    type="date"
                    dir="ltr"
                    {...register("follow_up_date")}
                  />
                </Field>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="סטטוס בונוס" htmlFor="bonus_status">
                  <SelectInput id="bonus_status" {...register("bonus_status")}>
                    {BONUS_STATUS_LIST.map((b) => (
                      <option key={b.value} value={b.value}>
                        {b.label}
                      </option>
                    ))}
                  </SelectInput>
                </Field>
                <Field label="סכום בונוס (₪)" htmlFor="bonus_amount">
                  <TextInput
                    id="bonus_amount"
                    type="number"
                    min={0}
                    dir="ltr"
                    {...register("bonus_amount", {
                      setValueAs: (v) =>
                        v === "" || v == null ? null : Number(v),
                    })}
                  />
                </Field>
              </div>
              {(status === "closed" ||
                status === "not_suitable" ||
                bonusStatus === "not_eligible") && (
                <Field label="סיבת סגירה / דחייה" htmlFor="closure_reason">
                  <TextInput
                    id="closure_reason"
                    placeholder="לדוגמה: מצא/ה עבודה אחרת"
                    {...register("closure_reason")}
                  />
                </Field>
              )}
            </div>
          </Card>
        </div>
      </div>

      {serverError && (
        <p
          className="mt-4 rounded-lg border border-red-400/30 bg-red-500/10 px-3 py-2 text-sm text-red-300"
          role="alert"
        >
          {serverError}
        </p>
      )}

      {/* Desktop actions */}
      <div className="mt-6 hidden flex-wrap items-center justify-end gap-2 lg:flex">
        <Button type="button" variant="ghost" onClick={handleCancel}>
          ביטול
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={busy}
          onClick={handleSubmit((v) => submit(v, true))}
        >
          {saving === "open" ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <ExternalLink size={16} />
          )}
          {mode === "create" ? "שמירה ופתיחה" : "שמירה ורענון"}
        </Button>
        <Button type="submit" variant="gradient" disabled={busy}>
          {saving === "save" ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Save size={16} />
          )}
          שמירה
        </Button>
      </div>

      {/* Sticky mobile action bar */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-white/8 glass-elevated p-3 lg:hidden">
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            size="md"
            className="flex-none"
            onClick={handleCancel}
          >
            ביטול
          </Button>
          <Button
            type="button"
            variant="outline"
            size="md"
            className="flex-1"
            disabled={busy}
            onClick={handleSubmit((v) => submit(v, true))}
          >
            {saving === "open" ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <ExternalLink size={16} />
            )}
            שמירה ופתיחה
          </Button>
          <Button
            type="submit"
            variant="gradient"
            size="md"
            className="flex-1"
            disabled={busy}
          >
            {saving === "save" ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Save size={16} />
            )}
            שמירה
          </Button>
        </div>
      </div>
    </form>
  );
}

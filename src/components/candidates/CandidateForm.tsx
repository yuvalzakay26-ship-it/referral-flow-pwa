"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Save, ExternalLink, AlertTriangle } from "lucide-react";

import { Button } from "@/components/ui/Button";

import { candidateInputSchema } from "@/lib/validation";
import { deriveEligibility } from "@/lib/eligibility";
import { DEFAULT_SETTINGS } from "@/config/settings";
import {
  createCandidate,
  updateCandidate,
  updateCandidateStatus,
  findDuplicates,
  type DuplicateMatch,
} from "@/services/candidateService";
import { sanitizeFileName, formatIsraeliPhone } from "@/lib/utils";
import type { Candidate } from "@/types";

import type { Values } from "./form/types";
import { PersonalDetailsSection } from "./form/PersonalDetailsSection";
import { ProfessionalDetailsSection } from "./form/ProfessionalDetailsSection";
import { ReferralDetailsSection } from "./form/ReferralDetailsSection";
import { CvSection } from "./form/CvSection";
import { TrackingSection } from "./form/TrackingSection";

const DRAFT_KEY = "rf_new_candidate_draft";

/** Debounce window for persisting the create-mode draft to localStorage. */
const DRAFT_SAVE_MS = 500;

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
  const isStudent = Boolean(education?.includes("סטודנט"));
  const status = watch("status");
  const bonusStatus = watch("bonus_status");
  const phoneVal = watch("phone");
  const emailVal = watch("email");

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

  // Persist the draft on a trailing debounce instead of on every keystroke.
  // The watch subscription only (cheaply) reschedules a timer; the serialize +
  // localStorage write happens at most once per DRAFT_SAVE_MS. A pending write
  // is flushed on unmount / navigation so nothing typed just before leaving is
  // lost. Only serializable form values are stored — the CV File object is held
  // in separate React state and never serialized.
  useEffect(() => {
    if (mode !== "create") return;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let pending: Values | undefined;
    const flush = () => {
      if (!pending) return;
      try {
        window.localStorage.setItem(DRAFT_KEY, JSON.stringify(pending));
      } catch {
        /* storage may be unavailable */
      }
      pending = undefined;
    };
    const sub = watch((values) => {
      pending = values as Values;
      if (timer) clearTimeout(timer);
      timer = setTimeout(flush, DRAFT_SAVE_MS);
    });
    return () => {
      sub.unsubscribe();
      if (timer) clearTimeout(timer);
      flush();
    };
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
        // The eligibility select is hidden on the simplified create form, so
        // derive the standing from the three referral questions at save time.
        input.eligibility_status = deriveEligibility(values) as never;
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

  const busy = saving !== null;

  return (
    <form
      onSubmit={handleSubmit((v) => submit(v, false))}
      noValidate
      className="pb-mobile-action-bar"
    >
      {/* Duplicate warning */}
      {duplicates.length > 0 && (
        <div className="rf-badge badge-amber mb-4 rounded-2xl border p-4">
          <div className="flex items-start gap-2">
            <AlertTriangle size={18} className="mt-0.5 flex-none" />
            <div className="text-sm">
              <p className="font-semibold">אזהרת כפילות פנימית בלבד</p>
              <p className="mt-0.5 leading-relaxed">
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
                    <span className="opacity-80">
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
        <PersonalDetailsSection
          register={register}
          errors={errors}
          phoneVal={phoneVal}
          emailVal={emailVal}
          mode={mode}
          onCheckDuplicates={checkDuplicates}
          onNormalizePhone={normalizePhoneField}
        />

        <ProfessionalDetailsSection
          register={register}
          control={control}
          errors={errors}
          isStudent={isStudent}
          mode={mode}
        />

        <ReferralDetailsSection
          register={register}
          control={control}
          errors={errors}
          getValues={getValues}
          mode={mode}
          onApplyDerivedEligibility={applyDerivedEligibility}
        />

        {/* CV + tracking */}
        <div className="flex flex-col gap-4">
          <CvSection
            existingCv={existingCv}
            cvFile={cvFile}
            onChangeCvFile={setCvFile}
            onRemoveExistingCv={() => setExistingCv(null)}
          />
          <TrackingSection
            register={register}
            status={status}
            bonusStatus={bonusStatus}
            mode={mode}
          />
        </div>
      </div>

      {serverError && (
        <p
          className="rf-badge badge-red mt-4 rounded-lg border px-3 py-2 text-sm"
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

      {/* Sticky mobile action bar — pinned above the fixed bottom nav via the
          shared .mobile-action-bar utility (see globals.css). */}
      <div className="mobile-action-bar p-3 lg:hidden">
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

"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Loader2, Send } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Field, TextInput, SelectInput, TextArea } from "@/components/ui/Field";
import { RadioPills, ChipMultiSelect, Checkbox } from "@/components/ui/Choice";
import { StepIndicator } from "./StepIndicator";
import { CvUpload } from "./CvUpload";
import { SuccessScreen } from "./SuccessScreen";

import {
  candidateFormSchema,
  type CandidateFormValues,
} from "@/lib/validation";
import {
  PROFESSIONAL_FIELDS,
  WORK_AREAS,
  EDUCATION_LEVELS,
  STUDY_YEARS,
  JOB_TYPE_LIST,
} from "@/config/jobTypes";
import { ELIGIBILITY_QUESTIONS, YES_NO_UNSURE_LABELS } from "@/config/eligibility";
import { PRIVACY_NOTICE, DISCLAIMER_TEXT, USE_MOCK_DATA } from "@/config/app";
import { submitApplication } from "@/app/(public)/apply/actions";
import { createCandidate } from "@/services/candidateService";
import { sanitizeFileName } from "@/lib/utils";
import type { SourceKey, SubmissionResult, YesNoUnsure } from "@/types";

const STEP_LABELS = [
  "פרטים אישיים",
  "מידע מקצועי",
  "קורות חיים",
  "זכאות",
  "אישור",
];

// Fields validated when advancing from each step.
const STEP_FIELDS: (keyof CandidateFormValues)[][] = [
  ["full_name", "phone", "email", "city"],
  [
    "professional_field",
    "current_role",
    "years_of_experience",
    "education",
    "preferred_job_types",
    "preferred_locations",
  ],
  [], // CV handled separately
  [
    "applied_last_12_months",
    "referred_by_another_employee",
    "contacted_recruiter_before",
  ],
  ["consent"],
];

const yesNoOptions: { value: YesNoUnsure; label: string }[] = [
  { value: "yes", label: YES_NO_UNSURE_LABELS.yes },
  { value: "no", label: YES_NO_UNSURE_LABELS.no },
  { value: "unsure", label: YES_NO_UNSURE_LABELS.unsure },
];

export function ApplyForm({ initialSource }: { initialSource: SourceKey }) {
  const [step, setStep] = useState(0);
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [cvError, setCvError] = useState<string | undefined>();
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [result, setResult] = useState<SubmissionResult | null>(null);

  const {
    register,
    control,
    handleSubmit,
    trigger,
    watch,
    formState: { errors },
  } = useForm<CandidateFormValues>({
    resolver: zodResolver(candidateFormSchema),
    mode: "onTouched",
    defaultValues: {
      full_name: "",
      phone: "",
      email: "",
      city: "",
      professional_field: "",
      current_role: "",
      years_of_experience: 0,
      education: "",
      study_year: "",
      preferred_job_types: [],
      preferred_locations: [],
      professional_summary: "",
      applied_last_12_months: undefined,
      referred_by_another_employee: undefined,
      contacted_recruiter_before: undefined,
      consent: false as unknown as true,
    },
  });

  const education = watch("education");
  const isStudent = education?.includes("סטודנט");

  async function next() {
    const fields = STEP_FIELDS[step];
    const valid = fields.length ? await trigger(fields) : true;
    if (step === 2 && !cvFile) {
      setCvError("יש להעלות קובץ קורות חיים כדי להמשיך");
      return;
    }
    if (valid) {
      setCvError(undefined);
      setStep((s) => Math.min(s + 1, STEP_LABELS.length - 1));
    }
  }

  function back() {
    setStep((s) => Math.max(s - 1, 0));
  }

  async function onSubmit(values: CandidateFormValues) {
    setSubmitting(true);
    setServerError(null);
    try {
      const payload = {
        ...values,
        study_year: isStudent ? values.study_year || null : null,
        professional_summary: values.professional_summary ?? "",
        cv_file_name: cvFile ? sanitizeFileName(cvFile.name) : null,
        source: initialSource,
      };

      // Secure server-side validation (defense in depth) + authoritative ref.
      const response = await submitApplication(payload);
      if (!response.ok || !response.result) {
        setServerError(response.error ?? "אירעה שגיאה בשליחה. נסו שוב.");
        return;
      }

      // In mock mode, persist to the in-memory store so it appears in the admin
      // area during the demo session, using the server-issued reference number.
      if (USE_MOCK_DATA) {
        await createCandidate(payload, response.result.reference_number);
      }

      setResult(response.result);
    } catch {
      setServerError("אירעה שגיאה בלתי צפויה. נסו שוב מאוחר יותר.");
    } finally {
      setSubmitting(false);
    }
  }

  if (result) {
    return <SuccessScreen result={result} />;
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 sm:py-12">
      <div className="mb-8">
        <h1 className="text-2xl font-black tracking-tight sm:text-3xl">
          שליחת <span className="text-gradient">קורות חיים</span>
        </h1>
        <p className="mt-2 text-sm text-[var(--rf-text-muted)]">
          מלאו את הפרטים והמועמדות תועבר לבדיקת התאמה אפשרית.
        </p>
      </div>

      <div className="mb-8">
        <StepIndicator steps={STEP_LABELS} current={step} />
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <Card variant="elevated">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.25 }}
              className="flex flex-col gap-5"
            >
              {/* Step 1 — personal */}
              {step === 0 && (
                <>
                  <Field label="שם מלא" htmlFor="full_name" required error={errors.full_name?.message}>
                    <TextInput id="full_name" placeholder="ישראל ישראלי" autoComplete="name" {...register("full_name")} />
                  </Field>
                  <Field label="טלפון" htmlFor="phone" required error={errors.phone?.message}>
                    <TextInput id="phone" inputMode="tel" placeholder="050-0000000" autoComplete="tel" {...register("phone")} />
                  </Field>
                  <Field label="אימייל" htmlFor="email" required error={errors.email?.message}>
                    <TextInput id="email" inputMode="email" dir="ltr" placeholder="name@example.com" autoComplete="email" {...register("email")} />
                  </Field>
                  <Field label="עיר / אזור מגורים" htmlFor="city" required error={errors.city?.message}>
                    <TextInput id="city" placeholder="תל אביב" autoComplete="address-level2" {...register("city")} />
                  </Field>
                </>
              )}

              {/* Step 2 — professional */}
              {step === 1 && (
                <>
                  <Field label="תחום מקצועי" htmlFor="professional_field" required error={errors.professional_field?.message}>
                    <SelectInput id="professional_field" defaultValue="" {...register("professional_field")}>
                      <option value="" disabled>בחר/י תחום</option>
                      {PROFESSIONAL_FIELDS.map((f) => (
                        <option key={f} value={f}>{f}</option>
                      ))}
                    </SelectInput>
                  </Field>
                  <Field label="תפקיד נוכחי" htmlFor="current_role" required error={errors.current_role?.message}>
                    <TextInput id="current_role" placeholder="לדוגמה: מפתח/ת Frontend" {...register("current_role")} />
                  </Field>
                  <div className="grid gap-5 sm:grid-cols-2">
                    <Field label="שנות ניסיון" htmlFor="years_of_experience" required error={errors.years_of_experience?.message}>
                      <TextInput id="years_of_experience" type="number" min={0} max={60} inputMode="numeric" {...register("years_of_experience", { valueAsNumber: true })} />
                    </Field>
                    <Field label="השכלה" htmlFor="education" required error={errors.education?.message}>
                      <SelectInput id="education" defaultValue="" {...register("education")}>
                        <option value="" disabled>בחר/י השכלה</option>
                        {EDUCATION_LEVELS.map((e) => (
                          <option key={e} value={e}>{e}</option>
                        ))}
                      </SelectInput>
                    </Field>
                  </div>
                  {isStudent && (
                    <Field label="שנת לימודים" htmlFor="study_year">
                      <SelectInput id="study_year" defaultValue="" {...register("study_year")}>
                        <option value="">בחר/י שנה</option>
                        {STUDY_YEARS.map((y) => (
                          <option key={y} value={y}>{y}</option>
                        ))}
                      </SelectInput>
                    </Field>
                  )}
                  <Field label="סוגי משרה מועדפים" required error={errors.preferred_job_types?.message as string | undefined}>
                    <Controller
                      control={control}
                      name="preferred_job_types"
                      render={({ field }) => (
                        <ChipMultiSelect
                          options={JOB_TYPE_LIST.map((j) => ({ value: j.value, label: j.label }))}
                          value={field.value ?? []}
                          onChange={field.onChange}
                        />
                      )}
                    />
                  </Field>
                  <Field label="אזורי עבודה מועדפים" required error={errors.preferred_locations?.message as string | undefined}>
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
                  <Field label="תקציר מקצועי (רשות)" htmlFor="professional_summary" hint="כמה מילים על הניסיון והשאיפות שלך" error={errors.professional_summary?.message}>
                    <TextArea id="professional_summary" rows={4} placeholder="ספרו בקצרה על עצמכם..." {...register("professional_summary")} />
                  </Field>
                </>
              )}

              {/* Step 3 — CV */}
              {step === 2 && (
                <div>
                  <Field label="קובץ קורות חיים" required>
                    <CvUpload file={cvFile} onChange={(f) => { setCvFile(f); setCvError(undefined); }} error={cvError} />
                  </Field>
                  <p className="mt-3 text-xs text-[var(--rf-text-muted)]">
                    הקובץ נשמר באחסון מאובטח ופרטי ומשמש לבדיקת התאמה בלבד.
                  </p>
                </div>
              )}

              {/* Step 4 — eligibility */}
              {step === 3 && (
                <>
                  <div className="rounded-xl border border-amber-400/20 bg-amber-500/5 p-4 text-sm leading-relaxed text-amber-200/90">
                    מועמדים שכבר קיימים במערכת הגיוס עשויים שלא להיות זכאים כהפניית עובד חדשה.
                    התשובות עוזרות לנו לבדוק זאת מראש.
                  </div>
                  {ELIGIBILITY_QUESTIONS.map((q) => (
                    <Field
                      key={q.key}
                      label={q.question}
                      required
                      error={errors[q.key]?.message as string | undefined}
                    >
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
                </>
              )}

              {/* Step 5 — consent */}
              {step === 4 && (
                <>
                  <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                    <p className="text-sm font-semibold text-[var(--rf-text)]">מדיניות פרטיות</p>
                    <p className="mt-1.5 text-sm leading-relaxed text-[var(--rf-text-muted)]">
                      {PRIVACY_NOTICE}
                    </p>
                  </div>
                  <Field label="" error={errors.consent?.message as string | undefined}>
                    <Controller
                      control={control}
                      name="consent"
                      render={({ field }) => (
                        <Checkbox
                          id="consent"
                          checked={Boolean(field.value)}
                          onChange={field.onChange}
                        >
                          אני מאשר/ת את שמירת הפרטים, בדיקת קורות החיים, העברת הפרטים
                          לצוותי הגיוס הרלוונטיים ויצירת קשר בוואטסאפ, טלפון או אימייל.
                        </Checkbox>
                      )}
                    />
                  </Field>
                  <p className="text-xs leading-relaxed text-[var(--rf-text-muted)]">
                    {DISCLAIMER_TEXT}
                  </p>
                  {serverError && (
                    <p className="rounded-lg border border-red-400/30 bg-red-500/10 px-3 py-2 text-sm text-red-300" role="alert">
                      {serverError}
                    </p>
                  )}
                </>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="mt-8 flex items-center justify-between gap-3">
            {step > 0 ? (
              <Button type="button" variant="ghost" onClick={back} disabled={submitting}>
                <ArrowRight size={18} />
                חזרה
              </Button>
            ) : (
              <span />
            )}

            {step < STEP_LABELS.length - 1 ? (
              <Button type="button" variant="gradient" onClick={next}>
                המשך
                <ArrowLeft size={18} />
              </Button>
            ) : (
              <Button type="submit" variant="gradient" disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    שולח...
                  </>
                ) : (
                  <>
                    <Send size={18} />
                    שליחת המועמדות
                  </>
                )}
              </Button>
            )}
          </div>
        </Card>
      </form>
    </div>
  );
}

"use client";

import { Briefcase } from "lucide-react";
import type { UseFormRegister, Control, FieldErrors } from "react-hook-form";
import { Controller } from "react-hook-form";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Field, TextInput, SelectInput, TextArea } from "@/components/ui/Field";
import { ChipMultiSelect } from "@/components/ui/Choice";
import {
  PROFESSIONAL_FIELDS,
  WORK_AREAS,
  EDUCATION_LEVELS,
  STUDY_YEARS,
  JOB_TYPE_LIST,
} from "@/config/jobTypes";
import type { Values } from "./types";

interface Props {
  register: UseFormRegister<Values>;
  control: Control<Values>;
  errors: FieldErrors<Values>;
  isStudent: boolean;
  mode: "create" | "edit";
}

export function ProfessionalDetailsSection({
  register,
  control,
  errors,
  isStudent,
  mode,
}: Props) {
  if (mode === "create") {
    // The admin only forwards the CV; recruitment teams decide which position
    // fits. So creation keeps just an optional general professional field —
    // available for internal search, filters, and dashboard stats.
    return (
      <Card>
        <CardHeader>
          <CardTitle>מידע מקצועי קצר</CardTitle>
          <Briefcase size={18} className="text-[var(--rf-text-muted)]" />
        </CardHeader>
        <div className="flex flex-col gap-4">
          <Field
            label="תחום מקצועי כללי"
            htmlFor="professional_field"
            hint="לשימוש פנימי בלבד — חיפוש, סינון וסטטיסטיקה. לא חובה."
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
        </div>
      </Card>
    );
  }

  const professionalField = (
    <Field
      label="תחום מקצועי"
      htmlFor="professional_field"
      required
      error={errors.professional_field?.message}
    >
      <SelectInput id="professional_field" {...register("professional_field")}>
        <option value="">בחרו תחום…</option>
        {PROFESSIONAL_FIELDS.map((f) => (
          <option key={f} value={f}>
            {f}
          </option>
        ))}
      </SelectInput>
    </Field>
  );

  const professionalSummary = (
    <Field label="תקציר מקצועי" htmlFor="professional_summary">
      <TextArea
        id="professional_summary"
        rows={3}
        placeholder="כמה מילים על הניסיון והשאיפות…"
        {...register("professional_summary")}
      />
    </Field>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>פרטים מקצועיים</CardTitle>
        <Briefcase size={18} className="text-[var(--rf-text-muted)]" />
      </CardHeader>
      <div className="flex flex-col gap-4">
        {professionalField}
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
                options={PROFESSIONAL_FIELDS.map((f) => ({ value: f, label: f }))}
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
        {professionalSummary}
      </div>
    </Card>
  );
}

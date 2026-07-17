"use client";

import { Radio } from "lucide-react";
import type {
  UseFormRegister,
  Control,
  FieldErrors,
  UseFormGetValues,
} from "react-hook-form";
import { Controller } from "react-hook-form";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Field, TextInput, SelectInput, TextArea } from "@/components/ui/Field";
import { RadioPills } from "@/components/ui/Choice";
import { SOURCE_LIST } from "@/config/sources";
import {
  ELIGIBILITY,
  getEligibilityMeta,
  ELIGIBILITY_QUESTIONS,
} from "@/config/eligibility";
import { deriveEligibility } from "@/lib/eligibility";
import { yesNoOptions, type Values } from "./types";

interface Props {
  register: UseFormRegister<Values>;
  control: Control<Values>;
  errors: FieldErrors<Values>;
  getValues: UseFormGetValues<Values>;
  onApplyDerivedEligibility: () => void;
}

export function ReferralDetailsSection({
  register,
  control,
  getValues,
  onApplyDerivedEligibility,
}: Props) {
  return (
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

        <div className="rf-badge badge-amber rounded-xl border p-3">
          <p className="mb-3 text-xs leading-relaxed">
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
          <SelectInput id="eligibility_status" {...register("eligibility_status")}>
            {Object.values(ELIGIBILITY).map((e) => (
              <option key={e.value} value={e.value}>
                {e.label}
              </option>
            ))}
          </SelectInput>
          <button
            type="button"
            onClick={onApplyDerivedEligibility}
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
  );
}

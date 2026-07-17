"use client";

import { Target } from "lucide-react";
import type { UseFormRegister } from "react-hook-form";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Field, TextInput, SelectInput } from "@/components/ui/Field";
import { STATUS_LIST } from "@/config/statuses";
import { BONUS_STATUS_LIST } from "@/config/bonus";
import type { Values } from "./types";

interface Props {
  register: UseFormRegister<Values>;
  status: string;
  bonusStatus: string;
}

export function TrackingSection({ register, status, bonusStatus }: Props) {
  return (
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
                setValueAs: (v) => (v === "" || v == null ? null : Number(v)),
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
  );
}

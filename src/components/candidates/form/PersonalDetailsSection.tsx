"use client";

import { User, Wand2, MessageCircle } from "lucide-react";
import type { UseFormRegister, FieldErrors } from "react-hook-form";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Field, TextInput } from "@/components/ui/Field";
import { CopyButton } from "@/components/ui/CopyButton";
import { whatsappLink } from "@/lib/utils";
import type { Values } from "./types";

interface Props {
  register: UseFormRegister<Values>;
  errors: FieldErrors<Values>;
  phoneVal: string;
  emailVal: string;
  onCheckDuplicates: () => void;
  onNormalizePhone: () => void;
}

export function PersonalDetailsSection({
  register,
  errors,
  phoneVal,
  emailVal,
  onCheckDuplicates,
  onNormalizePhone,
}: Props) {
  return (
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
        <Field label="טלפון" htmlFor="phone" required error={errors.phone?.message}>
          <TextInput
            id="phone"
            inputMode="tel"
            dir="ltr"
            placeholder="050-0000000"
            {...register("phone", { onBlur: onCheckDuplicates })}
          />
          <div className="mt-2 flex flex-wrap gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onNormalizePhone}
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
        <Field label="אימייל" htmlFor="email" required error={errors.email?.message}>
          <TextInput
            id="email"
            inputMode="email"
            dir="ltr"
            placeholder="name@example.com"
            {...register("email", { onBlur: onCheckDuplicates })}
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
  );
}

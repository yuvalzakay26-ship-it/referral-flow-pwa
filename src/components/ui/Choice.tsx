"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface Option<T extends string> {
  value: T;
  label: string;
}

/** Single-select pill group (e.g. yes / no / unsure). */
export function RadioPills<T extends string>({
  options,
  value,
  onChange,
  name,
}: {
  options: Option<T>[];
  value: T | null | undefined;
  onChange: (value: T) => void;
  name?: string;
}) {
  return (
    <div className="flex flex-wrap gap-2" role="radiogroup" aria-label={name}>
      {options.map((opt) => {
        const active = value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(opt.value)}
            className={cn(
              "min-w-20 rounded-xl border px-4 py-2.5 text-sm font-medium transition-all focus-ring",
              active
                ? "border-transparent bg-[var(--rf-purple)]/25 text-white shadow-[0_0_0_1px_var(--rf-purple)]"
                : "border-white/10 bg-white/5 text-[var(--rf-text-muted)] hover:bg-white/10 hover:text-[var(--rf-text)]",
            )}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

/** Multi-select chip group (e.g. job types, preferred locations). */
export function ChipMultiSelect<T extends string>({
  options,
  value,
  onChange,
}: {
  options: Option<T>[];
  value: T[];
  onChange: (value: T[]) => void;
}) {
  function toggle(v: T) {
    onChange(value.includes(v) ? value.filter((x) => x !== v) : [...value, v]);
  }
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => {
        const active = value.includes(opt.value);
        return (
          <button
            key={opt.value}
            type="button"
            aria-pressed={active}
            onClick={() => toggle(opt.value)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-sm font-medium transition-all focus-ring",
              active
                ? "border-transparent bg-[var(--rf-magenta)]/20 text-white shadow-[0_0_0_1px_color-mix(in_srgb,var(--rf-magenta)_60%,transparent)]"
                : "border-white/10 bg-white/5 text-[var(--rf-text-muted)] hover:bg-white/10 hover:text-[var(--rf-text)]",
            )}
          >
            {active && <Check size={13} />}
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

/** Styled checkbox with label content. */
export function Checkbox({
  checked,
  onChange,
  children,
  id,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  children: React.ReactNode;
  id?: string;
}) {
  return (
    <label
      htmlFor={id}
      className="flex cursor-pointer items-start gap-3 text-sm leading-relaxed text-[var(--rf-text-muted)]"
    >
      <span
        className={cn(
          "mt-0.5 flex h-5 w-5 flex-none items-center justify-center rounded-md border transition-all",
          checked
            ? "border-transparent bg-[var(--rf-magenta)]"
            : "border-white/20 bg-white/5",
        )}
      >
        {checked && <Check size={13} className="text-white" />}
      </span>
      <input
        id={id}
        type="checkbox"
        className="sr-only"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span>{children}</span>
    </label>
  );
}

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface StepIndicatorProps {
  steps: string[];
  current: number; // 0-based
}

export function StepIndicator({ steps, current }: StepIndicatorProps) {
  const pct = (current / (steps.length - 1)) * 100;
  return (
    <div className="w-full">
      {/* Mobile: compact progress bar */}
      <div className="sm:hidden">
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="font-semibold text-[var(--rf-text)]">
            {steps[current]}
          </span>
          <span className="text-[var(--rf-text-muted)]">
            שלב {current + 1} מתוך {steps.length}
          </span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${pct}%`, background: "var(--rf-gradient)" }}
          />
        </div>
      </div>

      {/* Desktop: full stepper */}
      <ol className="hidden items-center sm:flex">
        {steps.map((label, i) => {
          const done = i < current;
          const active = i === current;
          return (
            <li key={label} className="flex flex-1 items-center last:flex-none">
              <div className="flex flex-col items-center gap-1.5">
                <span
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-full border text-sm font-bold transition-all",
                    done && "border-transparent text-white",
                    active &&
                      "border-transparent text-white shadow-[0_0_0_4px_color-mix(in_srgb,var(--rf-purple)_25%,transparent)]",
                    !done && !active &&
                      "border-white/15 bg-white/5 text-[var(--rf-text-muted)]",
                  )}
                  style={
                    done || active ? { background: "var(--rf-gradient)" } : undefined
                  }
                >
                  {done ? <Check size={16} /> : i + 1}
                </span>
                <span
                  className={cn(
                    "whitespace-nowrap text-xs",
                    active
                      ? "font-semibold text-[var(--rf-text)]"
                      : "text-[var(--rf-text-muted)]",
                  )}
                >
                  {label}
                </span>
              </div>
              {i < steps.length - 1 && (
                <span
                  className={cn(
                    "mx-2 mb-5 h-0.5 flex-1 rounded-full transition-colors",
                    i < current ? "bg-[var(--rf-purple)]" : "bg-white/10",
                  )}
                />
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}

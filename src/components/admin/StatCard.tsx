import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/Skeleton";

interface StatCardProps {
  label: string;
  value: number | string;
  icon: LucideIcon;
  accent?: string; // css color var
  hint?: string;
  loading?: boolean;
}

export function StatCard({
  label,
  value,
  icon: Icon,
  accent = "var(--rf-purple)",
  hint,
  loading,
}: StatCardProps) {
  return (
    <div className="glass relative overflow-hidden rounded-2xl p-4 sm:p-5">
      <div
        className="pointer-events-none absolute -left-6 -top-6 h-20 w-20 rounded-full blur-2xl"
        style={{ background: `color-mix(in srgb, ${accent} 40%, transparent)` }}
      />
      <div className="relative flex items-start justify-between">
        <div className="min-w-0">
          <p className="text-xs font-medium text-[var(--rf-text-muted)]">
            {label}
          </p>
          {loading ? (
            <Skeleton className="mt-2 h-8 w-12" />
          ) : (
            <p className="mt-1 text-2xl font-black tracking-tight text-[var(--rf-text)] sm:text-3xl">
              {value}
            </p>
          )}
          {hint && (
            <p className="mt-1 text-xs text-[var(--rf-text-muted)]">{hint}</p>
          )}
        </div>
        <span
          className={cn(
            "flex h-10 w-10 flex-none items-center justify-center rounded-xl",
          )}
          style={{ background: `color-mix(in srgb, ${accent} 18%, transparent)` }}
        >
          <Icon size={20} style={{ color: accent }} />
        </span>
      </div>
    </div>
  );
}

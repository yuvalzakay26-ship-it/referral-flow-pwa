import type { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 bg-white/[0.02] px-6 py-14 text-center">
      <span
        className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl"
        style={{ background: "var(--rf-gradient-soft)" }}
      >
        <Icon size={26} className="text-[var(--rf-text-muted)]" />
      </span>
      <h3 className="text-lg font-bold text-[var(--rf-text)]">{title}</h3>
      {description && (
        <p className="mt-1.5 max-w-sm text-sm text-[var(--rf-text-muted)]">
          {description}
        </p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

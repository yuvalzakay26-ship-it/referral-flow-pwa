import { cn } from "@/lib/utils";
import { Icon } from "./Icon";
import { getStatusMeta } from "@/config/statuses";
import { getEligibilityMeta } from "@/config/eligibility";
import type { CandidateStatus, EligibilityStatus } from "@/types";

interface BadgeProps {
  label: string;
  icon?: string;
  className?: string;
  size?: "sm" | "md";
}

export function Badge({ label, icon, className, size = "md" }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border font-medium",
        size === "sm" ? "px-2 py-0.5 text-[11px]" : "px-2.5 py-1 text-xs",
        className,
      )}
    >
      {icon && <Icon name={icon} size={size === "sm" ? 12 : 14} />}
      {label}
    </span>
  );
}

export function StatusBadge({
  status,
  size = "md",
}: {
  status: CandidateStatus;
  size?: "sm" | "md";
}) {
  const meta = getStatusMeta(status);
  return (
    <Badge
      label={meta.label}
      icon={meta.icon}
      className={meta.badgeClass}
      size={size}
    />
  );
}

export function EligibilityBadge({
  status,
  size = "md",
}: {
  status: EligibilityStatus;
  size?: "sm" | "md";
}) {
  const meta = getEligibilityMeta(status);
  return (
    <Badge
      label={meta.label}
      icon={meta.icon}
      className={meta.badgeClass}
      size={size}
    />
  );
}

import type { BonusStatus } from "@/types";

export interface BonusMeta {
  value: BonusStatus;
  label: string;
  badgeClass: string;
}

/** Referral-bonus lifecycle, modeled separately from candidate status. */
export const BONUS_STATUSES: Record<BonusStatus, BonusMeta> = {
  none: {
    value: "none",
    label: "אין",
    badgeClass: "bg-zinc-500/15 text-zinc-400 border-zinc-400/30",
  },
  not_eligible: {
    value: "not_eligible",
    label: "לא זכאי",
    badgeClass: "bg-slate-500/15 text-slate-300 border-slate-400/30",
  },
  pending: {
    value: "pending",
    label: "בהמתנה",
    badgeClass: "bg-orange-500/15 text-orange-300 border-orange-400/30",
  },
  received: {
    value: "received",
    label: "התקבל",
    badgeClass: "bg-green-500/15 text-green-300 border-green-400/30",
  },
};

export const BONUS_STATUS_LIST: BonusMeta[] = Object.values(BONUS_STATUSES);

export function getBonusMeta(value: BonusStatus): BonusMeta {
  return BONUS_STATUSES[value] ?? BONUS_STATUSES.none;
}

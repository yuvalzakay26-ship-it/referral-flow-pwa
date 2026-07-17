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
    badgeClass: "rf-badge badge-zinc",
  },
  not_eligible: {
    value: "not_eligible",
    label: "לא זכאי",
    badgeClass: "rf-badge badge-slate",
  },
  pending: {
    value: "pending",
    label: "בהמתנה",
    badgeClass: "rf-badge badge-orange",
  },
  received: {
    value: "received",
    label: "התקבל",
    badgeClass: "rf-badge badge-green",
  },
};

export const BONUS_STATUS_LIST: BonusMeta[] = Object.values(BONUS_STATUSES);

export function getBonusMeta(value: BonusStatus): BonusMeta {
  return BONUS_STATUSES[value] ?? BONUS_STATUSES.none;
}

import type { Candidate, CandidateStatus } from "@/types";
import { store, delay } from "./store";

export interface DashboardStats {
  total: number;
  new: number;
  transferred: number;
  inProcess: number;
  hired: number;
  bonusPending: number;
  bonusReceived: number;
  possibleDuplicate: number;
  byStatus: { status: CandidateStatus; count: number }[];
  bySource: { source: string; count: number }[];
  byField: { field: string; count: number }[];
  recentFollowUps: Candidate[];
}

const IN_PROCESS: CandidateStatus[] = [
  "pending_review",
  "missing_details",
  "transferred",
  "in_recruitment",
];

export async function getDashboardStats(): Promise<DashboardStats> {
  const c = store.candidates;
  const count = (fn: (x: Candidate) => boolean) => c.filter(fn).length;

  const byStatus = Object.entries(
    c.reduce<Record<string, number>>((acc, x) => {
      acc[x.status] = (acc[x.status] ?? 0) + 1;
      return acc;
    }, {}),
  ).map(([status, cnt]) => ({ status: status as CandidateStatus, count: cnt }));

  const bySource = Object.entries(
    c.reduce<Record<string, number>>((acc, x) => {
      acc[x.source] = (acc[x.source] ?? 0) + 1;
      return acc;
    }, {}),
  ).map(([source, cnt]) => ({ source, count: cnt }));

  const byField = Object.entries(
    c.reduce<Record<string, number>>((acc, x) => {
      acc[x.professional_field] = (acc[x.professional_field] ?? 0) + 1;
      return acc;
    }, {}),
  )
    .map(([field, cnt]) => ({ field, count: cnt }))
    .sort((a, b) => b.count - a.count);

  const recentFollowUps = c
    .filter((x) => x.follow_up_date)
    .sort((a, b) => (a.follow_up_date! < b.follow_up_date! ? -1 : 1))
    .slice(0, 5);

  return delay({
    total: c.length,
    new: count((x) => x.status === "new"),
    transferred: count((x) => x.status === "transferred"),
    inProcess: count((x) => IN_PROCESS.includes(x.status)),
    hired: count(
      (x) =>
        x.status === "accepted" ||
        x.status === "bonus_pending" ||
        x.status === "bonus_received",
    ),
    bonusPending: count((x) => x.bonus_status === "pending"),
    bonusReceived: count((x) => x.bonus_status === "received"),
    possibleDuplicate: count(
      (x) =>
        x.status === "possible_duplicate" ||
        x.eligibility_status === "likely_existing",
    ),
    byStatus,
    bySource,
    byField,
    recentFollowUps,
  });
}

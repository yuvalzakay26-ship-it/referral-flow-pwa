import type { Candidate, CandidateStatus } from "@/types";
import { store, delay } from "./store";

export interface DashboardStats {
  total: number;
  new: number;
  pendingReview: number;
  missingDetails: number;
  transferred: number;
  inRecruitment: number;
  inProcess: number;
  accepted: number;
  hired: number;
  /** Follow-ups due today or overdue. */
  followUpDue: number;
  bonusPending: number;
  bonusReceived: number;
  /** Sum of bonus amounts still pending. */
  bonusPendingAmount: number;
  /** Sum of bonus amounts already received. */
  bonusReceivedAmount: number;
  possibleDuplicate: number;
  byStatus: { status: CandidateStatus; count: number }[];
  bySource: { source: string; count: number }[];
  byField: { field: string; count: number }[];
  /** Up to five upcoming/overdue follow-ups, soonest first. */
  recentFollowUps: Candidate[];
  /** Most recently added candidates, newest first. */
  recentCandidates: Candidate[];
}

const IN_PROCESS: CandidateStatus[] = [
  "pending_review",
  "missing_details",
  "transferred",
  "in_recruitment",
];

/** Statuses that represent a candidate who reached acceptance. */
export const ACCEPTED_STATUSES: CandidateStatus[] = [
  "accepted",
  "bonus_pending",
  "bonus_received",
];

export async function getDashboardStats(): Promise<DashboardStats> {
  const c = store.candidates;
  const count = (fn: (x: Candidate) => boolean) => c.filter(fn).length;
  const today = new Date().toISOString().slice(0, 10);

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

  const recentCandidates = [...c]
    .sort((a, b) => (a.created_at < b.created_at ? 1 : -1))
    .slice(0, 5);

  const bonusPendingAmount = c
    .filter((x) => x.bonus_status === "pending")
    .reduce((s, x) => s + (x.bonus_amount ?? 0), 0);
  const bonusReceivedAmount = c
    .filter((x) => x.bonus_status === "received")
    .reduce((s, x) => s + (x.bonus_amount ?? 0), 0);

  return delay({
    total: c.length,
    new: count((x) => x.status === "new"),
    pendingReview: count((x) => x.status === "pending_review"),
    missingDetails: count((x) => x.status === "missing_details"),
    transferred: count((x) => x.status === "transferred"),
    inRecruitment: count((x) => x.status === "in_recruitment"),
    inProcess: count((x) => IN_PROCESS.includes(x.status)),
    accepted: count((x) => x.status === "accepted"),
    hired: count((x) => ACCEPTED_STATUSES.includes(x.status)),
    followUpDue: count((x) => Boolean(x.follow_up_date) && x.follow_up_date! <= today),
    bonusPending: count((x) => x.bonus_status === "pending"),
    bonusReceived: count((x) => x.bonus_status === "received"),
    bonusPendingAmount,
    bonusReceivedAmount,
    possibleDuplicate: count(
      (x) =>
        x.status === "possible_duplicate" ||
        x.eligibility_status === "likely_existing",
    ),
    byStatus,
    bySource,
    byField,
    recentFollowUps,
    recentCandidates,
  });
}

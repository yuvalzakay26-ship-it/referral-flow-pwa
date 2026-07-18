import type { Candidate, CandidateStatus } from "@/types";

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

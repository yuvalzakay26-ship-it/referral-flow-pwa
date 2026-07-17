import type {
  Candidate,
  CandidateNote,
  CandidateStatusHistory,
} from "@/types";

/**
 * The candidate database starts empty.
 *
 * ReferralFlow ships with no preloaded candidates: every record is created by
 * the administrator through /admin/candidates/new. These arrays are the seed for
 * the in-memory mock store (see src/services/store.ts) and must stay empty —
 * adding sample people here would put fabricated candidate data back on every
 * device that loads the app.
 */
export const MOCK_CANDIDATES: Candidate[] = [];

/** Status history is written as the administrator changes a candidate's status. */
export const MOCK_STATUS_HISTORY: CandidateStatusHistory[] = [];

/** Notes are written by the administrator from the candidate detail screen. */
export const MOCK_NOTES: CandidateNote[] = [];

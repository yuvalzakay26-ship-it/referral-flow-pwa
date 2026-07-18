import test from "node:test";
import assert from "node:assert/strict";
import { computeDashboardStats } from "./statsCompute.ts";
import type { Candidate, CandidateStatus } from "../types/index.ts";

let seq = 0;
function mk(partial: Partial<Candidate>): Candidate {
  seq += 1;
  return {
    id: `c${seq}`,
    reference_number: `REF-${seq}`,
    full_name: `Cand ${seq}`,
    phone: "0500000000",
    email: `c${seq}@example.com`,
    city: "תל אביב",
    professional_field: "software",
    current_role: "dev",
    years_of_experience: 3,
    education: "BSc",
    study_year: null,
    preferred_job_types: [],
    preferred_locations: [],
    professional_summary: "",
    cv_file_name: null,
    cv_storage_path: null,
    applied_last_12_months: "no",
    referred_by_another_employee: "no",
    contacted_recruiter_before: "no",
    eligibility_status: "eligible",
    source: "linkedin",
    status: "new" as CandidateStatus,
    internal_notes: "",
    referral_date: null,
    referred_position: null,
    follow_up_date: null,
    bonus_status: "none",
    bonus_amount: null,
    created_at: "2026-07-01T00:00:00.000Z",
    updated_at: "2026-07-01T00:00:00.000Z",
    ...partial,
  };
}

test("counts totals and status buckets", () => {
  const stats = computeDashboardStats([
    mk({ status: "new" }),
    mk({ status: "pending_review" }),
    mk({ status: "accepted" }),
    mk({ status: "bonus_pending", bonus_status: "pending", bonus_amount: 4000 }),
    mk({ status: "bonus_received", bonus_status: "received", bonus_amount: 5000 }),
  ]);

  assert.equal(stats.total, 5);
  assert.equal(stats.new, 1);
  assert.equal(stats.pendingReview, 1);
  // accepted + bonus_pending + bonus_received all count as "hired".
  assert.equal(stats.hired, 3);
  assert.equal(stats.bonusPending, 1);
  assert.equal(stats.bonusReceived, 1);
  assert.equal(stats.bonusPendingAmount, 4000);
  assert.equal(stats.bonusReceivedAmount, 5000);
});

test("counts overdue/due follow-ups and possible duplicates", () => {
  const stats = computeDashboardStats([
    mk({ follow_up_date: "2020-01-01" }), // overdue → due
    mk({ follow_up_date: "2999-01-01" }), // future → not due
    mk({ status: "possible_duplicate" }),
    mk({ eligibility_status: "likely_existing" }),
  ]);

  assert.equal(stats.followUpDue, 1);
  assert.equal(stats.possibleDuplicate, 2);
  assert.equal(stats.recentFollowUps.length, 2);
});

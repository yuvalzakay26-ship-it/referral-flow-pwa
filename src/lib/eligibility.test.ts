/**
 * Focused tests for the Zod-free eligibility rule.
 *
 * Runnable with Node's built-in test runner and native TypeScript execution:
 *   node --test src/lib/eligibility.test.ts
 * No test framework or transpiler is required — the module's only import is a
 * type-only import, which Node erases at load time.
 */

import test from "node:test";
import assert from "node:assert/strict";
import { deriveEligibility } from "./eligibility.ts";

const ELIGIBLE = {
  applied_last_12_months: "no",
  referred_by_another_employee: "no",
  contacted_recruiter_before: "no",
} as const;

test("all 'no' answers → eligible", () => {
  assert.equal(deriveEligibility(ELIGIBLE), "eligible");
});

test("any 'yes' answer → likely_existing", () => {
  assert.equal(
    deriveEligibility({ ...ELIGIBLE, applied_last_12_months: "yes" }),
    "likely_existing",
  );
  assert.equal(
    deriveEligibility({ ...ELIGIBLE, referred_by_another_employee: "yes" }),
    "likely_existing",
  );
  assert.equal(
    deriveEligibility({ ...ELIGIBLE, contacted_recruiter_before: "yes" }),
    "likely_existing",
  );
});

test("an 'unsure' answer (no 'yes') → review", () => {
  assert.equal(
    deriveEligibility({ ...ELIGIBLE, contacted_recruiter_before: "unsure" }),
    "review",
  );
});

test("'yes' takes precedence over 'unsure'", () => {
  assert.equal(
    deriveEligibility({
      applied_last_12_months: "unsure",
      referred_by_another_employee: "yes",
      contacted_recruiter_before: "unsure",
    }),
    "likely_existing",
  );
});

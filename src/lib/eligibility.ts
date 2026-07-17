/**
 * Zod-free eligibility rules.
 *
 * This is a pure function with no schema dependency. It deliberately lives apart
 * from `@/lib/validation` (which imports Zod) so that data-access code and
 * list/dashboard components can use it without pulling the ~66 KB gzip Zod
 * bundle into routes that never validate a form. Its only import is a type-only
 * import (fully erased at build/run time), which keeps the module trivially
 * testable under Node's native TypeScript execution.
 */

import type { EligibilityStatus, YesNoUnsure } from "@/types";

/**
 * Derive eligibility standing from the three referral questions.
 * If the candidate already applied or was already referred / contacted a
 * recruiter, they are likely already in the system and may not qualify as a
 * new referral.
 */
export function deriveEligibility(answers: {
  applied_last_12_months: YesNoUnsure;
  referred_by_another_employee: YesNoUnsure;
  contacted_recruiter_before: YesNoUnsure;
}): EligibilityStatus {
  const values = [
    answers.applied_last_12_months,
    answers.referred_by_another_employee,
    answers.contacted_recruiter_before,
  ];
  if (values.includes("yes")) return "likely_existing";
  if (values.includes("unsure")) return "review";
  return "eligible";
}

"use server";

import { submissionSchema } from "@/lib/validation";
import { generateReferenceNumber } from "@/lib/utils";
import { USE_MOCK_DATA } from "@/config/app";
import type { SubmissionResult } from "@/types";

export interface SubmitResponse {
  ok: boolean;
  result?: SubmissionResult;
  error?: string;
  fieldErrors?: Record<string, string>;
}

/**
 * Secure server action for public candidate submission.
 *
 * Server-side validation runs here (defense in depth) before anything is
 * persisted. In mock mode we return an authoritative reference number without
 * touching a database. In production this is where the Supabase insert + CV
 * storage upload happen via the service-role client behind RLS.
 *
 * No sensitive candidate data is logged.
 */
export async function submitApplication(
  raw: unknown,
): Promise<SubmitResponse> {
  const parsed = submissionSchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path.join(".");
      if (key && !fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return { ok: false, error: "אירעה שגיאה באימות הנתונים.", fieldErrors };
  }

  const reference = generateReferenceNumber();
  const result: SubmissionResult = {
    reference_number: reference,
    full_name: parsed.data.full_name,
    created_at: new Date().toISOString(),
  };

  if (!USE_MOCK_DATA) {
    // TODO: Supabase — insert candidate row + upload CV to the private bucket
    // using the service-role client. Never expose the CV URL publicly.
  }

  return { ok: true, result };
}

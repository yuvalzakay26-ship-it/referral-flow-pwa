/**
 * Row Level Security negative tests against the live Supabase project.
 *
 * Verifies that an ANONYMOUS client (no session) cannot read or write
 * candidate data. Runs only when Supabase env vars are present; otherwise it
 * skips, so it never fails a mock/CI run without credentials.
 *
 *   NEXT_PUBLIC_SUPABASE_URL=... \
 *   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=... \
 *   node --test src/services/rls.test.ts
 */

import test from "node:test";
import assert from "node:assert/strict";
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const configured = Boolean(url && key);

test(
  "anonymous cannot read candidates (RLS returns no rows)",
  { skip: !configured },
  async () => {
    const supabase = createClient(url!, key!);
    const { data, error } = await supabase.from("candidates").select("*");
    // Under RLS with no anon policy, the result is an empty set (never data).
    assert.equal(error, null);
    assert.deepEqual(data, []);
  },
);

test(
  "anonymous cannot insert a candidate (RLS blocks)",
  { skip: !configured },
  async () => {
    const supabase = createClient(url!, key!);
    const { error } = await supabase.from("candidates").insert({
      reference_number: "RLS-TEST",
      full_name: "should not insert",
      phone: "0500000000",
      email: "nope@example.com",
      city: "x",
      professional_field: "x",
      applied_last_12_months: "no",
      referred_by_another_employee: "no",
      contacted_recruiter_before: "no",
    });
    assert.notEqual(error, null);
  },
);

test(
  "anonymous is_admin() is not true",
  { skip: !configured },
  async () => {
    const supabase = createClient(url!, key!);
    const { data } = await supabase.rpc("is_admin");
    assert.notEqual(data, true);
  },
);

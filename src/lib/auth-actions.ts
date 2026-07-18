"use server";

/**
 * Owner authentication server actions (Supabase Auth).
 *
 * Replaces the previous mock localStorage gate. Sign-in verifies BOTH valid
 * credentials AND that the user is the authorized owner (public.admin_users via
 * is_admin()); a non-owner is signed out immediately and denied. No signup path.
 *
 * Errors are returned as generic Hebrew strings — credentials, tokens and
 * personal data are never logged or leaked to the client.
 */

import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export interface SignInResult {
  ok: boolean;
  /** Generic, user-safe Hebrew error message when ok is false. */
  error?: string;
}

const INVALID_CREDENTIALS = "פרטי התחברות שגויים.";
const NOT_AUTHORIZED = "החשבון אינו מורשה לגשת למערכת.";
const CONFIG_ERROR = "המערכת אינה מוגדרת כראוי. פנו למנהל המערכת.";
const GENERIC_ERROR = "אירעה שגיאה. נסו שוב.";

export async function signInOwner(
  email: string,
  password: string,
): Promise<SignInResult> {
  if (!isSupabaseConfigured) {
    return { ok: false, error: CONFIG_ERROR };
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email: email.trim(),
    password,
  });

  if (error) {
    // Do not distinguish "no such user" from "wrong password".
    return { ok: false, error: INVALID_CREDENTIALS };
  }

  // Authenticated — now confirm this account is the authorized owner.
  const { data: isAdmin, error: rpcError } = await supabase.rpc("is_admin");
  if (rpcError) {
    await supabase.auth.signOut();
    return { ok: false, error: GENERIC_ERROR };
  }
  if (!isAdmin) {
    await supabase.auth.signOut();
    return { ok: false, error: NOT_AUTHORIZED };
  }

  return { ok: true };
}

export async function signOutOwner(): Promise<void> {
  if (!isSupabaseConfigured) return;
  const supabase = await createClient();
  await supabase.auth.signOut();
}

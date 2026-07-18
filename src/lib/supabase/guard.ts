import "server-only";

/**
 * Server-side auth guard for data-layer server actions.
 *
 * Returns a cookie-bound Supabase client plus the authenticated owner id. The
 * user is derived from the session cookie — never trusted from the client.
 * Row Level Security is the authoritative owner check on every query; this
 * guard additionally fails fast when there is no session at all.
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "./server";
import { assertSupabaseConfigured } from "./env";

export interface OwnerContext {
  supabase: SupabaseClient;
  userId: string;
}

/** Thrown for any unauthenticated data operation. Message is user-safe/generic. */
export class NotAuthenticatedError extends Error {
  constructor() {
    super("לא מחוברים. התחברו מחדש.");
    this.name = "NotAuthenticatedError";
  }
}

export async function requireOwner(): Promise<OwnerContext> {
  assertSupabaseConfigured();
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new NotAuthenticatedError();
  return { supabase, userId: user.id };
}

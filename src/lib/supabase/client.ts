"use client";

/**
 * Browser Supabase client (used by client components for auth state / logout).
 * Reads only the public URL + publishable/anon key — never a service-role key.
 */

import { createBrowserClient } from "@supabase/ssr";
import { SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY } from "./env";

export function createClient() {
  return createBrowserClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
}

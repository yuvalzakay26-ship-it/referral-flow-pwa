/**
 * Supabase environment resolution.
 *
 * Supports the modern publishable-key naming as well as the legacy anon key,
 * so the app works whether the connected project issues
 * `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (preferred) or the older
 * `NEXT_PUBLIC_SUPABASE_ANON_KEY`. Both are safe to expose to the browser.
 *
 * No secrets are read here — the service-role key is intentionally NOT resolved
 * in this shared module so it can never leak into a client bundle.
 */

export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";

/** The browser-safe key (publishable preferred, anon fallback). */
export const SUPABASE_PUBLISHABLE_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
  "";

/** True when the public Supabase config needed to talk to the API is present. */
export const isSupabaseConfigured =
  Boolean(SUPABASE_URL) && Boolean(SUPABASE_PUBLISHABLE_KEY);

/**
 * Throw a clear, non-secret error when Supabase is required but not configured.
 * Used to fail closed in production instead of silently reverting to mock data.
 */
export function assertSupabaseConfigured(): void {
  if (!isSupabaseConfigured) {
    throw new Error(
      "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and " +
        "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY (or NEXT_PUBLIC_SUPABASE_ANON_KEY).",
    );
  }
}

/**
 * Supabase client factory. Returns null when Supabase is not configured, so
 * the rest of the app can transparently fall back to mock mode.
 *
 * NOTE: The @supabase/supabase-js dependency is intentionally NOT imported here
 * to keep the mock-only build free of the dependency. When you connect Supabase:
 *   1. npm install @supabase/supabase-js @supabase/ssr
 *   2. Implement createBrowserClient / createServerClient below.
 *   3. Set NEXT_PUBLIC_USE_MOCK_DATA=false and provide the Supabase env vars.
 */

export const isSupabaseConfigured =
  Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL) &&
  Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

/**
 * Placeholder for the browser Supabase client. Kept as a typed stub so callers
 * can be written against it today and wired up later without UI changes.
 */
export function getSupabaseBrowserClient(): null {
  // return createBrowserClient(
  //   process.env.NEXT_PUBLIC_SUPABASE_URL!,
  //   process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  // );
  return null;
}

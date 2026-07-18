import "server-only";

/**
 * Server Supabase client (Server Components, Server Actions, Route Handlers).
 * Binds to the request cookie store so the auth session is read and refreshed
 * through secure httpOnly cookies via @supabase/ssr.
 *
 * Uses the browser-safe publishable/anon key. Row Level Security is what
 * enforces access — the authenticated owner's session is derived from cookies,
 * never trusted from the client.
 */

import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY } from "./env";

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        } catch {
          // `setAll` was called from a Server Component. This can be ignored
          // when the Proxy refreshes the session on every request.
        }
      },
    },
  });
}

/**
 * Proxy (Next.js 16) session helper for Supabase SSR.
 *
 * Runs on every matched request to:
 *   - refresh the Supabase auth session and rewrite its cookies
 *   - redirect unauthenticated visitors to /admin/login
 *   - redirect authenticated visitors away from /admin/login to /admin
 *
 * This is an OPTIMISTIC gate only. Owner authorization (admin_users) and all
 * data access are enforced server-side by RLS and the panel layout — the Proxy
 * never becomes the sole source of truth. No candidate/personal data is read
 * or logged here.
 */

import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, isSupabaseConfigured } from "./env";

const LOGIN_PATH = "/admin/login";

/** Public paths that never require a session. */
function isPublicPath(pathname: string): boolean {
  return (
    pathname === LOGIN_PATH ||
    pathname === "/offline" ||
    pathname === "/manifest.webmanifest" ||
    pathname === "/sw.js"
  );
}

export async function updateSession(
  request: NextRequest,
): Promise<NextResponse> {
  let response = NextResponse.next({ request });

  // When Supabase is not configured we cannot resolve a session; let the
  // request through so the app can render its configuration error instead of
  // trapping the user in a redirect loop.
  if (!isSupabaseConfigured) {
    return response;
  }

  const supabase = createServerClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value),
        );
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
      },
    },
  });

  // IMPORTANT: refreshes the session. Do not run code between createServerClient
  // and getUser() — it can log users out at random.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Owner enforcement: a valid session that is NOT the authorized owner is
  // signed out immediately and treated as unauthenticated. This also prevents a
  // redirect loop (a non-owner would otherwise be bounced login ↔ /admin).
  let isOwner = Boolean(user);
  if (user) {
    const { data, error } = await supabase.rpc("is_admin");
    if (error || data !== true) {
      await supabase.auth.signOut();
      isOwner = false;
    }
  }

  const { pathname } = request.nextUrl;

  // Build a redirect that preserves any auth cookies written above (refresh or
  // sign-out), so the session state actually reaches the browser.
  const redirectTo = (pathname: string, next?: string): NextResponse => {
    const url = request.nextUrl.clone();
    url.pathname = pathname;
    url.search = "";
    if (next && next !== "/") url.searchParams.set("next", next);
    const redirect = NextResponse.redirect(url);
    response.cookies.getAll().forEach((cookie) => redirect.cookies.set(cookie));
    return redirect;
  };

  // Authenticated owner visiting the login page → send to the panel.
  if (isOwner && pathname === LOGIN_PATH) {
    return redirectTo("/admin");
  }

  // Not an authenticated owner on a protected path → send to login, preserving
  // the intended destination so we can return there after a successful sign-in.
  if (!isOwner && !isPublicPath(pathname)) {
    return redirectTo(LOGIN_PATH, pathname);
  }

  return response;
}

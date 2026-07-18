/**
 * Root Proxy (Next.js 16 — formerly middleware.ts).
 * Delegates to the Supabase session helper to refresh auth cookies and gate
 * routes. Runs on the Node.js runtime by default.
 */

import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";

export async function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, icons, manifest, service worker, robots
     * - files with an extension (images, fonts, etc.)
     * API routes ARE matched so signed-CV and data routes stay protected.
     */
    "/((?!_next/static|_next/image|favicon.ico|icons/|manifest.webmanifest|sw.js|robots.txt|.*\\.[^/]+$).*)",
  ],
};

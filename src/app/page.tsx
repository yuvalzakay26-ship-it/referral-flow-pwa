import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";

/**
 * Root route. ReferralFlow is owner-only — there is no public landing page.
 * The decision is made server-side from the Supabase session: the authorized
 * owner goes to the dashboard, everyone else to the login screen (the only
 * publicly visible interface). The Proxy also guards these routes.
 */
export default async function RootRedirect() {
  if (!isSupabaseConfigured) {
    redirect("/admin/login");
  }
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  redirect(user ? "/admin" : "/admin/login");
}

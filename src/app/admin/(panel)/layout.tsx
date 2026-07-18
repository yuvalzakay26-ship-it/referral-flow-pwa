import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin/AdminShell";
import { AnimatedBackground } from "@/components/ui/AnimatedBackground";
import { ConfigError } from "@/components/admin/ConfigError";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

/**
 * Server-side gate for the whole admin panel. Fails closed: when Supabase is
 * required but unconfigured it shows a clear configuration error instead of
 * silently exposing the panel; otherwise it requires an authenticated owner
 * before any protected content is rendered (defense in depth alongside the
 * Proxy and RLS).
 */
export default async function PanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Mock mode is dev-only local data; auth is still Supabase. When Supabase is
  // not configured at all, fail closed with a configuration error.
  if (!isSupabaseConfigured) {
    return <ConfigError />;
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  const { data: isAdmin } = await supabase.rpc("is_admin");
  if (isAdmin !== true) {
    // Authenticated but not the authorized owner — the Proxy signs them out;
    // here we simply refuse to render the panel.
    redirect("/admin/login?denied=1");
  }

  return (
    <>
      <AnimatedBackground />
      <AdminShell>{children}</AdminShell>
    </>
  );
}

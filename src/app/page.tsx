"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { LogoMark } from "@/components/ui/Logo";
import { AnimatedBackground } from "@/components/ui/AnimatedBackground";
import { isAuthed } from "@/lib/auth";

/**
 * Root route. ReferralFlow is admin-only — there is no public landing page.
 * Authenticated admins are sent to the dashboard; everyone else to the login
 * screen (the only publicly visible interface).
 *
 * Auth state lives in localStorage (mock mode), so the decision is made on the
 * client. When real Supabase Auth + middleware are wired up, this redirect can
 * move server-side.
 */
export default function RootRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace(isAuthed() ? "/admin" : "/admin/login");
  }, [router]);

  return (
    <div className="flex min-h-dvh items-center justify-center">
      <AnimatedBackground />
      <LogoMark size={56} className="animate-pulse-glow" />
    </div>
  );
}

import { AlertTriangle } from "lucide-react";
import { USE_MOCK_DATA, MOCK_MODE_WARNING } from "@/config/app";

/**
 * Prominent warning shown across the admin area while the app runs on mock
 * (in-memory) data. It disappears automatically once real data is configured
 * (NEXT_PUBLIC_USE_MOCK_DATA=false together with valid Supabase env vars),
 * i.e. when {@link USE_MOCK_DATA} becomes false.
 *
 * The current mock authentication is NOT production-secure — see
 * src/lib/auth.ts and the security notes in /admin/settings.
 */
export function MockModeBanner() {
  if (!USE_MOCK_DATA) return null;

  return (
    <div
      role="status"
      className="rf-badge badge-amber mb-5 flex items-start gap-3 rounded-2xl border px-4 py-3"
    >
      <AlertTriangle size={18} className="mt-0.5 flex-none" aria-hidden />
      <p className="text-sm font-medium leading-relaxed">{MOCK_MODE_WARNING}</p>
    </div>
  );
}

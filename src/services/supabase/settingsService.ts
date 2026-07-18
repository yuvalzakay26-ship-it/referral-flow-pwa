import "server-only";

import type { AppSettings } from "@/types";
import { requireOwner } from "@/lib/supabase/guard";
import { DEFAULT_SETTINGS } from "@/config/settings";

const SETTINGS_ID = 1;
const SETTINGS_COLUMNS =
  "app_name, admin_display_name, default_whatsapp_number, whatsapp_channel_url, default_job_post_ending, disclaimer_text, default_follow_up_days, default_bonus_amount";

/** Keep only the AppSettings-shaped keys from an object. */
function pickSettings(row: Record<string, unknown>): AppSettings {
  const merged = { ...DEFAULT_SETTINGS };
  for (const key of Object.keys(DEFAULT_SETTINGS) as (keyof AppSettings)[]) {
    if (row[key] !== undefined && row[key] !== null) {
      // @ts-expect-error narrow assignment across the union of setting value types
      merged[key] = row[key];
    }
  }
  // default_bonus_amount is nullable and must be allowed to be null.
  if (row.default_bonus_amount === null) merged.default_bonus_amount = null;
  return merged;
}

/** Ensure the single settings row exists, seeded from defaults (idempotent). */
async function ensureRow(
  supabase: Awaited<ReturnType<typeof requireOwner>>["supabase"],
): Promise<void> {
  await supabase
    .from("app_settings")
    .upsert(
      { id: SETTINGS_ID, ...DEFAULT_SETTINGS },
      { onConflict: "id", ignoreDuplicates: true },
    );
}

export async function getSettings(): Promise<AppSettings> {
  const { supabase } = await requireOwner();
  await ensureRow(supabase);
  const { data, error } = await supabase
    .from("app_settings")
    .select(SETTINGS_COLUMNS)
    .eq("id", SETTINGS_ID)
    .maybeSingle();
  if (error) throw new Error("שגיאה בטעינת ההגדרות.");
  return pickSettings((data ?? {}) as Record<string, unknown>);
}

export async function updateSettings(
  patch: Partial<AppSettings>,
): Promise<AppSettings> {
  const { supabase } = await requireOwner();
  await ensureRow(supabase);
  // Only persist known AppSettings keys.
  const safe: Record<string, unknown> = {};
  for (const key of Object.keys(DEFAULT_SETTINGS) as (keyof AppSettings)[]) {
    if (key in patch) safe[key] = patch[key];
  }
  const { data, error } = await supabase
    .from("app_settings")
    .update(safe)
    .eq("id", SETTINGS_ID)
    .select(SETTINGS_COLUMNS)
    .single();
  if (error) throw new Error("שגיאה בשמירת ההגדרות.");
  return pickSettings(data as Record<string, unknown>);
}

export async function resetSettings(): Promise<AppSettings> {
  const { supabase } = await requireOwner();
  const { data, error } = await supabase
    .from("app_settings")
    .upsert({ id: SETTINGS_ID, ...DEFAULT_SETTINGS }, { onConflict: "id" })
    .select(SETTINGS_COLUMNS)
    .single();
  if (error) throw new Error("שגיאה באיפוס ההגדרות.");
  return pickSettings(data as Record<string, unknown>);
}

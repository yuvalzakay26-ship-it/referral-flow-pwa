"use server";

/**
 * App settings — server actions. Dispatches to Supabase (single owner row) or
 * the mock store. The client-side live snapshot, localStorage cache and the
 * one-time browser→server migration live in src/lib/settingsStore.ts.
 */

import type { AppSettings } from "@/types";
import { USE_MOCK_DATA } from "@/config/app";
import * as mock from "./mock/settingsService";
import * as supa from "./supabase/settingsService";

const impl = USE_MOCK_DATA ? mock : supa;

export async function getSettings(): Promise<AppSettings> {
  return impl.getSettings();
}

export async function updateSettings(
  patch: Partial<AppSettings>,
): Promise<AppSettings> {
  return impl.updateSettings(patch);
}

export async function resetSettings(): Promise<AppSettings> {
  return impl.resetSettings();
}

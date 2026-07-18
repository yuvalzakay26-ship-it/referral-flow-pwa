"use client";

import { useSyncExternalStore } from "react";
import {
  subscribeSettings,
  getSettingsSnapshot,
  getSettingsServerSnapshot,
} from "@/lib/settingsStore";
import type { AppSettings } from "@/types";

/**
 * Live app settings. Re-renders the instant settings are saved or reset (via
 * the settingsService subscription), and reads the persisted localStorage value
 * on the client. SSR and the hydration pass use the compile-time defaults to
 * avoid a mismatch; the real saved values apply immediately after mount.
 */
export function useSettings(): AppSettings {
  return useSyncExternalStore(
    subscribeSettings,
    getSettingsSnapshot,
    getSettingsServerSnapshot,
  );
}

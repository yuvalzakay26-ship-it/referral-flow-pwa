"use client";

/**
 * Client settings store.
 *
 * Backs the live header greeting (useSyncExternalStore) and owns the one-time
 * localStorage → Supabase migration. Supabase is the source of truth after
 * migration; localStorage is kept only as an instant-render cache / offline
 * fallback. Theme preference is stored separately (see lib/theme) and is never
 * touched here.
 */

import type { AppSettings } from "@/types";
import { DEFAULT_SETTINGS } from "@/config/settings";
import { shouldImportLocalSettings } from "@/lib/settingsMigration";
import {
  getSettings,
  updateSettings,
} from "@/services/settingsService";

const SETTINGS_KEYS = Object.keys(DEFAULT_SETTINGS) as (keyof AppSettings)[];

/** Versioned cache key — bump the suffix if the persisted shape changes. */
export const SETTINGS_STORAGE_KEY = "referralflow_settings_v1";
const MIGRATION_FLAG_KEY = "referralflow_settings_migrated_v1";

type Listener = () => void;
const listeners = new Set<Listener>();

let current: AppSettings = { ...DEFAULT_SETTINGS };
let hydrated = false;
let initialized = false;

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function mergeWithDefaults(saved: Partial<AppSettings> | null): AppSettings {
  return { ...DEFAULT_SETTINGS, ...(saved ?? {}) };
}

function readRaw(): Partial<AppSettings> | null {
  if (!isBrowser()) return null;
  try {
    const raw = window.localStorage.getItem(SETTINGS_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Partial<AppSettings>) : null;
  } catch {
    return null;
  }
}

function writeToStorage(settings: AppSettings): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // Quota / private mode — keep the in-memory value, don't crash.
  }
}

/** Load the cached value into memory once for instant first paint. */
function ensureHydrated(): void {
  if (hydrated || !isBrowser()) return;
  current = mergeWithDefaults(readRaw());
  hydrated = true;
}

function notify(): void {
  for (const listener of listeners) listener();
}

/** Update the live snapshot + cache and notify subscribers. */
export function pushSettings(next: AppSettings): void {
  current = { ...next };
  writeToStorage(current);
  notify();
}

// ---------------------------------------------------------------------------
// useSyncExternalStore API
// ---------------------------------------------------------------------------

export function subscribeSettings(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getSettingsSnapshot(): AppSettings {
  ensureHydrated();
  return current;
}

export function getSettingsServerSnapshot(): AppSettings {
  return DEFAULT_SETTINGS;
}

/**
 * Load settings from the server and run the one-time browser→server migration.
 * Safe to call repeatedly; the network load happens once per session.
 */
export async function initSettings(): Promise<AppSettings> {
  ensureHydrated();
  if (initialized) return current;
  initialized = true;

  let server: AppSettings;
  try {
    server = await getSettings();
  } catch {
    // Offline / not ready — keep the cached snapshot as a fallback.
    return current;
  }

  const alreadyMigrated =
    isBrowser() && window.localStorage.getItem(MIGRATION_FLAG_KEY) === "1";

  if (!alreadyMigrated) {
    const savedRaw = readRaw();
    const local = mergeWithDefaults(savedRaw);
    const importLocal = shouldImportLocalSettings(
      server,
      local,
      DEFAULT_SETTINGS,
      SETTINGS_KEYS,
      savedRaw !== null,
    );

    if (importLocal) {
      try {
        server = await updateSettings(local);
      } catch {
        // If the import fails, fall back to server values; don't block the app.
      }
    }
    if (isBrowser()) {
      try {
        window.localStorage.setItem(MIGRATION_FLAG_KEY, "1");
      } catch {
        // ignore
      }
    }
  }

  pushSettings(server);
  return server;
}

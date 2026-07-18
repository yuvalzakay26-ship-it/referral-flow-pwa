import type { AppSettings } from "@/types";
import { store, delay } from "./store";
import { DEFAULT_SETTINGS } from "@/config/settings";

/**
 * App settings persistence.
 *
 * In mock mode this layer owns a single versioned localStorage entry so admin
 * edits survive refresh, browser restart and PWA relaunch. The in-memory
 * `store.settings` acts as a synchronous cache in front of it; every read
 * hydrates the cache from storage once per session, every write updates the
 * cache and mirrors it to storage. Saved values are always merged over
 * `DEFAULT_SETTINGS`, so settings keys added in a later release still resolve
 * for browsers that persisted an older shape.
 *
 * The async, snapshot/subscribe shape is intentionally the seam a Supabase
 * implementation drops into: swap the storage helpers for row reads/writes and
 * the callers (settings page, header greeting) keep working unchanged.
 */

/** Versioned key — bump the suffix if the persisted shape ever changes incompatibly. */
export const SETTINGS_STORAGE_KEY = "referralflow_settings_v1";

type Listener = () => void;
const listeners = new Set<Listener>();
let hydrated = false;

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

/** Merge persisted values over defaults so newly-added keys keep working. */
function mergeWithDefaults(saved: Partial<AppSettings> | null): AppSettings {
  return { ...DEFAULT_SETTINGS, ...(saved ?? {}) };
}

function readFromStorage(): AppSettings {
  if (!isBrowser()) return { ...DEFAULT_SETTINGS };
  try {
    const raw = window.localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (!raw) return { ...DEFAULT_SETTINGS };
    return mergeWithDefaults(JSON.parse(raw) as Partial<AppSettings>);
  } catch {
    // Corrupt JSON / blocked storage — fall back to defaults, never throw.
    return { ...DEFAULT_SETTINGS };
  }
}

function writeToStorage(settings: AppSettings): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // Quota exceeded / private mode — keep the in-memory value, don't crash.
  }
}

/** Load persisted settings into the in-memory cache once per client session. */
function ensureHydrated(): void {
  if (hydrated || !isBrowser()) return;
  store.settings = readFromStorage();
  hydrated = true;
}

function notify(): void {
  for (const listener of listeners) listener();
}

export async function getSettings(): Promise<AppSettings> {
  ensureHydrated();
  return delay({ ...store.settings });
}

export async function updateSettings(
  patch: Partial<AppSettings>,
): Promise<AppSettings> {
  ensureHydrated();
  // New object reference so useSyncExternalStore consumers re-render.
  store.settings = { ...store.settings, ...patch };
  writeToStorage(store.settings);
  notify();
  return delay({ ...store.settings });
}

/** Restore defaults and persist the reset so it survives a refresh. */
export async function resetSettings(): Promise<AppSettings> {
  ensureHydrated();
  store.settings = { ...DEFAULT_SETTINGS };
  writeToStorage(store.settings);
  notify();
  return delay({ ...store.settings });
}

// ---------------------------------------------------------------------------
// Synchronous snapshot API (for React's useSyncExternalStore)
// ---------------------------------------------------------------------------
// Lets the header greeting read live settings and re-render the instant a save
// or reset happens, without prop-drilling or a full page reload.

export function subscribeSettings(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** Stable reference between mutations — required for useSyncExternalStore. */
export function getSettingsSnapshot(): AppSettings {
  ensureHydrated();
  return store.settings;
}

/** Server render (and the client hydration pass) uses the compile-time defaults. */
export function getSettingsServerSnapshot(): AppSettings {
  return DEFAULT_SETTINGS;
}

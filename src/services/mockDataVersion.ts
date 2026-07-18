"use client";

/**
 * One-time reset of browser-side mock candidate storage.
 *
 * Context: the demo candidates this migration retires only ever lived inside the
 * JS bundle (src/data/mockCandidates.ts), and the mock store is in-memory — no
 * build of ReferralFlow has written candidates, notes, status history or
 * follow-ups to localStorage. So on a real device this migration finds nothing
 * to remove, and the demo records disappear simply because the new bundle seeds
 * an empty store.
 *
 * It is kept deliberately, for two reasons:
 *   1. It is the deterministic safety net if any build ever did persist
 *      candidate-scoped keys — those are removed exactly once per browser.
 *   2. It pins a mock schema version, so future resets have an anchor to run
 *      against instead of guessing from the data itself.
 *
 * Auth state, the in-progress candidate draft, jobs, message templates and
 * settings are all preserved: none of them carry demo candidate records.
 */

import { THEME_STORAGE_KEY } from "@/lib/theme";
import { SETTINGS_STORAGE_KEY } from "./settingsService";

const VERSION_KEY = "referralflow_mock_data_version";

/** Bump this when a future change must invalidate browser-side mock candidate data. */
const CURRENT_VERSION = 2;

/**
 * Keys that must survive the reset even though they match the candidate pattern
 * below. The draft is the administrator's own unsaved typing, not demo data;
 * the theme is a device preference that no candidate migration may reset.
 */
const PRESERVE = new Set([
  VERSION_KEY,
  THEME_STORAGE_KEY,
  SETTINGS_STORAGE_KEY,
  "rf_admin_authed",
  "rf_new_candidate_draft",
]);

/** Namespaces owned by this app. Anything else in localStorage is left alone. */
const OWNED_PREFIX = /^(rf_|referralflow_)/;

/** Candidate records, notes, status history and follow-ups. */
const CANDIDATE_SCOPED = /candidate|note|status_history|follow_?up|mock_store/i;

/**
 * Clear legacy candidate mock storage once per browser, then record the version.
 * Safe to call on every load: once the version is stored, it returns immediately.
 */
export function runMockDataMigration(): void {
  if (typeof window === "undefined") return;

  let storage: Storage;
  try {
    storage = window.localStorage;
  } catch {
    return; // Storage blocked (private mode / disabled cookies) — nothing to clear.
  }

  try {
    const raw = storage.getItem(VERSION_KEY);
    const stored = raw === null ? 0 : Number.parseInt(raw, 10);
    // A missing or corrupt value parses to 0/NaN and migrates once, then pins the
    // version — so the reset can never repeat on a later load.
    if (Number.isFinite(stored) && stored >= CURRENT_VERSION) return;

    const doomed: string[] = [];
    for (let i = 0; i < storage.length; i += 1) {
      const key = storage.key(i);
      if (!key || PRESERVE.has(key)) continue;
      if (OWNED_PREFIX.test(key) && CANDIDATE_SCOPED.test(key)) doomed.push(key);
    }
    // Collected first: removing during the scan would shift the key indices.
    for (const key of doomed) storage.removeItem(key);

    storage.setItem(VERSION_KEY, String(CURRENT_VERSION));
  } catch {
    // A failed migration must never block the admin UI.
  }
}

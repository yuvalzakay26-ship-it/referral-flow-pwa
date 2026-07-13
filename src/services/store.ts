/**
 * In-memory mock data store (development mode).
 *
 * This is the single mutable source of truth when USE_MOCK_DATA is true. It is a
 * module-level singleton, so on the client it persists across client-side
 * navigation within a session. Mutations are intentionally simple; when Supabase
 * is connected, the service functions swap this out for real queries.
 */

import type {
  AppSettings,
  Candidate,
  CandidateNote,
  CandidateStatusHistory,
  Job,
  MessageTemplate,
} from "@/types";
import {
  MOCK_CANDIDATES,
  MOCK_NOTES,
  MOCK_STATUS_HISTORY,
} from "@/data/mockCandidates";
import { MOCK_JOBS } from "@/data/mockJobs";
import { TEMPLATE_LIST } from "@/config/messageTemplates";
import { DEFAULT_SETTINGS } from "@/config/settings";

interface Store {
  candidates: Candidate[];
  history: CandidateStatusHistory[];
  notes: CandidateNote[];
  jobs: Job[];
  templates: MessageTemplate[];
  settings: AppSettings;
}

// Deep clone so the mock source arrays stay pristine.
function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

// Reuse a single instance across HMR reloads in dev.
const globalForStore = globalThis as unknown as { __rfStore?: Store };

export const store: Store =
  globalForStore.__rfStore ??
  (globalForStore.__rfStore = {
    candidates: clone(MOCK_CANDIDATES),
    history: clone(MOCK_STATUS_HISTORY),
    notes: clone(MOCK_NOTES),
    jobs: clone(MOCK_JOBS),
    templates: clone(TEMPLATE_LIST),
    settings: clone(DEFAULT_SETTINGS),
  });

/** Simulate a tiny latency so loading states are visible in dev. */
export function delay<T>(value: T, ms = 120): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

let idCounter = 1000;
export function nextId(prefix: string): string {
  idCounter += 1;
  return `${prefix}${idCounter}`;
}

import type { AppSettings } from "@/types";
import { store, delay } from "../store";
import { DEFAULT_SETTINGS } from "@/config/settings";

export async function getSettings(): Promise<AppSettings> {
  return delay({ ...store.settings });
}

export async function updateSettings(
  patch: Partial<AppSettings>,
): Promise<AppSettings> {
  store.settings = { ...store.settings, ...patch };
  return delay({ ...store.settings });
}

export async function resetSettings(): Promise<AppSettings> {
  store.settings = { ...DEFAULT_SETTINGS };
  return delay({ ...store.settings });
}

import type { AppSettings } from "@/types";
import { store, delay } from "./store";

export async function getSettings(): Promise<AppSettings> {
  return delay({ ...store.settings });
}

export async function updateSettings(
  patch: Partial<AppSettings>,
): Promise<AppSettings> {
  Object.assign(store.settings, patch);
  return delay({ ...store.settings });
}

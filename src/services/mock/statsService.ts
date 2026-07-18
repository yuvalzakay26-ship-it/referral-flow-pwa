import { store, delay } from "../store";
import { computeDashboardStats } from "../statsCompute";
import type { DashboardStats } from "../statsService.types";

export async function getDashboardStats(): Promise<DashboardStats> {
  return delay(computeDashboardStats(store.candidates));
}

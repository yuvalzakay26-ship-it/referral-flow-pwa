"use server";

/**
 * Dashboard stats — server action. Dispatches to Supabase or the mock store.
 * The DashboardStats type lives in ./statsService.types.
 */

import { USE_MOCK_DATA } from "@/config/app";
import type { DashboardStats } from "./statsService.types";
import * as mock from "./mock/statsService";
import * as supa from "./supabase/statsService";

export async function getDashboardStats(): Promise<DashboardStats> {
  return (USE_MOCK_DATA ? mock : supa).getDashboardStats();
}

import "server-only";

import type { Candidate } from "@/types";
import { requireOwner } from "@/lib/supabase/guard";
import { computeDashboardStats } from "../statsCompute";
import type { DashboardStats } from "../statsService.types";

/**
 * Dashboard metrics from the database. Selects only row columns (never CV file
 * bytes — those live in private storage) and aggregates in memory, which is the
 * right trade-off at single-owner scale.
 */
export async function getDashboardStats(): Promise<DashboardStats> {
  const { supabase } = await requireOwner();
  const { data, error } = await supabase
    .from("candidates")
    .select("*")
    .limit(5000);
  if (error) throw new Error("שגיאה בטעינת הנתונים.");
  return computeDashboardStats((data ?? []) as unknown as Candidate[]);
}

import "server-only";

import type { Job } from "@/types";
import { requireOwner } from "@/lib/supabase/guard";

export async function listJobs(): Promise<Job[]> {
  const { supabase } = await requireOwner();
  const { data, error } = await supabase
    .from("jobs")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw new Error("שגיאה בטעינת המשרות.");
  return (data ?? []) as unknown as Job[];
}

export async function createJob(
  data: Omit<Job, "id" | "created_at">,
): Promise<Job> {
  const { supabase } = await requireOwner();
  const { data: row, error } = await supabase
    .from("jobs")
    .insert(data)
    .select("*")
    .single();
  if (error) throw new Error("שגיאה ביצירת המשרה.");
  return row as unknown as Job;
}

export async function updateJob(
  id: string,
  patch: Partial<Job>,
): Promise<Job | null> {
  const { supabase } = await requireOwner();
  const { id: _id, created_at: _c, ...safe } = patch;
  void _id;
  void _c;
  const { data, error } = await supabase
    .from("jobs")
    .update(safe)
    .eq("id", id)
    .select("*")
    .maybeSingle();
  if (error) throw new Error("שגיאה בעדכון המשרה.");
  return (data as unknown as Job) ?? null;
}

export async function deleteJob(id: string): Promise<boolean> {
  const { supabase } = await requireOwner();
  const { error } = await supabase.from("jobs").delete().eq("id", id);
  if (error) throw new Error("שגיאה במחיקת המשרה.");
  return true;
}

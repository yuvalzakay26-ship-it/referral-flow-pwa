"use server";

/** Jobs service — server actions. Dispatches to Supabase or the mock store. */

import type { Job } from "@/types";
import { USE_MOCK_DATA } from "@/config/app";
import * as mock from "./mock/jobService";
import * as supa from "./supabase/jobService";

const impl = USE_MOCK_DATA ? mock : supa;

export async function listJobs(): Promise<Job[]> {
  return impl.listJobs();
}

export async function createJob(
  data: Omit<Job, "id" | "created_at">,
): Promise<Job> {
  return impl.createJob(data);
}

export async function updateJob(
  id: string,
  patch: Partial<Job>,
): Promise<Job | null> {
  return impl.updateJob(id, patch);
}

export async function deleteJob(id: string): Promise<boolean> {
  return impl.deleteJob(id);
}

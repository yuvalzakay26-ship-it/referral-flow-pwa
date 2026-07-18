import type { Job } from "@/types";
import { store, delay, nextId } from "../store";

export async function listJobs(): Promise<Job[]> {
  return delay(
    [...store.jobs].sort((a, b) => b.created_at.localeCompare(a.created_at)),
  );
}

export async function createJob(
  data: Omit<Job, "id" | "created_at">,
): Promise<Job> {
  const job: Job = {
    ...data,
    id: nextId("j"),
    created_at: new Date().toISOString(),
  };
  store.jobs.unshift(job);
  return delay(job);
}

export async function updateJob(
  id: string,
  patch: Partial<Job>,
): Promise<Job | null> {
  const job = store.jobs.find((j) => j.id === id);
  if (!job) return delay(null);
  Object.assign(job, patch);
  return delay(job);
}

export async function deleteJob(id: string): Promise<boolean> {
  const idx = store.jobs.findIndex((j) => j.id === id);
  if (idx === -1) return delay(false);
  store.jobs.splice(idx, 1);
  return delay(true);
}

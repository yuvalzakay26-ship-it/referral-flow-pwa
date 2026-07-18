"use server";

/**
 * Candidate service — server actions. Dispatches to the Supabase implementation
 * in production, or the in-memory mock in local development (USE_MOCK_DATA).
 * Callable from client components as RPC and from server components directly.
 *
 * Types live in ./candidateService.types (a "use server" file may only export
 * async functions).
 */

import type {
  Candidate,
  CandidateInput,
  CandidateNote,
  CandidateStatus,
  CandidateStatusHistory,
} from "@/types";
import { USE_MOCK_DATA } from "@/config/app";
import type {
  CandidateFilters,
  SortKey,
  SortDir,
  DuplicateMatch,
} from "./candidateService.types";
import * as mock from "./mock/candidateService";
import * as supa from "./supabase/candidateService";

const impl = USE_MOCK_DATA ? mock : supa;

export async function listCandidates(
  filters: CandidateFilters = {},
  sort: { key: SortKey; dir: SortDir } = { key: "created_at", dir: "desc" },
): Promise<Candidate[]> {
  return impl.listCandidates(filters, sort);
}

export async function getCandidate(id: string): Promise<Candidate | null> {
  return impl.getCandidate(id);
}

export async function getStatusHistory(
  candidateId: string,
): Promise<CandidateStatusHistory[]> {
  return impl.getStatusHistory(candidateId);
}

export async function getNotes(candidateId: string): Promise<CandidateNote[]> {
  return impl.getNotes(candidateId);
}

export async function updateCandidateStatus(
  id: string,
  status: CandidateStatus,
  changedBy: string,
  note?: string,
): Promise<Candidate | null> {
  return impl.updateCandidateStatus(id, status, changedBy, note);
}

export async function addNote(
  candidateId: string,
  author: string,
  body: string,
): Promise<CandidateNote> {
  return impl.addNote(candidateId, author, body);
}

export async function updateCandidate(
  id: string,
  patch: Partial<Candidate>,
): Promise<Candidate | null> {
  return impl.updateCandidate(id, patch);
}

export async function setFollowUp(
  id: string,
  date: string | null,
): Promise<Candidate | null> {
  return impl.setFollowUp(id, date);
}

export async function findDuplicates(
  phone: string,
  email: string,
  excludeId?: string,
): Promise<DuplicateMatch[]> {
  return impl.findDuplicates(phone, email, excludeId);
}

export async function createCandidate(
  input: CandidateInput,
): Promise<Candidate> {
  return impl.createCandidate(input);
}

export async function deleteCandidate(id: string): Promise<boolean> {
  return impl.deleteCandidate(id);
}

/**
 * CV service — MOCK implementation (local development only). No real storage;
 * updates the in-memory candidate's CV metadata so the UI can be exercised.
 */

import { store } from "../store";
import { sanitizeFileName } from "@/lib/utils";
import type { CvMeta } from "../cvService.types";

export async function uploadCv(
  candidateId: string,
  file: File,
): Promise<CvMeta> {
  const candidate = store.candidates.find((c) => c.id === candidateId);
  if (!candidate) throw new Error("המועמד לא נמצא.");
  const safeName = sanitizeFileName(file.name) || "cv";
  const meta: CvMeta = {
    cv_file_name: safeName,
    cv_storage_path: `cvs/${candidateId}/${safeName}`,
    cv_mime_type: file.type || "application/octet-stream",
    cv_size_bytes: file.size,
  };
  Object.assign(candidate, meta);
  return meta;
}

export async function removeCv(candidateId: string): Promise<boolean> {
  const candidate = store.candidates.find((c) => c.id === candidateId);
  if (!candidate) return false;
  candidate.cv_file_name = null;
  candidate.cv_storage_path = null;
  candidate.cv_mime_type = null;
  candidate.cv_size_bytes = null;
  return true;
}

/** Mock has no real object storage, so there is no downloadable URL. */
export async function getSignedCvUrl(): Promise<string | null> {
  return null;
}

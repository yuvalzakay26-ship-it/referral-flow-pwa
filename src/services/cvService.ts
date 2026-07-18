"use server";

/**
 * CV service — server actions. Uploads/replaces/removes private CV files and
 * mints short-lived signed download URLs. Dispatches to Supabase Storage in
 * production or the mock (metadata-only) implementation in local development.
 */

import { USE_MOCK_DATA } from "@/config/app";
import type { CvMeta } from "./cvService.types";
import * as mock from "./mock/cvService";
import * as supa from "./supabase/cvService";

const impl = USE_MOCK_DATA ? mock : supa;

export async function uploadCv(
  candidateId: string,
  file: File,
): Promise<CvMeta> {
  return impl.uploadCv(candidateId, file);
}

export async function removeCv(candidateId: string): Promise<boolean> {
  return impl.removeCv(candidateId);
}

export async function getSignedCvUrl(
  candidateId: string,
): Promise<string | null> {
  return impl.getSignedCvUrl(candidateId);
}

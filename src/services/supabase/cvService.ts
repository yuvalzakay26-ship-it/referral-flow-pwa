import "server-only";

/**
 * Private CV storage service (Supabase Storage, bucket "cvs").
 *
 * Files are validated server-side (type, extension, size), stored under a
 * collision-safe owner-scoped path, and served ONLY via short-lived signed URLs
 * generated on demand. Never public. Never getPublicUrl. CV filenames/contents
 * are not logged.
 *
 * Path convention: <owner-user-id>/<candidate-id>/<uuid>-<sanitized-filename>
 */

import { requireOwner } from "@/lib/supabase/guard";
import { sanitizeFileName } from "@/lib/utils";
import {
  CV_ACCEPTED_MIME,
  CV_ACCEPTED_EXTENSIONS,
  CV_MAX_SIZE_BYTES,
} from "@/config/app";
import { validateCvFile } from "@/lib/cvValidation";
import type { CvMeta } from "../cvService.types";

const BUCKET = "cvs";
const SIGNED_URL_TTL_SECONDS = 90;

const CV_LIMITS = {
  maxBytes: CV_MAX_SIZE_BYTES,
  acceptedExtensions: CV_ACCEPTED_EXTENSIONS,
  acceptedMime: CV_ACCEPTED_MIME,
};

/**
 * Upload (or replace) a candidate's CV. Validates the file, verifies the
 * candidate exists, uploads to the private bucket, updates the candidate row,
 * and removes any previous object. Throws a user-safe error on failure.
 */
export async function uploadCv(
  candidateId: string,
  file: File,
): Promise<CvMeta> {
  const { supabase, userId } = await requireOwner();

  const invalid = validateCvFile(file, CV_LIMITS);
  if (invalid) throw new Error(invalid);

  // Candidate must exist and belong to the owner (RLS enforces ownership).
  const { data: candidate, error: candErr } = await supabase
    .from("candidates")
    .select("id, cv_storage_path")
    .eq("id", candidateId)
    .maybeSingle();
  if (candErr) throw new Error("שגיאה בגישה למועמד.");
  if (!candidate) throw new Error("המועמד לא נמצא.");

  const safeName = sanitizeFileName(file.name) || "cv";
  const uuid = crypto.randomUUID();
  const path = `${userId}/${candidateId}/${uuid}-${safeName}`;
  const contentType = file.type || "application/octet-stream";

  const { error: uploadErr } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { contentType, upsert: false });
  if (uploadErr) throw new Error("שגיאה בהעלאת הקובץ.");

  const meta: CvMeta = {
    cv_file_name: safeName,
    cv_storage_path: path,
    cv_mime_type: contentType,
    cv_size_bytes: file.size,
  };

  const { error: updErr } = await supabase
    .from("candidates")
    .update(meta)
    .eq("id", candidateId);
  if (updErr) {
    // Roll back the just-uploaded object so we don't orphan it.
    await supabase.storage.from(BUCKET).remove([path]).catch(() => undefined);
    throw new Error("שגיאה בשמירת פרטי הקובץ.");
  }

  // Remove the previous CV object, if any, after the row points at the new one.
  const previous = (candidate as { cv_storage_path: string | null })
    .cv_storage_path;
  if (previous && previous !== path) {
    await supabase.storage.from(BUCKET).remove([previous]).catch(() => undefined);
  }

  return meta;
}

/** Remove a candidate's CV object and clear the row's CV metadata. */
export async function removeCv(candidateId: string): Promise<boolean> {
  const { supabase } = await requireOwner();
  const { data: candidate, error } = await supabase
    .from("candidates")
    .select("cv_storage_path")
    .eq("id", candidateId)
    .maybeSingle();
  if (error) throw new Error("שגיאה בגישה למועמד.");
  const path = (candidate as { cv_storage_path: string | null } | null)
    ?.cv_storage_path;
  if (path) {
    await supabase.storage.from(BUCKET).remove([path]).catch(() => undefined);
  }
  const { error: updErr } = await supabase
    .from("candidates")
    .update({
      cv_file_name: null,
      cv_storage_path: null,
      cv_mime_type: null,
      cv_size_bytes: null,
    })
    .eq("id", candidateId);
  if (updErr) throw new Error("שגיאה בהסרת הקובץ.");
  return true;
}

/**
 * Create a short-lived signed URL for the candidate's CV. Returns null when no
 * CV is stored. The URL expires within ~90 seconds and is never cached.
 */
export async function getSignedCvUrl(candidateId: string): Promise<string | null> {
  const { supabase } = await requireOwner();
  const { data: candidate, error } = await supabase
    .from("candidates")
    .select("cv_storage_path")
    .eq("id", candidateId)
    .maybeSingle();
  if (error) throw new Error("שגיאה בגישה למועמד.");
  const path = (candidate as { cv_storage_path: string | null } | null)
    ?.cv_storage_path;
  if (!path) return null;

  const { data, error: signErr } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(path, SIGNED_URL_TTL_SECONDS);
  if (signErr || !data) throw new Error("שגיאה ביצירת קישור הורדה.");
  return data.signedUrl;
}

/**
 * Remove all CV objects under a candidate's folder. Best-effort cleanup used
 * when deleting a candidate (row + related rows cascade in the database).
 */
export async function removeCandidateCvObjects(
  candidateId: string,
): Promise<void> {
  const { supabase, userId } = await requireOwner();
  const prefix = `${userId}/${candidateId}`;
  const { data, error } = await supabase.storage.from(BUCKET).list(prefix);
  if (error || !data || data.length === 0) return;
  const paths = data.map((obj) => `${prefix}/${obj.name}`);
  await supabase.storage.from(BUCKET).remove(paths).catch(() => undefined);
}

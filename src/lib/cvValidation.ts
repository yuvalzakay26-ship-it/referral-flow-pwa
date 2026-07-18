/**
 * Pure CV file validation, shared by the server CV service and unit tests.
 * No framework imports so it can run under `node --test` type-stripping.
 */

export interface CvLimits {
  maxBytes: number;
  acceptedExtensions: readonly string[];
  acceptedMime: readonly string[];
}

/** The subset of File we validate (kept structural so tests need no DOM File). */
export interface CvFileLike {
  name: string;
  size: number;
  type: string;
}

function extensionOf(name: string): string {
  const dot = name.lastIndexOf(".");
  return dot === -1 ? "" : name.slice(dot).toLowerCase();
}

/** Returns a user-safe Hebrew error message, or null when the file is valid. */
export function validateCvFile(
  file: CvFileLike,
  limits: CvLimits,
): string | null {
  if (!file || file.size === 0) return "לא נבחר קובץ.";
  if (file.size > limits.maxBytes) return "הקובץ גדול מדי (מקסימום 8MB).";
  const ext = extensionOf(file.name);
  if (!limits.acceptedExtensions.includes(ext)) {
    return "סוג הקובץ אינו נתמך (PDF או Word בלבד).";
  }
  if (file.type && !limits.acceptedMime.includes(file.type)) {
    return "סוג הקובץ אינו נתמך (PDF או Word בלבד).";
  }
  return null;
}

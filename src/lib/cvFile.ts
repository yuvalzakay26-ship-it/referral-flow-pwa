/**
 * Zod-free CV file metadata validation.
 *
 * Kept separate from `@/lib/validation` (Zod) so components that only need a
 * safe filename/size check never pull the Zod bundle. This is a pure metadata
 * check — it never inspects file contents.
 */

import {
  CV_ACCEPTED_EXTENSIONS,
  CV_MAX_SIZE_BYTES,
  CV_MAX_SIZE_MB,
} from "@/config/app";

export function validateCvFile(file: File): string | null {
  const ext = "." + (file.name.split(".").pop()?.toLowerCase() ?? "");
  if (
    !CV_ACCEPTED_EXTENSIONS.includes(
      ext as (typeof CV_ACCEPTED_EXTENSIONS)[number],
    )
  ) {
    return `יש להעלות קובץ מסוג PDF, DOC או DOCX`;
  }
  if (file.size > CV_MAX_SIZE_BYTES) {
    return `הקובץ גדול מדי (עד ${CV_MAX_SIZE_MB}MB)`;
  }
  if (file.size === 0) {
    return "הקובץ ריק";
  }
  return null;
}

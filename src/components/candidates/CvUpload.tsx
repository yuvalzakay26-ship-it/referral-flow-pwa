"use client";

import { useRef, useState } from "react";
import { FileText, UploadCloud, X } from "lucide-react";
import { cn, formatFileSize } from "@/lib/utils";
import { validateCvFile } from "@/lib/validation";
import { CV_MAX_SIZE_MB } from "@/config/app";

interface CvUploadProps {
  file: File | null;
  onChange: (file: File | null) => void;
  error?: string;
}

export function CvUpload({ file, onChange, error }: CvUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  function handleFile(f: File | undefined | null) {
    if (!f) return;
    const validationError = validateCvFile(f);
    if (validationError) {
      setLocalError(validationError);
      return;
    }
    setLocalError(null);
    onChange(f);
  }

  const shownError = localError ?? error;

  return (
    <div>
      {!file ? (
        <div
          role="button"
          tabIndex={0}
          onClick={() => inputRef.current?.click()}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
          }}
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            handleFile(e.dataTransfer.files?.[0]);
          }}
          className={cn(
            "flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed px-6 py-10 text-center transition-all focus-ring",
            dragging
              ? "border-[var(--rf-cyan)] bg-[color-mix(in_srgb,var(--rf-cyan)_8%,transparent)]"
              : "border-[var(--border-strong)] bg-[var(--surface-muted)] hover:border-[var(--rf-purple)] hover:bg-[var(--hover-background)]",
          )}
        >
          <span
            className="flex h-14 w-14 items-center justify-center rounded-2xl"
            style={{ background: "var(--rf-gradient-soft)" }}
          >
            <UploadCloud size={26} className="text-[var(--rf-cyan)]" />
          </span>
          <div>
            <p className="font-semibold text-[var(--rf-text)]">
              גררו לכאן קובץ או לחצו לבחירה
            </p>
            <p className="mt-1 text-xs text-[var(--rf-text-muted)]">
              PDF, DOC או DOCX · עד {CV_MAX_SIZE_MB}MB
            </p>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-3 rounded-2xl border border-[var(--border)] bg-[var(--rf-surface-2)]/60 p-4">
          <span className="flex h-11 w-11 flex-none items-center justify-center rounded-xl bg-[var(--rf-magenta)]/15">
            <FileText size={20} className="text-[var(--rf-magenta)]" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-[var(--rf-text)]">
              {file.name}
            </p>
            <p className="text-xs text-[var(--rf-text-muted)]">
              {formatFileSize(file.size)}
            </p>
          </div>
          <div className="flex flex-none items-center gap-1">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="rounded-lg px-3 py-1.5 text-xs font-medium text-[var(--rf-cyan)] hover:bg-[var(--hover-background)] focus-ring"
            >
              החלפה
            </button>
            <button
              type="button"
              onClick={() => onChange(null)}
              aria-label="הסרת הקובץ"
              className="rounded-lg p-1.5 text-[var(--rf-text-muted)] hover:bg-[var(--hover-background)] hover:text-[var(--rf-danger)] focus-ring"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.doc,.docx"
        className="sr-only"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />

      {shownError && (
        <p className="mt-2 text-xs font-medium text-[var(--rf-danger)]" role="alert">
          {shownError}
        </p>
      )}
    </div>
  );
}

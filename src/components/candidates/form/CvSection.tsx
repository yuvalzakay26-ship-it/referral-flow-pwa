"use client";

import { FileText, X, FileWarning } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { CvUpload } from "../CvUpload";
import { USE_MOCK_DATA } from "@/config/app";

interface Props {
  existingCv: string | null;
  cvFile: File | null;
  onChangeCvFile: (file: File | null) => void;
  onRemoveExistingCv: () => void;
}

export function CvSection({
  existingCv,
  cvFile,
  onChangeCvFile,
  onRemoveExistingCv,
}: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>קורות חיים</CardTitle>
        <FileText size={18} className="text-[var(--rf-text-muted)]" />
      </CardHeader>
      {existingCv && !cvFile ? (
        <div className="flex items-center gap-3 rounded-2xl border border-[var(--border)] bg-[var(--rf-surface-2)]/60 p-4">
          <FileText size={20} className="flex-none text-[var(--rf-magenta)]" />
          <span className="min-w-0 flex-1 truncate text-sm text-[var(--rf-text)]">
            {existingCv}
          </span>
          <button
            type="button"
            onClick={onRemoveExistingCv}
            aria-label="הסרת הקובץ"
            className="rounded-lg p-1.5 text-[var(--rf-text-muted)] hover:bg-[var(--hover-background)] hover:text-[var(--rf-danger)] focus-ring"
          >
            <X size={16} />
          </button>
        </div>
      ) : (
        <CvUpload file={cvFile} onChange={onChangeCvFile} />
      )}
      {USE_MOCK_DATA && (
        <p className="rf-badge badge-amber mt-3 flex items-start gap-2 rounded-xl border px-3 py-2 text-xs leading-relaxed">
          <FileWarning size={14} className="mt-0.5 flex-none" />
          מצב הדגמה: הקובץ אינו נשמר בפועל ואין להעלות קורות חיים אמיתיים. בסביבת
          אמת הקובץ נשמר ב-Supabase Storage פרטי בלבד.
        </p>
      )}
    </Card>
  );
}

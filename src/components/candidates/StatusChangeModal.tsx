"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Field, SelectInput, TextArea } from "@/components/ui/Field";
import { StatusBadge } from "@/components/ui/Badge";
import { STATUS_LIST, getStatusMeta } from "@/config/statuses";
import { updateCandidateStatus } from "@/services/candidateService";
import { DEFAULT_SETTINGS } from "@/config/settings";
import type { Candidate, CandidateStatus } from "@/types";

interface StatusChangeModalProps {
  open: boolean;
  candidate: Candidate;
  onClose: () => void;
  onUpdated: (updated: Candidate) => void;
}

export function StatusChangeModal({
  open,
  candidate,
  onClose,
  onUpdated,
}: StatusChangeModalProps) {
  const [status, setStatus] = useState<CandidateStatus>(candidate.status);
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    const updated = await updateCandidateStatus(
      candidate.id,
      status,
      DEFAULT_SETTINGS.admin_display_name,
      note.trim() || undefined,
    );
    setSaving(false);
    if (updated) {
      onUpdated(updated);
      setNote("");
      onClose();
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="שינוי סטטוס"
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose} disabled={saving}>
            ביטול
          </Button>
          <Button variant="gradient" onClick={handleSave} disabled={saving}>
            {saving && <Loader2 size={16} className="animate-spin" />}
            שמירה
          </Button>
        </div>
      }
    >
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2 text-sm text-[var(--rf-text-muted)]">
          <span>סטטוס נוכחי:</span>
          <StatusBadge status={candidate.status} size="sm" />
        </div>
        <Field label="סטטוס חדש" htmlFor="status">
          <SelectInput
            id="status"
            value={status}
            onChange={(e) => setStatus(e.target.value as CandidateStatus)}
          >
            {STATUS_LIST.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </SelectInput>
        </Field>
        <p className="rounded-lg border border-white/8 bg-white/[0.03] px-3 py-2 text-xs leading-relaxed text-[var(--rf-text-muted)]">
          {getStatusMeta(status).description}
        </p>
        <Field label="הערה (רשות)" htmlFor="note">
          <TextArea
            id="note"
            rows={3}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="הערה פנימית לשינוי הסטטוס..."
          />
        </Field>
      </div>
    </Modal>
  );
}

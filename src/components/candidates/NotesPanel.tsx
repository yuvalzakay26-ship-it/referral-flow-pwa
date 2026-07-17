"use client";

import { useState } from "react";
import { Loader2, Plus, StickyNote } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { TextArea } from "@/components/ui/Field";
import { formatDateTime } from "@/lib/utils";
import { addNote } from "@/services/candidateService";
import { DEFAULT_SETTINGS } from "@/config/settings";
import type { CandidateNote } from "@/types";

interface Props {
  candidateId: string;
  notes: CandidateNote[];
  onAdded: (note: CandidateNote) => void;
}

export function NotesPanel({ candidateId, notes, onAdded }: Props) {
  const [body, setBody] = useState("");
  const [saving, setSaving] = useState(false);

  async function submit() {
    const trimmed = body.trim();
    if (!trimmed) return;
    setSaving(true);
    const note = await addNote(
      candidateId,
      DEFAULT_SETTINGS.admin_display_name,
      trimmed,
    );
    setSaving(false);
    setBody("");
    onAdded(note);
  }

  return (
    <div>
      <div className="rf-badge badge-amber mb-3 flex items-center gap-2 rounded-lg border px-3 py-2 text-xs">
        <StickyNote size={14} className="flex-none" />
        הערות פנימיות — אינן נחשפות למועמדים.
      </div>

      <div className="flex flex-col gap-2">
        <TextArea
          rows={3}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="הוספת הערה פנימית..."
        />
        <div className="flex justify-end">
          <Button
            variant="gradient"
            size="sm"
            onClick={submit}
            disabled={saving || !body.trim()}
          >
            {saving ? (
              <Loader2 size={15} className="animate-spin" />
            ) : (
              <Plus size={15} />
            )}
            הוספת הערה
          </Button>
        </div>
      </div>

      <ul className="mt-4 flex flex-col gap-2">
        {notes.length === 0 ? (
          <li className="py-3 text-center text-sm text-[var(--rf-text-muted)]">
            אין הערות עדיין.
          </li>
        ) : (
          notes.map((n) => (
            <li
              key={n.id}
              className="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-muted)] p-3"
            >
              <p className="text-sm leading-relaxed text-[var(--rf-text)]">
                {n.body}
              </p>
              <p className="mt-1.5 text-xs text-[var(--rf-text-muted)]">
                {n.author} · {formatDateTime(n.created_at)}
              </p>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}

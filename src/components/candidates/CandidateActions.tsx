"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Download,
  MessageCircle,
  Send,
  CopyCheck,
  CalendarClock,
  Loader2,
  RefreshCw,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { CopyButton } from "@/components/ui/CopyButton";
import { Modal } from "@/components/ui/Modal";
import { Field, TextInput } from "@/components/ui/Field";
import { StatusChangeModal } from "./StatusChangeModal";
import {
  updateCandidateStatus,
  setFollowUp,
  deleteCandidate,
} from "@/services/candidateService";
import { getSignedCvUrl } from "@/services/cvService";
import { whatsappLink } from "@/lib/utils";
import { resolveTemplate, contextFromCandidate } from "@/lib/templates";
import { DEFAULT_TEMPLATES } from "@/config/messageTemplates";
import { DEFAULT_SETTINGS } from "@/config/settings";
import { USE_MOCK_DATA } from "@/config/app";
import type { Candidate } from "@/types";

export function CandidateActions({
  candidate,
  onUpdated,
}: {
  candidate: Candidate;
  onUpdated: (c: Candidate) => void;
}) {
  const router = useRouter();
  const [statusOpen, setStatusOpen] = useState(false);
  const [followOpen, setFollowOpen] = useState(false);
  const [followDate, setFollowDate] = useState(candidate.follow_up_date ?? "");
  const [busy, setBusy] = useState<string | null>(null);
  const [cvError, setCvError] = useState<string | null>(null);

  const preparedMessage = resolveTemplate(
    DEFAULT_TEMPLATES.transferred.body,
    contextFromCandidate(candidate),
  );

  async function quickStatus(status: Candidate["status"], key: string) {
    setBusy(key);
    const updated = await updateCandidateStatus(
      candidate.id,
      status,
      DEFAULT_SETTINGS.admin_display_name,
    );
    setBusy(null);
    if (updated) onUpdated(updated);
  }

  async function saveFollowUp() {
    setBusy("follow");
    const updated = await setFollowUp(candidate.id, followDate || null);
    setBusy(null);
    if (updated) {
      onUpdated(updated);
      setFollowOpen(false);
    }
  }

  async function downloadCv() {
    if (!candidate.cv_file_name) return;
    setCvError(null);
    if (USE_MOCK_DATA) {
      // Dev only: mock has no real object storage, so emit a placeholder file.
      const content = `קורות חיים (הדגמה) — ${candidate.full_name}\nמספר פנייה: ${candidate.reference_number}`;
      const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = candidate.cv_file_name.replace(/\.(pdf|docx?)$/i, ".txt");
      a.click();
      URL.revokeObjectURL(url);
      return;
    }
    // Production: request a short-lived signed URL from the server and open it.
    setBusy("cv");
    try {
      const url = await getSignedCvUrl(candidate.id);
      if (url) window.open(url, "_blank", "noopener,noreferrer");
      else setCvError("לא נמצא קובץ קורות חיים.");
    } catch {
      setCvError("שגיאה בהורדת הקובץ. נסו שוב.");
    } finally {
      setBusy(null);
    }
  }

  async function handleDelete() {
    const ok = window.confirm(
      `למחוק לצמיתות את ${candidate.full_name}? פעולה זו תמחק את המועמד, ההערות, ההיסטוריה, המעקבים וקובץ קורות החיים.`,
    );
    if (!ok) return;
    setBusy("delete");
    try {
      await deleteCandidate(candidate.id);
      router.push("/admin/candidates");
      router.refresh();
    } catch {
      setBusy(null);
      window.alert("מחיקת המועמד נכשלה. נסו שוב.");
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <Button variant="gradient" onClick={() => setStatusOpen(true)}>
        <RefreshCw size={16} />
        שינוי סטטוס
      </Button>

      <div className="grid grid-cols-2 gap-2">
        <CopyButton value={candidate.phone} label="העתקת טלפון" size="md" className="justify-center" />
        <CopyButton value={candidate.email} label="העתקת אימייל" size="md" className="justify-center" />
      </div>

      <Button asChild variant="solid">
        <a
          href={whatsappLink(candidate.phone, preparedMessage)}
          target="_blank"
          rel="noopener noreferrer"
        >
          <MessageCircle size={16} />
          פתיחת שיחת וואטסאפ
        </a>
      </Button>

      <CopyButton
        value={preparedMessage}
        label="העתקת הודעה מוכנה"
        size="md"
        className="justify-center"
      />

      <Button
        variant="outline"
        onClick={downloadCv}
        disabled={!candidate.cv_file_name || busy === "cv"}
      >
        {busy === "cv" ? (
          <Loader2 size={16} className="animate-spin" />
        ) : (
          <Download size={16} />
        )}
        הורדת קורות חיים
      </Button>
      {cvError && (
        <p className="rf-badge badge-red rounded-lg border px-3 py-1.5 text-xs" role="alert">
          {cvError}
        </p>
      )}

      <div className="my-1 border-t border-[var(--border-subtle)]" />

      <Button
        variant="solid"
        onClick={() => quickStatus("transferred", "transfer")}
        disabled={busy === "transfer"}
      >
        {busy === "transfer" ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
        סימון כהועבר לחברה
      </Button>
      <Button
        variant="solid"
        onClick={() => quickStatus("possible_duplicate", "dup")}
        disabled={busy === "dup"}
      >
        {busy === "dup" ? <Loader2 size={16} className="animate-spin" /> : <CopyCheck size={16} />}
        סימון כקיים במערכת
      </Button>
      <Button variant="outline" onClick={() => setFollowOpen(true)}>
        <CalendarClock size={16} />
        תזכורת מעקב
      </Button>

      <div className="my-1 border-t border-[var(--border-subtle)]" />

      <Button
        variant="ghost"
        onClick={handleDelete}
        disabled={busy === "delete"}
        className="text-[var(--rf-danger)] hover:bg-[color-mix(in_srgb,var(--rf-danger)_12%,transparent)]"
      >
        {busy === "delete" ? (
          <Loader2 size={16} className="animate-spin" />
        ) : (
          <Trash2 size={16} />
        )}
        מחיקת מועמד
      </Button>

      <StatusChangeModal
        open={statusOpen}
        candidate={candidate}
        onClose={() => setStatusOpen(false)}
        onUpdated={onUpdated}
      />

      <Modal
        open={followOpen}
        onClose={() => setFollowOpen(false)}
        title="תזכורת מעקב"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setFollowOpen(false)}>
              ביטול
            </Button>
            <Button variant="gradient" onClick={saveFollowUp} disabled={busy === "follow"}>
              {busy === "follow" && <Loader2 size={16} className="animate-spin" />}
              שמירה
            </Button>
          </div>
        }
      >
        <Field label="תאריך מעקב" htmlFor="followup" hint="השאירו ריק כדי להסיר את התזכורת">
          <TextInput
            id="followup"
            type="date"
            value={followDate}
            onChange={(e) => setFollowDate(e.target.value)}
          />
        </Field>
      </Modal>
    </div>
  );
}

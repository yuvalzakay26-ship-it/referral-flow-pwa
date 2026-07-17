"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowRight,
  User,
  Briefcase,
  MapPin,
  Mail,
  Phone,
  ExternalLink,
  GraduationCap,
  FileText,
  Radio,
  ShieldQuestion,
  History,
  StickyNote,
  Award,
  CalendarClock,
  Pencil,
} from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge, StatusBadge, EligibilityBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/admin/EmptyState";
import { CandidateActions } from "@/components/candidates/CandidateActions";
import { CandidateForm } from "@/components/candidates/CandidateForm";
import { StatusTimeline } from "@/components/candidates/StatusTimeline";
import { NotesPanel } from "@/components/candidates/NotesPanel";
import {
  getCandidate,
  getStatusHistory,
  getNotes,
} from "@/services/candidateService";
import { getSourceMeta } from "@/config/sources";
import { getJobTypeLabel } from "@/config/jobTypes";
import { getBonusMeta } from "@/config/bonus";
import { ELIGIBILITY_QUESTIONS, YES_NO_UNSURE_LABELS } from "@/config/eligibility";
import { formatDate, formatCurrency } from "@/lib/utils";
import type {
  Candidate,
  CandidateNote,
  CandidateStatusHistory,
} from "@/types";

function Row({
  icon: Icon,
  label,
  value,
}: {
  icon?: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-3 py-2">
      <span className="flex items-center gap-2 text-sm text-[var(--rf-text-muted)]">
        {Icon && <Icon size={15} />}
        {label}
      </span>
      <span className="text-left text-sm font-medium text-[var(--rf-text)]">
        {value || "—"}
      </span>
    </div>
  );
}

export default function CandidateDetailsPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;

  const [candidate, setCandidate] = useState<Candidate | null | undefined>(
    undefined,
  );
  const [history, setHistory] = useState<CandidateStatusHistory[]>([]);
  const [notes, setNotes] = useState<CandidateNote[]>([]);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    getCandidate(id).then(setCandidate);
    getStatusHistory(id).then(setHistory);
    getNotes(id).then(setNotes);
  }, [id]);

  function handleUpdated(updated: Candidate) {
    setCandidate(updated);
    getStatusHistory(id).then(setHistory);
  }

  function handleSaved(updated: Candidate) {
    setCandidate(updated);
    getStatusHistory(id).then(setHistory);
    setEditing(false);
  }

  if (candidate === undefined) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-10 w-64" />
        <div className="grid gap-4 lg:grid-cols-3">
          <Skeleton className="h-64 lg:col-span-2" />
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  if (candidate === null) {
    return (
      <EmptyState
        icon={User}
        title="המועמד לא נמצא"
        description="ייתכן שהרשומה נמחקה או שהקישור שגוי."
        action={
          <Link
            href="/admin/candidates"
            className="text-sm font-medium text-[var(--rf-cyan)] hover:underline"
          >
            חזרה לרשימת המועמדים
          </Link>
        }
      />
    );
  }

  const c = candidate;

  return (
    <div>
      <Link
        href="/admin/candidates"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-[var(--rf-text-muted)] hover:text-[var(--rf-text)] focus-ring"
      >
        <ArrowRight size={16} />
        חזרה לרשימה
      </Link>

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-black tracking-tight sm:text-3xl">
              {c.full_name}
            </h1>
            <StatusBadge status={c.status} />
          </div>
          <p className="mt-1 text-sm text-[var(--rf-text-muted)]">
            {c.reference_number} · התקבל ב-
            {formatDate(c.date_received ?? c.created_at)}
          </p>
        </div>
        {!editing && (
          <Button variant="gradient" onClick={() => setEditing(true)}>
            <Pencil size={16} />
            עריכת פרטים
          </Button>
        )}
      </div>

      {editing ? (
        <CandidateForm
          mode="edit"
          initial={c}
          onSaved={handleSaved}
          onCancel={() => setEditing(false)}
        />
      ) : (
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Main column */}
        <div className="flex flex-col gap-4 lg:col-span-2">
          <div className="grid gap-4 sm:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>פרטים אישיים</CardTitle>
                <User size={18} className="text-[var(--rf-text-muted)]" />
              </CardHeader>
              <div className="divide-y divide-[var(--border-subtle)]">
                <Row icon={Phone} label="טלפון" value={<span dir="ltr">{c.phone}</span>} />
                <Row icon={Mail} label="אימייל" value={<span dir="ltr">{c.email}</span>} />
                <Row icon={MapPin} label="עיר / אזור" value={c.city} />
                {c.whatsapp_number && c.whatsapp_number !== c.phone && (
                  <Row label="וואטסאפ" value={<span dir="ltr">{c.whatsapp_number}</span>} />
                )}
                {c.linkedin_url && (
                  <Row
                    icon={ExternalLink}
                    label="LinkedIn"
                    value={
                      <a
                        href={c.linkedin_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        dir="ltr"
                        className="text-[var(--rf-cyan)] hover:underline"
                      >
                        קישור
                      </a>
                    }
                  />
                )}
              </div>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>פרטים מקצועיים</CardTitle>
                <Briefcase size={18} className="text-[var(--rf-text-muted)]" />
              </CardHeader>
              <div className="divide-y divide-[var(--border-subtle)]">
                <Row icon={Briefcase} label="תחום" value={c.professional_field} />
                <Row label="תפקיד נוכחי" value={c.current_role} />
                <Row label="שנות ניסיון" value={c.years_of_experience} />
                <Row icon={GraduationCap} label="השכלה" value={c.education} />
                {c.study_year && <Row label="שנת לימודים" value={c.study_year} />}
              </div>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>העדפות ותקציר</CardTitle>
            </CardHeader>
            <div className="flex flex-col gap-3">
              <div>
                <p className="mb-1.5 text-xs text-[var(--rf-text-muted)]">סוגי משרה</p>
                <div className="flex flex-wrap gap-1.5">
                  {c.preferred_job_types.map((t) => (
                    <span key={t} className="rounded-lg border border-[var(--border)] bg-[var(--surface-muted)] px-2.5 py-1 text-xs text-[var(--rf-text)]">
                      {getJobTypeLabel(t)}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <p className="mb-1.5 text-xs text-[var(--rf-text-muted)]">אזורי עבודה</p>
                <div className="flex flex-wrap gap-1.5">
                  {c.preferred_locations.map((l) => (
                    <span key={l} className="rounded-lg border border-[var(--border)] bg-[var(--surface-muted)] px-2.5 py-1 text-xs text-[var(--rf-text)]">
                      {l}
                    </span>
                  ))}
                </div>
              </div>
              {c.technical_skills && c.technical_skills.length > 0 && (
                <div>
                  <p className="mb-1.5 text-xs text-[var(--rf-text-muted)]">כישורים / מילות מפתח</p>
                  <div className="flex flex-wrap gap-1.5">
                    {c.technical_skills.map((s) => (
                      <span key={s} className="rounded-lg border border-[var(--border)] bg-[var(--surface-muted)] px-2.5 py-1 text-xs text-[var(--rf-text)]">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {c.professional_summary && (
                <div>
                  <p className="mb-1.5 text-xs text-[var(--rf-text-muted)]">תקציר מקצועי</p>
                  <p className="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-muted)] p-3 text-sm leading-relaxed text-[var(--rf-text)]">
                    {c.professional_summary}
                  </p>
                </div>
              )}
            </div>
          </Card>

          <div className="grid gap-4 sm:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>זכאות להפניה</CardTitle>
                <ShieldQuestion size={18} className="text-[var(--rf-text-muted)]" />
              </CardHeader>
              <div className="mb-3">
                <EligibilityBadge status={c.eligibility_status} />
              </div>
              <div className="flex flex-col gap-2.5">
                {ELIGIBILITY_QUESTIONS.map((q) => (
                  <div key={q.key}>
                    <p className="text-xs leading-snug text-[var(--rf-text-muted)]">
                      {q.question}
                    </p>
                    <p className="text-sm font-medium text-[var(--rf-text)]">
                      {YES_NO_UNSURE_LABELS[c[q.key]]}
                    </p>
                  </div>
                ))}
              </div>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>מקור, קו״ח וסטטוס עסקי</CardTitle>
              </CardHeader>
              <div className="divide-y divide-[var(--border-subtle)]">
                <Row icon={Radio} label="מקור" value={getSourceMeta(c.source).label} />
                {c.source_details && (
                  <Row label="פרטי מקור" value={c.source_details} />
                )}
                <Row
                  icon={FileText}
                  label="קורות חיים"
                  value={c.cv_file_name ?? "לא צורף"}
                />
                <Row label="משרה רלוונטית" value={c.referred_position} />
                {c.general_category && (
                  <Row label="קטגוריה כללית" value={c.general_category} />
                )}
                <Row icon={CalendarClock} label="תאריך הפניה" value={formatDate(c.referral_date)} />
                <Row icon={CalendarClock} label="מעקב" value={formatDate(c.follow_up_date)} />
                <Row
                  icon={Award}
                  label="סטטוס בונוס"
                  value={<Badge label={getBonusMeta(c.bonus_status).label} className={getBonusMeta(c.bonus_status).badgeClass} size="sm" />}
                />
                {c.bonus_amount != null && (
                  <Row label="סכום בונוס" value={formatCurrency(c.bonus_amount)} />
                )}
                {c.closure_reason && (
                  <Row label="סיבת סגירה" value={c.closure_reason} />
                )}
              </div>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>היסטוריית סטטוס</CardTitle>
              <History size={18} className="text-[var(--rf-text-muted)]" />
            </CardHeader>
            <StatusTimeline history={history} />
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>הערות פנימיות</CardTitle>
              <StickyNote size={18} className="text-[var(--rf-text-muted)]" />
            </CardHeader>
            <NotesPanel
              candidateId={c.id}
              notes={notes}
              onAdded={(n) => setNotes((prev) => [n, ...prev])}
            />
          </Card>
        </div>

        {/* Actions sidebar */}
        <div className="lg:sticky lg:top-24 lg:self-start">
          <Card variant="elevated">
            <CardHeader>
              <CardTitle>פעולות</CardTitle>
            </CardHeader>
            <CandidateActions candidate={c} onUpdated={handleUpdated} />
          </Card>
        </div>
      </div>
      )}
    </div>
  );
}

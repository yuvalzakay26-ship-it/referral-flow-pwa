"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PageHeader } from "@/components/admin/PageHeader";
import { CandidateForm } from "@/components/candidates/CandidateForm";

export default function NewCandidatePage() {
  return (
    <div>
      <Link
        href="/admin/candidates"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-[var(--rf-text-muted)] hover:text-[var(--rf-text)] focus-ring"
      >
        <ArrowRight size={16} />
        חזרה לרשימה
      </Link>

      <PageHeader
        title="מועמד/ת חדש/ה"
        description="הזנה ידנית מהירה של מועמד/ת חדש/ה על ידי המנהל."
      />

      <CandidateForm mode="create" />
    </div>
  );
}

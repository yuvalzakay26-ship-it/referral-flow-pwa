"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { CheckCircle2, Home, Radio } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { CopyButton } from "@/components/ui/CopyButton";
import { formatDate } from "@/lib/utils";
import { DISCLAIMER_TEXT, WHATSAPP_CHANNEL_URL } from "@/config/app";
import type { SubmissionResult } from "@/types";

export function SuccessScreen({ result }: { result: SubmissionResult }) {
  const firstName = result.full_name.split(" ")[0] || result.full_name;
  return (
    <div className="mx-auto max-w-lg px-4 py-14 text-center sm:px-6">
      <motion.div
        initial={{ scale: 0, rotate: -20 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 15 }}
        className="mx-auto flex h-20 w-20 items-center justify-center rounded-full glow"
        style={{ background: "var(--rf-gradient)" }}
      >
        <CheckCircle2 size={40} className="text-white" />
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mt-6 text-3xl font-black tracking-tight"
      >
        תודה, {firstName}! 🎉
      </motion.h1>
      <motion.p
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mt-3 leading-relaxed text-[var(--rf-text-muted)]"
      >
        המועמדות שלך נקלטה בהצלחה והועברה לבדיקת התאמה.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="gradient-border mt-8 rounded-2xl p-[1px] text-right"
      >
        <div className="rounded-2xl bg-[var(--rf-surface)]/80 p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs text-[var(--rf-text-muted)]">מספר פנייה</p>
              <p className="mt-0.5 font-mono text-lg font-bold text-[var(--rf-text)]">
                {result.reference_number}
              </p>
            </div>
            <CopyButton value={result.reference_number} />
          </div>
          <div className="mt-4 border-t border-white/8 pt-4">
            <p className="text-xs text-[var(--rf-text-muted)]">תאריך שליחה</p>
            <p className="mt-0.5 font-medium text-[var(--rf-text)]">
              {formatDate(result.created_at)}
            </p>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-6 rounded-2xl border border-white/8 bg-white/[0.03] p-4 text-right"
      >
        <p className="text-sm font-semibold text-[var(--rf-text)]">מה הלאה?</p>
        <p className="mt-1.5 text-sm leading-relaxed text-[var(--rf-text-muted)]">
          {DISCLAIMER_TEXT}
        </p>
      </motion.div>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Button asChild variant="gradient" size="lg" className="w-full">
          <a href={WHATSAPP_CHANNEL_URL} target="_blank" rel="noopener noreferrer">
            <Radio size={18} />
            לערוץ העדכונים בוואטסאפ
          </a>
        </Button>
        <Button asChild variant="outline" size="lg" className="w-full">
          <Link href="/">
            <Home size={18} />
            חזרה לדף הבית
          </Link>
        </Button>
      </div>
    </div>
  );
}

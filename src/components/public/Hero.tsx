"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, FileUp, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { LogoMark } from "@/components/ui/Logo";

export function Hero() {
  return (
    <section className="relative mx-auto max-w-6xl px-4 pb-8 pt-14 sm:px-6 sm:pt-20">
      <div className="flex flex-col items-center text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <LogoMark size={76} />
        </motion.div>

        <motion.span
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.5 }}
          className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-medium text-[var(--rf-text-muted)]"
        >
          <ShieldCheck size={14} className="text-[var(--rf-cyan)]" />
          תוכנית הפניית עובדים · שליחה מאובטחת
        </motion.span>

        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="mt-5 max-w-3xl text-4xl font-black leading-[1.15] tracking-tight text-[var(--rf-text)] sm:text-6xl"
        >
          הדרך שלך{" "}
          <span className="text-gradient">להזדמנויות עבודה</span> חדשות
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="mt-5 max-w-2xl text-base leading-relaxed text-[var(--rf-text-muted)] sm:text-lg"
        >
          שולחים פרטים וקורות חיים, והם עוברים לבדיקת התאמה אפשרית דרך תוכנית
          הפניית עובדים. תהליך פשוט, מהיר ומאובטח — הכול במקום אחד.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="mt-8 flex w-full flex-col items-center gap-3 sm:w-auto sm:flex-row"
        >
          <Button asChild variant="gradient" size="lg" className="w-full sm:w-auto">
            <Link href="/apply">
              <FileUp size={18} />
              שליחת קורות חיים
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
            <Link href="#how">
              איך זה עובד?
              <ArrowLeft size={18} />
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}

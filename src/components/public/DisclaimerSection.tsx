import { Info, ShieldAlert, Lock } from "lucide-react";
import { FadeIn } from "@/components/ui/Motion";
import { DISCLAIMER_TEXT, NON_OFFICIAL_NOTICE, PRIVACY_NOTICE } from "@/config/app";

export function DisclaimerSection() {
  return (
    <section id="privacy" className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
      <FadeIn>
        {/* Prominent honesty banner */}
        <div className="gradient-border rounded-[var(--rf-radius)] p-[1px]">
          <div className="rounded-[var(--rf-radius)] bg-[var(--rf-surface)]/80 p-6 sm:p-8">
            <div className="flex items-start gap-4">
              <span className="flex h-11 w-11 flex-none items-center justify-center rounded-xl bg-amber-500/15">
                <ShieldAlert size={22} className="text-amber-300" />
              </span>
              <div>
                <h3 className="text-lg font-bold text-[var(--rf-text)]">
                  חשוב לדעת
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-[var(--rf-text-muted)]">
                  {DISCLAIMER_TEXT}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="glass rounded-2xl p-5">
            <div className="mb-2 flex items-center gap-2 text-[var(--rf-text)]">
              <Lock size={18} className="text-[var(--rf-cyan)]" />
              <h4 className="font-semibold">פרטיות והסכמה</h4>
            </div>
            <p className="text-sm leading-relaxed text-[var(--rf-text-muted)]">
              {PRIVACY_NOTICE}
            </p>
          </div>
          <div className="glass rounded-2xl p-5">
            <div className="mb-2 flex items-center gap-2 text-[var(--rf-text)]">
              <Info size={18} className="text-[var(--rf-purple)]" />
              <h4 className="font-semibold">הבהרה</h4>
            </div>
            <p className="text-sm leading-relaxed text-[var(--rf-text-muted)]">
              {NON_OFFICIAL_NOTICE}
            </p>
          </div>
        </div>
      </FadeIn>
    </section>
  );
}

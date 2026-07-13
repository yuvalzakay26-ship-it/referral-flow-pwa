import Link from "next/link";
import { Logo } from "@/components/ui/Logo";
import { NON_OFFICIAL_NOTICE } from "@/config/app";

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="mt-20 border-t border-white/5">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-md">
            <Logo size={36} />
            <p className="mt-3 text-sm leading-relaxed text-[var(--rf-text-muted)]">
              {NON_OFFICIAL_NOTICE}
            </p>
          </div>
          <nav className="flex flex-col gap-2 text-sm text-[var(--rf-text-muted)]">
            <Link href="/" className="hover:text-[var(--rf-text)]">
              דף הבית
            </Link>
            <Link href="/apply" className="hover:text-[var(--rf-text)]">
              שליחת קורות חיים
            </Link>
            <Link href="/apply#privacy" className="hover:text-[var(--rf-text)]">
              פרטיות
            </Link>
            <Link href="/admin" className="hover:text-[var(--rf-text)]">
              כניסת מנהל
            </Link>
          </nav>
        </div>
        <p className="mt-8 text-xs text-[var(--rf-text-muted)]/70">
          © {year} ReferralFlow · הפניות עבודה עם יובל. כלי פרטי לניהול הפניות.
        </p>
      </div>
    </footer>
  );
}

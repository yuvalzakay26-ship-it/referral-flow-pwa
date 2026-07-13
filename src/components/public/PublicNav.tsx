import Link from "next/link";
import { Logo } from "@/components/ui/Logo";
import { Button } from "@/components/ui/Button";
import { APP_SUBTITLE } from "@/config/app";

export function PublicNav() {
  return (
    <header className="sticky top-0 z-40">
      <div className="glass border-b border-white/5">
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <Link href="/" className="focus-ring rounded-xl" aria-label="ReferralFlow">
            <Logo subtitle={APP_SUBTITLE} size={38} />
          </Link>
          <Button asChild variant="gradient" size="sm" className="hidden sm:inline-flex">
            <Link href="/apply">שליחת קורות חיים</Link>
          </Button>
        </nav>
      </div>
    </header>
  );
}

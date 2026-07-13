"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  MessageSquare,
  Briefcase,
  Settings,
  LogOut,
  Menu,
  X,
  type LucideIcon,
} from "lucide-react";
import { Logo, LogoMark } from "@/components/ui/Logo";
import { ADMIN_NAV } from "./AdminNav";
import { cn } from "@/lib/utils";
import { isAuthed, logout } from "@/lib/auth";
import { DEFAULT_SETTINGS } from "@/config/settings";

const ICONS: Record<string, LucideIcon> = {
  LayoutDashboard,
  Users,
  MessageSquare,
  Briefcase,
  Settings,
};

function isActive(pathname: string, href: string): boolean {
  if (href === "/admin") return pathname === "/admin";
  return pathname === href || pathname.startsWith(href + "/");
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Client-side auth gate (mock). Real auth should also use middleware + RLS.
  // Syncs the ready flag from an external system (localStorage), which is the
  // legitimate exception to set-state-in-effect.
  useEffect(() => {
    if (!isAuthed()) {
      router.replace("/admin/login");
    } else {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setReady(true);
    }
  }, [router]);

  // Close the mobile drawer whenever the route changes.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMobileOpen(false);
  }, [pathname]);

  function handleLogout() {
    logout();
    router.replace("/admin/login");
  }

  if (!ready) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <LogoMark size={56} className="animate-pulse-glow" />
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh">
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-dvh w-64 flex-none flex-col border-l border-white/5 glass lg:flex">
        <div className="p-5">
          <Link href="/admin" className="focus-ring rounded-xl">
            <Logo size={36} subtitle="ניהול" />
          </Link>
        </div>
        <nav className="flex flex-1 flex-col gap-1 px-3">
          {ADMIN_NAV.map((item) => {
            const Icon = ICONS[item.icon] ?? LayoutDashboard;
            const active = isActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all focus-ring",
                  active
                    ? "text-white shadow-[0_0_0_1px_color-mix(in_srgb,var(--rf-purple)_40%,transparent)]"
                    : "text-[var(--rf-text-muted)] hover:bg-white/5 hover:text-[var(--rf-text)]",
                )}
                style={active ? { background: "var(--rf-gradient-soft)" } : undefined}
              >
                <Icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-white/5 p-3">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium text-[var(--rf-text-muted)] transition-all hover:bg-white/5 hover:text-red-300 focus-ring"
          >
            <LogOut size={18} />
            יציאה
          </button>
        </div>
      </aside>

      {/* Main column */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top bar */}
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-white/5 glass px-4 py-3 lg:px-8">
          <div className="flex items-center gap-3">
            <button
              className="rounded-lg p-2 text-[var(--rf-text)] hover:bg-white/5 focus-ring lg:hidden"
              onClick={() => setMobileOpen(true)}
              aria-label="פתיחת תפריט"
            >
              <Menu size={20} />
            </button>
            <span className="text-sm text-[var(--rf-text-muted)]">
              שלום, {DEFAULT_SETTINGS.admin_display_name} 👋
            </span>
          </div>
          <Link href="/" className="text-xs text-[var(--rf-text-muted)] hover:text-[var(--rf-text)]">
            לאתר הציבורי ↗
          </Link>
        </header>

        <main className="flex-1 p-4 lg:p-8">{children}</main>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute inset-y-0 right-0 flex w-72 max-w-[80%] flex-col glass-elevated p-5">
            <div className="mb-6 flex items-center justify-between">
              <Logo size={34} subtitle="ניהול" />
              <button
                onClick={() => setMobileOpen(false)}
                aria-label="סגירה"
                className="rounded-lg p-2 hover:bg-white/5 focus-ring"
              >
                <X size={20} />
              </button>
            </div>
            <nav className="flex flex-1 flex-col gap-1">
              {ADMIN_NAV.map((item) => {
                const Icon = ICONS[item.icon] ?? LayoutDashboard;
                const active = isActive(pathname, item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-medium transition-all",
                      active
                        ? "text-white"
                        : "text-[var(--rf-text-muted)] hover:bg-white/5",
                    )}
                    style={active ? { background: "var(--rf-gradient-soft)" } : undefined}
                  >
                    <Icon size={18} />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-medium text-[var(--rf-text-muted)] hover:bg-white/5 hover:text-red-300"
            >
              <LogOut size={18} />
              יציאה
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  UserPlus,
  MessageSquare,
  Briefcase,
  BarChart3,
  Settings,
  LogOut,
  X,
  type LucideIcon,
} from "lucide-react";
import { Logo, LogoMark } from "@/components/ui/Logo";
import {
  ADMIN_NAV,
  ADMIN_NAV_PRIMARY,
  ADMIN_NAV_SECONDARY,
  type AdminNavItem,
} from "./AdminNav";
import { MobileNav } from "./MobileNav";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { cn } from "@/lib/utils";
import { isAuthed, logout } from "@/lib/auth";
import { runMockDataMigration } from "@/services/mockDataVersion";
import { DEFAULT_SETTINGS } from "@/config/settings";
import { USE_MOCK_DATA } from "@/config/app";

const ICONS: Record<string, LucideIcon> = {
  LayoutDashboard,
  Users,
  UserPlus,
  MessageSquare,
  Briefcase,
  BarChart3,
  Settings,
};

/** The nav item whose href is the longest prefix of the current path is active. */
function getActiveHref(pathname: string): string {
  let best = "";
  for (const item of ADMIN_NAV) {
    if (
      (pathname === item.href || pathname.startsWith(item.href + "/")) &&
      item.href.length > best.length
    ) {
      best = item.href;
    }
  }
  return best;
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Retire any legacy demo-candidate storage exactly once per browser.
  useEffect(() => {
    runMockDataMigration();
  }, []);

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

  const activeHref = getActiveHref(pathname);

  return (
    <div className="flex min-h-dvh">
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-dvh w-64 flex-none flex-col border-l border-[var(--border-subtle)] glass lg:flex">
        <div className="p-5">
          <Link href="/admin" className="focus-ring rounded-xl">
            <Logo size={36} subtitle="ניהול" />
          </Link>
        </div>
        <nav className="flex flex-1 flex-col gap-1 px-3">
          {ADMIN_NAV_PRIMARY.map((item) => (
            <SidebarLink key={item.href} item={item} active={activeHref === item.href} />
          ))}
        </nav>
        <div className="mt-2 flex flex-col gap-1 border-t border-[var(--border-subtle)] px-3 pt-3">
          {ADMIN_NAV_SECONDARY.map((item) => (
            <SidebarLink key={item.href} item={item} active={activeHref === item.href} />
          ))}
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium text-[var(--rf-text-muted)] transition-all hover:bg-[var(--hover-background)] hover:text-[var(--rf-danger)] focus-ring"
          >
            <LogOut size={18} />
            יציאה
          </button>
        </div>
        <div className="p-3">
          <MockChip />
        </div>
      </aside>

      {/* Main column */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Compact, opaque top bar */}
        <header className="admin-header sticky top-0 z-30 px-4 py-2.5 lg:px-8 lg:py-3">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0 leading-tight">
              <p className="truncate text-sm font-bold text-[var(--rf-text)]">
                שלום, {DEFAULT_SETTINGS.admin_display_name} 👋
              </p>
              <p className="truncate text-[11px] text-[var(--rf-text-muted)]">
                אזור ניהול פרטי
              </p>
            </div>
            <div className="flex flex-none items-center gap-2">
              <ThemeToggle />
              <Link
                href="/admin"
                className="focus-ring rounded-lg lg:hidden"
                aria-label="ReferralFlow"
              >
                <LogoMark size={30} />
              </Link>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 pb-28 lg:p-8 lg:pb-8">
          {children}
        </main>
      </div>

      {/* Mobile bottom navigation */}
      <MobileNav
        activeHref={activeHref}
        onMore={() => setMobileOpen(true)}
        moreOpen={mobileOpen}
      />

      {/* Mobile drawer ("עוד") */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-[var(--overlay)] backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <div className="drawer-panel absolute inset-y-0 right-0 flex w-72 max-w-[82%] flex-col">
            <div className="flex items-center justify-between p-5 pb-4">
              <Logo size={32} subtitle="ניהול" />
              <button
                onClick={() => setMobileOpen(false)}
                aria-label="סגירה"
                className="rounded-lg p-2 text-[var(--rf-text)] hover:bg-[var(--hover-background)] focus-ring"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex flex-1 flex-col overflow-y-auto px-3">
              {/* Prominent creation action */}
              <Link
                href="/admin/candidates/new"
                className="btn-gradient mb-3 flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold focus-ring"
              >
                <UserPlus size={18} />
                מועמד חדש
              </Link>

              <nav className="flex flex-col gap-0.5">
                {ADMIN_NAV_PRIMARY.filter(
                  (i) => i.href !== "/admin/candidates/new",
                ).map((item) => (
                  <DrawerLink
                    key={item.href}
                    item={item}
                    active={activeHref === item.href}
                  />
                ))}
              </nav>

              <div className="my-3 border-t border-[var(--border-subtle)]" />

              <nav className="flex flex-col gap-0.5">
                {ADMIN_NAV_SECONDARY.map((item) => (
                  <DrawerLink
                    key={item.href}
                    item={item}
                    active={activeHref === item.href}
                  />
                ))}
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-medium text-[var(--rf-text-muted)] hover:bg-[var(--hover-background)] hover:text-[var(--rf-danger)] focus-ring"
                >
                  <LogOut size={18} />
                  יציאה
                </button>
              </nav>
            </div>

            <div className="p-4">
              <MockChip />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SidebarLink({ item, active }: { item: AdminNavItem; active: boolean }) {
  const Icon = ICONS[item.icon] ?? LayoutDashboard;
  return (
    <Link
      href={item.href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all focus-ring",
        active
          ? "text-[var(--rf-text)] shadow-[0_0_0_1px_color-mix(in_srgb,var(--rf-purple)_40%,transparent)]"
          : "text-[var(--rf-text-muted)] hover:bg-[var(--hover-background)] hover:text-[var(--rf-text)]",
      )}
      style={active ? { background: "var(--rf-gradient-soft)" } : undefined}
    >
      <Icon size={18} />
      {item.label}
    </Link>
  );
}

function DrawerLink({ item, active }: { item: AdminNavItem; active: boolean }) {
  const Icon = ICONS[item.icon] ?? LayoutDashboard;
  return (
    <Link
      href={item.href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-medium transition-all focus-ring",
        active
          ? "text-[var(--rf-text)]"
          : "text-[var(--rf-text)] hover:bg-[var(--hover-background)]",
      )}
      style={active ? { background: "var(--rf-gradient-soft)" } : undefined}
    >
      <Icon size={18} className={active ? undefined : "text-[var(--rf-text-muted)]"} />
      {item.label}
    </Link>
  );
}

/** Discreet mock-mode indicator shown near the bottom of the navigation. */
function MockChip() {
  if (!USE_MOCK_DATA) return null;
  return (
    <span className="rf-badge badge-amber inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[11px] font-medium">
      <span className="h-1.5 w-1.5 flex-none rounded-full bg-[var(--rf-warning)]" />
      מצב הדגמה — נתונים זמניים
    </span>
  );
}

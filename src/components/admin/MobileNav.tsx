"use client";

import Link from "next/link";
import {
  LayoutDashboard,
  Users,
  Plus,
  Briefcase,
  MoreHorizontal,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface MobileNavProps {
  /** The nav href considered active (longest-prefix match from the shell). */
  activeHref: string;
  /** Opens the side drawer ("עוד"). */
  onMore: () => void;
  /** True while the drawer is open, so "עוד" reads as active. */
  moreOpen: boolean;
}

interface NavLink {
  href: string;
  label: string;
  icon: LucideIcon;
}

/**
 * Fixed bottom navigation for authenticated admin pages on mobile.
 * Emphasizes the single candidate-creation action ("חדש"); the drawer holds
 * the rest (נתונים, הודעות, הגדרות, יציאה) via the "עוד" item.
 */
export function MobileNav({ activeHref, onMore, moreOpen }: MobileNavProps) {
  return (
    <nav className="mobile-nav lg:hidden" aria-label="ניווט ראשי">
      <div className="mx-auto flex max-w-lg items-stretch justify-around gap-1 px-2 pt-1.5">
        <NavItem
          href="/admin"
          label="דשבורד"
          icon={LayoutDashboard}
          active={!moreOpen && activeHref === "/admin"}
        />
        <NavItem
          href="/admin/candidates"
          label="מועמדים"
          icon={Users}
          active={!moreOpen && activeHref === "/admin/candidates"}
        />

        {/* Emphasized creation action */}
        <Link
          href="/admin/candidates/new"
          className="group relative -mt-4 flex flex-1 flex-col items-center gap-1 focus-ring rounded-2xl"
          aria-label="מועמד חדש"
        >
          <span className="btn-gradient flex h-12 w-12 items-center justify-center rounded-2xl">
            <Plus size={24} strokeWidth={2.5} />
          </span>
          <span className="text-[10px] font-semibold text-[var(--rf-text)]">
            חדש
          </span>
        </Link>

        <NavItem
          href="/admin/jobs"
          label="משרות"
          icon={Briefcase}
          active={!moreOpen && activeHref === "/admin/jobs"}
        />

        <button
          type="button"
          onClick={onMore}
          aria-label="עוד"
          aria-haspopup="menu"
          aria-expanded={moreOpen}
          className={cn(
            "flex flex-1 flex-col items-center gap-1 rounded-xl py-1.5 text-[10px] font-medium transition-colors focus-ring",
            moreOpen
              ? "text-[var(--rf-cyan)]"
              : "text-[var(--rf-text-muted)] hover:text-[var(--rf-text)]",
          )}
        >
          <MoreHorizontal size={22} />
          עוד
        </button>
      </div>
    </nav>
  );
}

function NavItem({
  href,
  label,
  icon: Icon,
  active,
}: NavLink & { active: boolean }) {
  return (
    <Link
      href={href}
      className={cn(
        "flex flex-1 flex-col items-center gap-1 rounded-xl py-1.5 text-[10px] font-medium transition-colors focus-ring",
        active
          ? "text-[var(--rf-cyan)]"
          : "text-[var(--rf-text-muted)] hover:text-[var(--rf-text)]",
      )}
      aria-current={active ? "page" : undefined}
    >
      <Icon size={22} />
      {label}
    </Link>
  );
}

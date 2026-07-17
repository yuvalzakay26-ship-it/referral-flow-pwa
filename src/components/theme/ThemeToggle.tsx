"use client";

import { Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "./useTheme";

/**
 * Header appearance toggle — one click switches straight between dark and light.
 * No menu, no system option.
 *
 * The glyphs show the *next* appearance (sun while dark, moon while light) and
 * are cross-faded by CSS keyed off `data-theme`, so the correct one is painted
 * on the first frame rather than after hydration.
 */
export function ThemeToggle({ className }: { className?: string }) {
  const { theme, toggleTheme } = useTheme();
  const label = theme === "dark" ? "מעבר לתצוגה בהירה" : "מעבר לתצוגה כהה";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={label}
      title={label}
      aria-pressed={theme === "light"}
      className={cn(
        "grid h-10 w-10 flex-none place-items-center rounded-xl border",
        "border-[var(--border)] bg-[var(--surface-muted)] text-[var(--rf-text-muted)]",
        "transition-[background-color,color,border-color,transform] duration-200",
        "hover:bg-[var(--hover-background-strong)] hover:text-[var(--rf-text)]",
        "hover:border-[var(--border-strong)] active:scale-95 focus-ring",
        className,
      )}
    >
      <Sun size={18} aria-hidden="true" className="theme-icon theme-icon-sun" />
      <Moon size={18} aria-hidden="true" className="theme-icon theme-icon-moon" />
    </button>
  );
}

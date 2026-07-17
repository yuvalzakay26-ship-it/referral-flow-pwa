"use client";

import { useCallback, useSyncExternalStore } from "react";
import {
  DEFAULT_THEME,
  THEME_COLORS,
  THEME_STORAGE_KEY,
  isTheme,
  type Theme,
} from "@/lib/theme";

/**
 * The `data-theme` attribute on <html> is the single source of truth: the inline
 * head script sets it before first paint, and this store reads it back. Using
 * useSyncExternalStore (rather than a lazy useState) means the hydration render
 * uses the server snapshot and React re-renders with the real value right after
 * — so a stored light theme never produces a hydration mismatch.
 */

const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) listener();
}

function subscribe(onChange: () => void) {
  listeners.add(onChange);
  // Keep other tabs / PWA windows in sync with the same preference.
  const onStorage = (e: StorageEvent) => {
    if (e.key !== THEME_STORAGE_KEY) return;
    const next = isTheme(e.newValue) ? e.newValue : DEFAULT_THEME;
    applyTheme(next);
    emit();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(onChange);
    window.removeEventListener("storage", onStorage);
  };
}

function getSnapshot(): Theme {
  const value = document.documentElement.getAttribute("data-theme");
  return isTheme(value) ? value : DEFAULT_THEME;
}

function getServerSnapshot(): Theme {
  return DEFAULT_THEME;
}

/** Writes the DOM attribute and browser chrome color, but not storage. */
function applyTheme(theme: Theme) {
  document.documentElement.setAttribute("data-theme", theme);
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute("content", THEME_COLORS[theme]);
}

export function setTheme(theme: Theme) {
  applyTheme(theme);
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // Private-mode or blocked storage: the appearance still applies for this session.
  }
  emit();
}

export function useTheme() {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const toggleTheme = useCallback(() => {
    setTheme(theme === "dark" ? "light" : "dark");
  }, [theme]);
  return { theme, setTheme, toggleTheme };
}

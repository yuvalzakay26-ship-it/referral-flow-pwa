"use client";

import { useSyncExternalStore } from "react";

/**
 * Subscribe to a CSS media query. Uses useSyncExternalStore so the value stays
 * correct across resizes without effects, and renders a stable server snapshot
 * (`false`) during SSR/hydration to avoid a mismatch. Consumers that render only
 * after client mount (e.g. after an async fetch resolves) therefore get the real
 * match on first paint.
 */
export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (onChange) => {
      if (typeof window === "undefined" || !window.matchMedia) return () => {};
      const mql = window.matchMedia(query);
      mql.addEventListener("change", onChange);
      return () => mql.removeEventListener("change", onChange);
    },
    () =>
      typeof window !== "undefined" && window.matchMedia
        ? window.matchMedia(query).matches
        : false,
    () => false,
  );
}

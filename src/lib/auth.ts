"use client";

/**
 * Mock admin authentication (development mode).
 *
 * Stores a simple flag in localStorage. This is intentionally minimal and NOT
 * secure — it only gates the demo UI. When Supabase auth is connected:
 *   - Replace login()/logout() with supabase.auth.signInWithPassword / signOut
 *   - Gate admin routes with middleware validating the Supabase session cookie
 *   - Enforce access at the data layer with Row Level Security
 */

import { MOCK_ADMIN } from "@/config/app";

const AUTH_KEY = "rf_admin_authed";

export function isAuthed(): boolean {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(AUTH_KEY) === "1";
}

export function login(email: string, password: string): boolean {
  const ok =
    email.trim().toLowerCase() === MOCK_ADMIN.email &&
    password === MOCK_ADMIN.password;
  if (ok && typeof window !== "undefined") {
    window.localStorage.setItem(AUTH_KEY, "1");
  }
  return ok;
}

export function logout(): void {
  if (typeof window !== "undefined") {
    window.localStorage.removeItem(AUTH_KEY);
  }
}

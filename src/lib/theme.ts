/**
 * Appearance modes. Deliberately two only — there is no system/auto option.
 *
 * Theme state lives in localStorage under its own key and is never touched by
 * the candidate store or its migrations, so clearing or migrating mock data
 * cannot reset the user's appearance.
 */

export type Theme = "dark" | "light";

export const THEME_STORAGE_KEY = "referralflow_theme";

/** First-time visitors get the primary branded appearance. */
export const DEFAULT_THEME: Theme = "dark";

export const THEMES: readonly Theme[] = ["dark", "light"];

/** Browser/PWA chrome color per mode. Must track --rf-bg in globals.css. */
export const THEME_COLORS: Record<Theme, string> = {
  dark: "#070A16",
  light: "#F2F5FB",
};

export function isTheme(value: unknown): value is Theme {
  return value === "dark" || value === "light";
}

/**
 * Runs synchronously in <head> during HTML parsing — before the browser paints —
 * so the stored appearance is applied without a flash of the wrong theme.
 *
 * It also owns the theme-color meta tag. The root layout deliberately does not
 * export `viewport.themeColor`: letting this script be the only writer keeps a
 * single, always-correct tag instead of racing Next's static one.
 */
export const THEME_INIT_SCRIPT = `(function(){try{var d=document.documentElement,t=localStorage.getItem(${JSON.stringify(
  THEME_STORAGE_KEY,
)});if(t!=="light"&&t!=="dark"){t=${JSON.stringify(
  DEFAULT_THEME,
)}}d.setAttribute("data-theme",t);var m=document.querySelector('meta[name="theme-color"]');if(!m){m=document.createElement("meta");m.setAttribute("name","theme-color");document.head.appendChild(m)}m.setAttribute("content",t==="light"?${JSON.stringify(
  THEME_COLORS.light,
)}:${JSON.stringify(THEME_COLORS.dark)})}catch(e){}})()`;

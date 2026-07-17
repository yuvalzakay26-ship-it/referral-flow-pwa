/** Admin navigation items (shared between sidebar, drawer and mobile nav). */
export interface AdminNavItem {
  href: string;
  label: string;
  icon: string; // lucide icon name resolved in the nav components
}

/** Primary workspace destinations. */
export const ADMIN_NAV_PRIMARY: AdminNavItem[] = [
  { href: "/admin", label: "דשבורד", icon: "LayoutDashboard" },
  { href: "/admin/candidates", label: "מועמדים", icon: "Users" },
  { href: "/admin/candidates/new", label: "מועמד חדש", icon: "UserPlus" },
  { href: "/admin/jobs", label: "משרות", icon: "Briefcase" },
  { href: "/admin/analytics", label: "נתונים", icon: "BarChart3" },
  { href: "/admin/messages", label: "הודעות מוכנות", icon: "MessageSquare" },
];

/** Settings and account actions, kept visually separate from primary nav. */
export const ADMIN_NAV_SECONDARY: AdminNavItem[] = [
  { href: "/admin/settings", label: "הגדרות", icon: "Settings" },
];

/** Full list — used for active-route resolution. */
export const ADMIN_NAV: AdminNavItem[] = [
  ...ADMIN_NAV_PRIMARY,
  ...ADMIN_NAV_SECONDARY,
];

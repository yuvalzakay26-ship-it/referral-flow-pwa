/** Admin navigation items (shared between sidebar and mobile nav). */
export interface AdminNavItem {
  href: string;
  label: string;
  icon: string; // lucide icon name resolved in the nav components
}

export const ADMIN_NAV: AdminNavItem[] = [
  { href: "/admin", label: "דשבורד", icon: "LayoutDashboard" },
  { href: "/admin/candidates", label: "מועמדים", icon: "Users" },
  { href: "/admin/candidates/new", label: "מועמד חדש", icon: "UserPlus" },
  { href: "/admin/jobs", label: "משרות", icon: "Briefcase" },
  { href: "/admin/messages", label: "הודעות מוכנות", icon: "MessageSquare" },
  { href: "/admin/settings", label: "הגדרות", icon: "Settings" },
];

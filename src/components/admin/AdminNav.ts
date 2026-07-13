/** Admin navigation items (shared between sidebar and mobile nav). */
export interface AdminNavItem {
  href: string;
  label: string;
  icon: string; // lucide icon name resolved in the nav components
}

export const ADMIN_NAV: AdminNavItem[] = [
  { href: "/admin", label: "לוח בקרה", icon: "LayoutDashboard" },
  { href: "/admin/candidates", label: "מועמדים", icon: "Users" },
  { href: "/admin/messages", label: "תבניות הודעה", icon: "MessageSquare" },
  { href: "/admin/jobs", label: "משרות", icon: "Briefcase" },
  { href: "/admin/settings", label: "הגדרות", icon: "Settings" },
];

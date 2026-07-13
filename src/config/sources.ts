import type { SourceKey } from "@/types";

export interface SourceMeta {
  key: SourceKey;
  label: string;
  icon: string;
}

/** Where a candidate came from. Keys match the ?source= query parameter. */
export const SOURCES: Record<SourceKey, SourceMeta> = {
  "whatsapp-channel": { key: "whatsapp-channel", label: "ערוץ וואטסאפ", icon: "Radio" },
  "whatsapp-group": { key: "whatsapp-group", label: "קבוצת וואטסאפ", icon: "Users" },
  facebook: { key: "facebook", label: "פייסבוק", icon: "Share2" },
  linkedin: { key: "linkedin", label: "לינקדאין", icon: "Briefcase" },
  friend: { key: "friend", label: "חבר/ה", icon: "UserPlus" },
  "college-group": { key: "college-group", label: "קבוצת מכללה / אוניברסיטה", icon: "GraduationCap" },
  "direct-link": { key: "direct-link", label: "קישור ישיר", icon: "Link" },
  other: { key: "other", label: "אחר", icon: "MoreHorizontal" },
};

export const SOURCE_LIST: SourceMeta[] = Object.values(SOURCES);

export function getSourceMeta(key: SourceKey): SourceMeta {
  return SOURCES[key] ?? SOURCES.other;
}

/** Parse a raw ?source= value into a known SourceKey, defaulting to direct-link. */
export function parseSource(raw: string | null | undefined): SourceKey {
  if (!raw) return "direct-link";
  const normalized = raw.toLowerCase().trim();
  if (normalized in SOURCES) return normalized as SourceKey;
  return "other";
}

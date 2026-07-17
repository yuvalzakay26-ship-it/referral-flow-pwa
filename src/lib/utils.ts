/** Lightweight className joiner (no extra deps). */
export type ClassValue = string | number | null | false | undefined;

export function cn(...classes: ClassValue[]): string {
  return classes.filter(Boolean).join(" ");
}

/*
 * Intl formatters are relatively expensive to construct, so they are created
 * once at module scope and reused. These were previously instantiated on every
 * call, which allocated a fresh formatter per row when used inside list `.map`s
 * (timelines, notes, tables). The formatting output is unchanged.
 */
const DATE_FMT = new Intl.DateTimeFormat("he-IL", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

const DATE_TIME_FMT = new Intl.DateTimeFormat("he-IL", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

const RELATIVE_FMT = new Intl.RelativeTimeFormat("he-IL", { numeric: "auto" });

const CURRENCY_FMT = new Intl.NumberFormat("he-IL", {
  style: "currency",
  currency: "ILS",
  maximumFractionDigits: 0,
});

/** Format an ISO date string to a Hebrew-readable date (dd/mm/yyyy). */
export function formatDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return DATE_FMT.format(d);
}

/** Format an ISO date string to Hebrew date + time. */
export function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return DATE_TIME_FMT.format(d);
}

/** Relative time in Hebrew (e.g. "לפני 3 ימים"). */
export function relativeTime(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  const diffMs = d.getTime() - Date.now();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
  if (Math.abs(diffDays) >= 1) return RELATIVE_FMT.format(diffDays, "day");
  const diffHours = Math.round(diffMs / (1000 * 60 * 60));
  if (Math.abs(diffHours) >= 1) return RELATIVE_FMT.format(diffHours, "hour");
  const diffMin = Math.round(diffMs / (1000 * 60));
  return RELATIVE_FMT.format(diffMin, "minute");
}

/** Generate a human-friendly reference number: RF-YYYYMMDD-XXXX. */
export function generateReferenceNumber(seed?: number): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const rand =
    seed !== undefined
      ? String(seed).padStart(4, "0").slice(-4)
      : String(Math.floor(1000 + Math.random() * 9000));
  return `RF-${y}${m}${day}-${rand}`;
}

/** Sanitize a filename: strip paths, keep safe characters, cap length. */
export function sanitizeFileName(name: string): string {
  const base = name.split(/[\\/]/).pop() ?? "file";
  const cleaned = base
    .replace(/[^\p{L}\p{N}._-]+/gu, "_")
    .replace(/_+/g, "_")
    .replace(/^_+|_+$/g, "");
  return cleaned.slice(0, 120) || "file";
}

/** Format bytes to a readable size. */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Normalize an Israeli phone number to a canonical local form (leading 0, no
 * separators) for reliable comparison — e.g. "+972 52-123-4567" -> "0521234567".
 * Returns "" when there are no digits.
 */
export function normalizePhone(phone: string): string {
  const digits = (phone ?? "").replace(/\D/g, "");
  if (!digits) return "";
  if (digits.startsWith("972")) return "0" + digits.slice(3);
  if (digits.startsWith("0")) return digits;
  return digits;
}

/** Pretty Israeli phone format: "0521234567" -> "052-1234567". */
export function formatIsraeliPhone(phone: string): string {
  const n = normalizePhone(phone);
  if (/^0\d{9}$/.test(n)) return `${n.slice(0, 3)}-${n.slice(3)}`;
  if (/^0\d{8}$/.test(n)) return `${n.slice(0, 2)}-${n.slice(2)}`;
  return phone;
}

/** Normalize an Israeli phone number to international format for wa.me links. */
export function toWhatsAppNumber(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("972")) return digits;
  if (digits.startsWith("0")) return `972${digits.slice(1)}`;
  return digits;
}

/** Build a WhatsApp deep link with an optional prefilled message. */
export function whatsappLink(phone: string, message?: string): string {
  const num = toWhatsAppNumber(phone);
  const base = `https://wa.me/${num}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

/** Currency formatting for bonus amounts (ILS). */
export function formatCurrency(amount: number | null | undefined): string {
  if (amount == null) return "—";
  return CURRENCY_FMT.format(amount);
}

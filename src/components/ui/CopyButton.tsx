"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { cn } from "@/lib/utils";

interface CopyButtonProps {
  value: string;
  label?: string;
  className?: string;
  size?: "sm" | "md";
}

export function CopyButton({ value, label, className, size = "sm" }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // Clipboard may be unavailable; fail silently without logging sensitive data.
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-lg border border-[var(--border)] bg-[var(--surface-muted)] font-medium text-[var(--rf-text)] transition-all hover:bg-[var(--hover-background-strong)] focus-ring",
        size === "sm" ? "h-9 px-3 text-sm" : "h-11 px-4 text-sm",
        className,
      )}
      aria-live="polite"
    >
      {copied ? (
        <Check size={15} className="text-[var(--rf-success)]" />
      ) : (
        <Copy size={15} />
      )}
      {label ?? (copied ? "הועתק" : "העתקה")}
    </button>
  );
}

"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

/** Enter/exit fade + rise, matched in globals.css `motion-reduce`. */
const ANIM_MS = 200;

/**
 * Lightweight modal with a CSS-driven fade/scale, replacing the previous
 * Framer Motion implementation (its only remaining use). Behaviour is
 * preserved: Escape closes, backdrop click closes, reduced-motion disables the
 * animation, and the panel mounts on open and unmounts after the exit settles.
 */
export function Modal({ open, onClose, title, children, footer }: ModalProps) {
  // `mounted` keeps the node in the tree through the exit animation; `shown`
  // drives the enter/exit CSS state one frame after mount.
  const [mounted, setMounted] = useState(open);
  const [shown, setShown] = useState(false);

  // Mount immediately when opening — a render-phase state adjustment (not an
  // effect), which is the React-recommended way to derive state from a prop
  // without a cascading effect render.
  if (open && !mounted) setMounted(true);

  useEffect(() => {
    if (open) {
      // Enter on the next frame so the transition has an initial state to animate from.
      const raf = requestAnimationFrame(() => setShown(true));
      return () => cancelAnimationFrame(raf);
    }
    // Play the exit, then unmount after it settles. Both updates are async
    // (rAF / timeout), never synchronous within the effect body.
    const raf = requestAnimationFrame(() => setShown(false));
    const timer = setTimeout(() => setMounted(false), ANIM_MS);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(timer);
    };
  }, [open]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (mounted) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [mounted, onClose]);

  if (!mounted) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <div
        onClick={onClose}
        aria-hidden
        className={cn(
          "absolute inset-0 bg-[var(--overlay)] backdrop-blur-sm",
          "transition-opacity duration-200 ease-out motion-reduce:transition-none",
          shown ? "opacity-100" : "opacity-0",
        )}
      />
      <div
        role="dialog"
        aria-modal="true"
        className={cn(
          "glass-elevated relative z-10 flex max-h-[90dvh] w-full flex-col rounded-t-3xl sm:m-4 sm:w-full sm:max-w-lg sm:rounded-3xl",
          "transition-[opacity,transform] duration-200 ease-out motion-reduce:transition-none",
          shown
            ? "opacity-100 translate-y-0 scale-100"
            : "opacity-0 translate-y-8 scale-[0.98]",
        )}
      >
        <div className="flex items-center justify-between border-b border-[var(--border-subtle)] p-5">
          <h3 className="text-lg font-bold text-[var(--rf-text)]">{title}</h3>
          <button
            onClick={onClose}
            aria-label="סגירה"
            className="rounded-lg p-1.5 text-[var(--rf-text-muted)] hover:bg-[var(--hover-background)] hover:text-[var(--rf-text)] focus-ring"
          >
            <X size={20} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-5">{children}</div>
        {footer && (
          <div className="border-t border-[var(--border-subtle)] p-5">{footer}</div>
        )}
      </div>
    </div>
  );
}

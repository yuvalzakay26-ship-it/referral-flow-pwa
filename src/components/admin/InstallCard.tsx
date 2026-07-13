"use client";

import { useEffect, useState } from "react";
import { Download, Share, X } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

/** Reusable PWA installation card for the admin area. */
export function InstallCard() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);
    window.addEventListener("appinstalled", () => setInstalled(true));
    if (window.matchMedia("(display-mode: standalone)").matches) {
      // Detecting an already-installed PWA from the platform (external system).
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setInstalled(true);
    }
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  async function handleInstall() {
    if (!deferred) return;
    await deferred.prompt();
    const choice = await deferred.userChoice;
    if (choice.outcome === "accepted") setInstalled(true);
    setDeferred(null);
  }

  if (installed || dismissed) return null;

  return (
    <div className="gradient-border relative rounded-2xl p-[1px]">
      <div className="rounded-2xl bg-[var(--rf-surface)]/85 p-5">
        <button
          onClick={() => setDismissed(true)}
          aria-label="סגירה"
          className="absolute left-3 top-3 rounded-lg p-1.5 text-[var(--rf-text-muted)] hover:bg-white/5"
        >
          <X size={16} />
        </button>
        <div className="flex items-center gap-3">
          <span
            className="flex h-11 w-11 flex-none items-center justify-center rounded-xl"
            style={{ background: "var(--rf-gradient-soft)" }}
          >
            <Download size={22} className="text-[var(--rf-cyan)]" />
          </span>
          <div>
            <h3 className="font-bold text-[var(--rf-text)]">התקנת האפליקציה</h3>
            <p className="text-xs text-[var(--rf-text-muted)]">
              גישה מהירה מהמסך הראשי, גם בלי דפדפן.
            </p>
          </div>
        </div>

        {deferred ? (
          <Button
            variant="gradient"
            size="sm"
            className="mt-4 w-full"
            onClick={handleInstall}
          >
            <Download size={16} />
            התקנה עכשיו
          </Button>
        ) : (
          <p className="mt-4 flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] p-3 text-xs leading-relaxed text-[var(--rf-text-muted)]">
            <Share size={14} className="flex-none text-[var(--rf-cyan)]" />
            בנייד: פתחו את תפריט הדפדפן ובחרו &quot;הוספה למסך הבית&quot;.
          </p>
        )}
      </div>
    </div>
  );
}

import { cn } from "@/lib/utils";

interface LogoProps {
  size?: number;
  className?: string;
  withGlow?: boolean;
}

/**
 * ReferralFlow logo mark — built purely from CSS/SVG shapes (no external assets).
 * A rounded gradient tile with an abstract "flow" arrow formed from three chevrons.
 */
export function LogoMark({ size = 40, className, withGlow = true }: LogoProps) {
  return (
    <span
      className={cn(
        "relative inline-flex items-center justify-center rounded-2xl",
        withGlow && "glow",
        className,
      )}
      style={{
        width: size,
        height: size,
        background: "var(--rf-gradient)",
      }}
      aria-hidden
    >
      <svg
        viewBox="0 0 24 24"
        width={size * 0.6}
        height={size * 0.6}
        fill="none"
        stroke="#fff"
        strokeWidth={2.4}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M5 7l5 5-5 5" opacity={0.55} />
        <path d="M11 7l5 5-5 5" opacity={0.8} />
        <path d="M17 7l1.5 5-1.5 5" />
      </svg>
    </span>
  );
}

interface LogoFullProps extends LogoProps {
  subtitle?: string;
  title?: string;
}

export function Logo({
  size = 40,
  className,
  title = "ReferralFlow",
  subtitle,
}: LogoFullProps) {
  return (
    <span className={cn("inline-flex items-center gap-3", className)}>
      <LogoMark size={size} />
      <span className="flex flex-col leading-tight">
        <span className="text-lg font-extrabold tracking-tight text-[var(--rf-text)]">
          {title}
        </span>
        {subtitle && (
          <span className="text-xs text-[var(--rf-text-muted)]">{subtitle}</span>
        )}
      </span>
    </span>
  );
}

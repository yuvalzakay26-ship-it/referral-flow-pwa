import Link from "next/link";
import { cn } from "@/lib/utils";

const PALETTE = [
  "var(--rf-magenta)",
  "var(--rf-purple)",
  "var(--rf-blue)",
  "var(--rf-cyan)",
  "#22C55E",
  "#F59E0B",
  "#EF4444",
  "#94A3B8",
];

export interface ChartDatum {
  label: string;
  value: number;
  /** Optional deep link — makes the row/legend entry clickable. */
  href?: string;
}

/** Horizontal bar list — readable, RTL-friendly distribution chart. */
export function BarList({
  data,
  className,
}: {
  data: ChartDatum[];
  className?: string;
}) {
  const max = Math.max(1, ...data.map((d) => d.value));
  return (
    <div className={cn("flex flex-col gap-2.5", className)}>
      {data.map((d, i) => {
        const row = (
          <>
            <div className="mb-1 flex items-center justify-between gap-2 text-sm">
              <span className="truncate text-[var(--rf-text)]">{d.label}</span>
              <span className="flex-none font-semibold text-[var(--rf-text-muted)]">
                {d.value}
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-white/5">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${(d.value / max) * 100}%`,
                  background: PALETTE[i % PALETTE.length],
                }}
              />
            </div>
          </>
        );
        return d.href ? (
          <Link
            key={d.label}
            href={d.href}
            className="block rounded-lg p-1 -m-1 transition-colors hover:bg-white/[0.04] focus-ring"
          >
            {row}
          </Link>
        ) : (
          <div key={d.label}>{row}</div>
        );
      })}
    </div>
  );
}

/** Donut chart from conic-gradient. Legend stacks below on mobile. */
export function DonutChart({
  data,
  size = 156,
}: {
  data: ChartDatum[];
  size?: number;
}) {
  const total = data.reduce((s, d) => s + d.value, 0);
  // Separate from `total`: guards the division without inflating the displayed count.
  const span = total || 1;
  const stops = data
    .map((d, i) => {
      const prev = data.slice(0, i).reduce((s, x) => s + x.value, 0);
      const start = (prev / span) * 360;
      const end = ((prev + d.value) / span) * 360;
      return `${PALETTE[i % PALETTE.length]} ${start}deg ${end}deg`;
    })
    .join(", ");

  return (
    <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-center">
      <div
        className="relative flex-none rounded-full"
        style={{
          width: size,
          height: size,
          background: `conic-gradient(${stops})`,
        }}
      >
        <div
          className="absolute rounded-full bg-[var(--rf-surface)]"
          style={{ inset: size * 0.22 }}
        >
          <div className="flex h-full flex-col items-center justify-center">
            <span className="text-2xl font-black text-[var(--rf-text)]">
              {total}
            </span>
            <span className="text-xs text-[var(--rf-text-muted)]">סה״כ</span>
          </div>
        </div>
      </div>
      <ul className="flex w-full flex-col gap-1.5 text-sm sm:w-auto">
        {data.map((d, i) => {
          const content = (
            <>
              <span
                className="h-3 w-3 flex-none rounded-full"
                style={{ background: PALETTE[i % PALETTE.length] }}
              />
              <span className="flex-1 truncate text-[var(--rf-text-muted)]">
                {d.label}
              </span>
              <span className="flex-none font-semibold text-[var(--rf-text)]">
                {d.value}
              </span>
            </>
          );
          return (
            <li key={d.label}>
              {d.href ? (
                <Link
                  href={d.href}
                  className="flex items-center gap-2 rounded-lg px-2 py-1 -mx-2 transition-colors hover:bg-white/[0.04] focus-ring"
                >
                  {content}
                </Link>
              ) : (
                <span className="flex items-center gap-2 px-2 py-1">{content}</span>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

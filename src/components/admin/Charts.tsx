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
    <div className={cn("flex flex-col gap-3", className)}>
      {data.map((d, i) => (
        <div key={d.label}>
          <div className="mb-1 flex items-center justify-between text-sm">
            <span className="text-[var(--rf-text)]">{d.label}</span>
            <span className="font-semibold text-[var(--rf-text-muted)]">
              {d.value}
            </span>
          </div>
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-white/5">
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${(d.value / max) * 100}%`,
                background: PALETTE[i % PALETTE.length],
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

/** Donut chart from conic-gradient. */
export function DonutChart({
  data,
  size = 160,
}: {
  data: ChartDatum[];
  size?: number;
}) {
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  const stops = data
    .map((d, i) => {
      const prev = data.slice(0, i).reduce((s, x) => s + x.value, 0);
      const start = (prev / total) * 360;
      const end = ((prev + d.value) / total) * 360;
      return `${PALETTE[i % PALETTE.length]} ${start}deg ${end}deg`;
    })
    .join(", ");

  return (
    <div className="flex items-center gap-5">
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
      <ul className="flex flex-col gap-2 text-sm">
        {data.map((d, i) => (
          <li key={d.label} className="flex items-center gap-2">
            <span
              className="h-3 w-3 flex-none rounded-full"
              style={{ background: PALETTE[i % PALETTE.length] }}
            />
            <span className="text-[var(--rf-text-muted)]">{d.label}</span>
            <span className="font-semibold text-[var(--rf-text)]">{d.value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

import { getStatusMeta } from "@/config/statuses";
import { formatDateTime } from "@/lib/utils";
import type { CandidateStatusHistory } from "@/types";

export function StatusTimeline({
  history,
}: {
  history: CandidateStatusHistory[];
}) {
  if (history.length === 0) {
    return (
      <p className="py-4 text-center text-sm text-[var(--rf-text-muted)]">
        אין היסטוריית סטטוסים.
      </p>
    );
  }

  return (
    <ol className="relative flex flex-col gap-5 pr-4">
      <span className="absolute bottom-2 right-[5px] top-2 w-px bg-white/10" />
      {history.map((h) => {
        const meta = getStatusMeta(h.to_status);
        return (
          <li key={h.id} className="relative">
            <span
              className="absolute -right-[19px] top-1 h-2.5 w-2.5 rounded-full ring-4 ring-[var(--rf-surface)]"
              style={{ background: "var(--rf-gradient)" }}
            />
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-semibold text-[var(--rf-text)]">
                {meta.label}
              </span>
              <span className="text-xs text-[var(--rf-text-muted)]">
                {formatDateTime(h.created_at)}
              </span>
            </div>
            <p className="text-xs text-[var(--rf-text-muted)]">
              על ידי {h.changed_by}
              {h.note ? ` · ${h.note}` : ""}
            </p>
          </li>
        );
      })}
    </ol>
  );
}

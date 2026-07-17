import { Skeleton } from "@/components/ui/Skeleton";

/**
 * Lightweight, server-rendered skeleton primitives for route-level `loading.tsx`
 * files. These are intentionally dependency-free (no client libraries) so a
 * route's fallback paints instantly during navigation and roughly matches the
 * real layout to minimise layout shift.
 */

/** Header block mirroring <PageHeader />. */
export function HeaderSkeleton({ withAction = false }: { withAction?: boolean }) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <Skeleton className="h-8 w-40" />
        <Skeleton className="mt-2 h-4 w-56" />
      </div>
      {withAction && <Skeleton className="h-10 w-32 rounded-xl" />}
    </div>
  );
}

/** Back-link stub used by the detail and create routes. */
export function BackLinkSkeleton() {
  return <Skeleton className="mb-4 h-4 w-24" />;
}

/** Vertical list of card-height blocks. */
export function CardListSkeleton({
  count = 4,
  className = "h-20",
}: {
  count?: number;
  className?: string;
}) {
  return (
    <div className="flex flex-col gap-3">
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} className={`w-full rounded-2xl ${className}`} />
      ))}
    </div>
  );
}

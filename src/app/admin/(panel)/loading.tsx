import { Skeleton } from "@/components/ui/Skeleton";
import { CardListSkeleton } from "@/components/admin/PageSkeleton";

/** Dashboard route fallback — mirrors the max-w-3xl dashboard layout. */
export default function DashboardLoading() {
  return (
    <div className="mx-auto max-w-3xl">
      {/* Primary action */}
      <Skeleton className="mb-3 h-14 w-full rounded-2xl" />
      <Skeleton className="mx-auto mb-6 h-5 w-64" />

      {/* Attention grid */}
      <Skeleton className="mb-3 h-5 w-28" />
      <div className="mb-6 grid grid-cols-2 gap-2.5">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-14 w-full rounded-2xl" />
        ))}
      </div>

      {/* Metrics */}
      <div className="mb-6 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-28 w-full rounded-2xl" />
        ))}
      </div>

      {/* Follow-ups + recent */}
      <Skeleton className="mb-3 h-5 w-32" />
      <div className="mb-6">
        <CardListSkeleton count={3} className="h-16" />
      </div>
      <Skeleton className="mb-3 h-5 w-40" />
      <CardListSkeleton count={4} className="h-16" />
    </div>
  );
}

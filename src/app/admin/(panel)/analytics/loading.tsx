import { Skeleton } from "@/components/ui/Skeleton";
import { HeaderSkeleton } from "@/components/admin/PageSkeleton";

/** Analytics route fallback — mirrors the max-w-3xl stacked chart cards. */
export default function AnalyticsLoading() {
  return (
    <div className="mx-auto max-w-3xl">
      <HeaderSkeleton />
      <Skeleton className="mb-4 h-64 w-full rounded-2xl" />
      <Skeleton className="mb-4 h-56 w-full rounded-2xl" />
      <Skeleton className="mb-4 h-52 w-full rounded-2xl" />
      <Skeleton className="h-32 w-full rounded-2xl" />
    </div>
  );
}

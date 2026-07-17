import { Skeleton } from "@/components/ui/Skeleton";
import {
  HeaderSkeleton,
  BackLinkSkeleton,
} from "@/components/admin/PageSkeleton";

/** New-candidate route fallback — back link, header, two-column form grid. */
export default function NewCandidateLoading() {
  return (
    <div>
      <BackLinkSkeleton />
      <HeaderSkeleton />
      <div className="grid gap-4 lg:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-72 w-full rounded-2xl" />
        ))}
      </div>
    </div>
  );
}

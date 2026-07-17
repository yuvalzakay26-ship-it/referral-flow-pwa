import { Skeleton } from "@/components/ui/Skeleton";
import {
  HeaderSkeleton,
  CardListSkeleton,
} from "@/components/admin/PageSkeleton";

/** Candidate-list route fallback — header, filter bar, list. */
export default function CandidatesLoading() {
  return (
    <div>
      <HeaderSkeleton withAction />
      {/* Filter bar */}
      <div className="glass rounded-2xl p-4">
        <Skeleton className="mb-3 h-10 w-full rounded-lg" />
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full rounded-lg" />
          ))}
        </div>
      </div>
      <div className="mt-4">
        <CardListSkeleton count={6} />
      </div>
    </div>
  );
}

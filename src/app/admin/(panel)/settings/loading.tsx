import { Skeleton } from "@/components/ui/Skeleton";
import { HeaderSkeleton } from "@/components/admin/PageSkeleton";

/** Settings route fallback — header plus form cards. */
export default function SettingsLoading() {
  return (
    <div>
      <HeaderSkeleton />
      <div className="flex flex-col gap-4">
        <Skeleton className="h-64 w-full rounded-2xl" />
        <Skeleton className="h-48 w-full rounded-2xl" />
      </div>
    </div>
  );
}

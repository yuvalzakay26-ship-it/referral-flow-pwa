import { HeaderSkeleton, CardListSkeleton } from "@/components/admin/PageSkeleton";

/** Jobs route fallback — header plus a list of job cards. */
export default function JobsLoading() {
  return (
    <div>
      <HeaderSkeleton withAction />
      <CardListSkeleton count={4} className="h-40" />
    </div>
  );
}

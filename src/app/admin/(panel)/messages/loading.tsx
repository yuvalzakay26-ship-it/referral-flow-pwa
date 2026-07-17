import { HeaderSkeleton, CardListSkeleton } from "@/components/admin/PageSkeleton";

/** Messages route fallback — header plus a list of template cards. */
export default function MessagesLoading() {
  return (
    <div>
      <HeaderSkeleton />
      <CardListSkeleton count={4} className="h-36" />
    </div>
  );
}

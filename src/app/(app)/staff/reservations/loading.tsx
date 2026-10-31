import { HeaderSkeleton, PageSkeleton, Skeleton, TableSkeleton, TabsSkeleton } from "@/components/Skeletons"

export default function ReservationsLoading() {
  return (
    <PageSkeleton>
      <HeaderSkeleton action />
      <TabsSkeleton />
      <div className="flex flex-wrap items-end gap-3">
        {["w-48", "w-56"].map((width) => (
          <div key={width} className="space-y-1">
            <Skeleton className="h-4 w-14" />
            <Skeleton className={`h-9 ${width}`} />
          </div>
        ))}
      </div>
      <TableSkeleton columns={5} />
    </PageSkeleton>
  )
}

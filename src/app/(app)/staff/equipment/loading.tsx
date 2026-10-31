import { HeaderSkeleton, PageSkeleton, Skeleton, TableSkeleton } from "@/components/Skeletons"

export default function EquipmentLoading() {
  return (
    <PageSkeleton>
      <HeaderSkeleton />
      {Array.from({ length: 2 }, (_, index) => (
        <section key={index} className="space-y-3">
          <Skeleton className="h-7 w-44" />
          <TableSkeleton columns={4} rows={3} />
        </section>
      ))}
    </PageSkeleton>
  )
}

import { HeaderSkeleton, PageSkeleton, TableSkeleton, TabsSkeleton } from "@/components/Skeletons"

export default function MyReservationsLoading() {
  return (
    <PageSkeleton>
      <HeaderSkeleton action />
      <TabsSkeleton />
      <TableSkeleton columns={5} />
    </PageSkeleton>
  )
}

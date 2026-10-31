import { HeaderSkeleton, PageSkeleton, TableSkeleton } from "@/components/Skeletons"

export default function PendingRequestsLoading() {
  return (
    <PageSkeleton>
      <HeaderSkeleton />
      <TableSkeleton columns={5} />
    </PageSkeleton>
  )
}

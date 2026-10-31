import { HeaderSkeleton, PageSkeleton, TableSkeleton } from "@/components/Skeletons"

export default function UsersLoading() {
  return (
    <PageSkeleton>
      <HeaderSkeleton action />
      <TableSkeleton columns={3} />
    </PageSkeleton>
  )
}

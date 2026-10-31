import { HeaderSkeleton, PageSkeleton, TableSkeleton } from "@/components/Skeletons"

export default function ResourcesLoading() {
  return (
    <PageSkeleton>
      <HeaderSkeleton action />
      <TableSkeleton columns={5} />
    </PageSkeleton>
  )
}

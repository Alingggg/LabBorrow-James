import { Card, CardHeader } from "@/components/ui/card"
import { HeaderSkeleton, PageSkeleton, Skeleton, TabsSkeleton } from "@/components/Skeletons"

export default function ResourcesLoading() {
  return (
    <PageSkeleton>
      <HeaderSkeleton />
      <TabsSkeleton />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }, (_, index) => (
          <Card key={index}>
            <CardHeader className="gap-2">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </CardHeader>
          </Card>
        ))}
      </div>
    </PageSkeleton>
  )
}

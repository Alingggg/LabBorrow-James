import { Card, CardContent } from "@/components/ui/card"
import { CardSkeleton, HeaderSkeleton, PageSkeleton, Skeleton } from "@/components/Skeletons"

export default function AdminLoading() {
  return (
    <PageSkeleton>
      <HeaderSkeleton />
      <div className="grid gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }, (_, index) => (
          <Card key={index}>
            <CardContent className="items-center gap-2">
              <Skeleton className="size-10 rounded-lg" />
              <Skeleton className="h-7 w-12" />
              <Skeleton className="h-3 w-24" />
            </CardContent>
          </Card>
        ))}
      </div>
      <CardSkeleton>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }, (_, index) => <Skeleton key={index} className="h-21 rounded-lg" />)}
        </div>
      </CardSkeleton>
    </PageSkeleton>
  )
}

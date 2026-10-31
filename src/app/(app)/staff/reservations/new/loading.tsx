import { Card, CardContent } from "@/components/ui/card"
import { BackHeaderSkeleton, FieldSkeleton, PageSkeleton, Skeleton } from "@/components/Skeletons"

export default function NewReservationLoading() {
  return (
    <PageSkeleton className="mx-auto max-w-3xl space-y-6">
      <BackHeaderSkeleton />
      <Card>
        <CardContent className="space-y-5 p-6">
          <div className="grid gap-5 sm:grid-cols-2">
            <FieldSkeleton />
            <FieldSkeleton />
          </div>
          <div className="grid gap-5 sm:grid-cols-3">
            {Array.from({ length: 3 }, (_, index) => <FieldSkeleton key={index} />)}
          </div>
          <FieldSkeleton tall />
          <Skeleton className="h-9 w-36" />
        </CardContent>
      </Card>
    </PageSkeleton>
  )
}

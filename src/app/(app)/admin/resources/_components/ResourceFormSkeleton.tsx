import { Card, CardContent } from "@/components/ui/card"
import { BackHeaderSkeleton, FieldSkeleton, PageSkeleton, Skeleton } from "@/components/Skeletons"

export function ResourceFormSkeleton() {
  return (
    <PageSkeleton className="mx-auto max-w-3xl space-y-6">
      <BackHeaderSkeleton />
      <Card>
        <CardContent className="space-y-5 p-6">
          <FieldSkeleton />
          <FieldSkeleton tall />
          <div className="grid gap-4 sm:grid-cols-2">
            {Array.from({ length: 4 }, (_, index) => <FieldSkeleton key={index} />)}
          </div>
          <Skeleton className="h-9 w-32" />
        </CardContent>
      </Card>
    </PageSkeleton>
  )
}

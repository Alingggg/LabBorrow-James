import { BackHeaderSkeleton, CardSkeleton, FieldSkeleton, PageSkeleton, Skeleton } from "@/components/Skeletons"

export default function ResourceLoading() {
  return (
    <PageSkeleton className="space-y-6">
      <div className="space-y-4">
        <BackHeaderSkeleton />
        <Skeleton className="h-4 w-full max-w-3xl" />
      </div>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
        <div className="space-y-6">
          <CardSkeleton>
            <div className="space-y-2">
              {Array.from({ length: 3 }, (_, index) => <Skeleton key={index} className="h-10 rounded-lg" />)}
            </div>
          </CardSkeleton>
          <CardSkeleton>
            <div className="space-y-4">
              <Skeleton className="h-4 w-56" />
              <div className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2">
                {Array.from({ length: 7 }, (_, index) => (
                  <div key={index} className="contents">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-28" />
                  </div>
                ))}
              </div>
            </div>
          </CardSkeleton>
        </div>
        <div className="self-start">
          <CardSkeleton>
            <div className="space-y-5">
              <div className="grid gap-5 sm:grid-cols-3">
                {Array.from({ length: 3 }, (_, index) => <FieldSkeleton key={index} />)}
              </div>
              <FieldSkeleton tall />
              <Skeleton className="h-9 w-36" />
            </div>
          </CardSkeleton>
        </div>
      </div>
    </PageSkeleton>
  )
}

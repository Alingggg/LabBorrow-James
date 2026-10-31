import { CardSkeleton, HeaderSkeleton, PageSkeleton, Skeleton } from "@/components/Skeletons"
import { cn } from "cn"

export default function SettingsLoading() {
  return (
    <PageSkeleton>
      <HeaderSkeleton />
      <CardSkeleton action>
        <div className="grid gap-x-8 gap-y-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 4 }, (_, index) => (
            <div key={index} className={cn("space-y-2", index === 3 && "sm:col-span-2 lg:col-span-3")}>
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-40" />
            </div>
          ))}
        </div>
      </CardSkeleton>
      <CardSkeleton action>
        <div className="grid max-w-md grid-cols-[auto_1fr] gap-x-8 gap-y-3">
          {Array.from({ length: 7 }, (_, index) => (
            <div key={index} className="contents">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-32" />
            </div>
          ))}
        </div>
      </CardSkeleton>
    </PageSkeleton>
  )
}

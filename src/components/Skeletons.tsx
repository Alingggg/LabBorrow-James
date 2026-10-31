import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { cn } from "cn"

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-md bg-muted", className)} />
}

export function PageSkeleton({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("space-y-7", className)} aria-busy="true" aria-label="Loading">
      {children}
    </div>
  )
}

export function HeaderSkeleton({ action = false }: { action?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <Skeleton className="h-8 w-56" />
      {action && <Skeleton className="h-9 w-32" />}
    </div>
  )
}

export function BackHeaderSkeleton() {
  return (
    <div>
      <Skeleton className="mb-3 h-4 w-36" />
      <Skeleton className="h-8 w-48" />
    </div>
  )
}

export function TabsSkeleton({ count = 2 }: { count?: number }) {
  return (
    <div className="flex gap-1 border-b">
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className="px-4 py-2"><Skeleton className="h-5 w-20" /></div>
      ))}
    </div>
  )
}

export function FieldSkeleton({ tall = false }: { tall?: boolean }) {
  return (
    <div className="space-y-2">
      <Skeleton className="h-4 w-20" />
      <Skeleton className={tall ? "h-16" : "h-9"} />
    </div>
  )
}

export function TableSkeleton({ columns, rows = 6 }: { columns: number; rows?: number }) {
  const gridTemplateColumns = `repeat(${columns}, minmax(0, 1fr))`
  return (
    <div className="overflow-hidden rounded-xl border bg-card">
      <div className="grid h-11 items-center gap-4 bg-muted/40 px-4" style={{ gridTemplateColumns }}>
        {Array.from({ length: columns }, (_, index) => <Skeleton key={index} className="h-3 w-16" />)}
      </div>
      {Array.from({ length: rows }, (_, row) => (
        <div key={row} className="grid h-14 items-center gap-4 border-t px-4" style={{ gridTemplateColumns }}>
          {Array.from({ length: columns }, (_, index) => <Skeleton key={index} className="h-4 w-3/4" />)}
        </div>
      ))}
    </div>
  )
}

export function CardSkeleton({ action = false, children }: { action?: boolean; children: React.ReactNode }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-4">
        <Skeleton className="h-5 w-36" />
        {action && <Skeleton className="h-9 w-28" />}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  )
}

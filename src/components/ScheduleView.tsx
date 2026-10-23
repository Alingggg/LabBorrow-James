import Link from "next/link"
import { ChevronLeft, ChevronRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/PageHeader"
import { ScheduleDatePicker } from "@/components/ScheduleDatePicker"
import { HourAxis, Timeline, TimelineLegend } from "@/components/Timeline"
import { formatSchoolDay, shiftSchoolDate } from "@/lib/school-time"
import type { DaySchedule, ScheduleHours, ScheduleResource } from "@/types/schedule"

const rowGrid = "grid gap-2 px-4 sm:grid-cols-[11rem_minmax(0,1fr)] sm:items-center sm:gap-4"

function ResourceList({
  title,
  items,
  range,
  resourceHref,
}: {
  title: string
  items: ScheduleResource[]
  range: ScheduleHours
  resourceHref: (resource: ScheduleResource) => string
}) {
  if (!items.length) return null
  return (
    <section className="space-y-3">
      <h2 className="text-lg font-semibold">{title}</h2>
      <div className="rounded-xl border bg-card">
        <div className={`${rowGrid} border-b pt-3 pb-2`}>
          <span className="max-sm:hidden" />
          <HourAxis range={range} />
        </div>
        <ul className="divide-y">
          {items.map((item) => (
            <li key={item.id} className={`${rowGrid} py-3`}>
              <Link href={resourceHref(item)} className="truncate text-sm font-medium hover:underline">
                {item.name}
              </Link>
              <Timeline range={range} slots={item.slots} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

export function ScheduleView({
  date,
  today,
  basePath,
  schedule,
  resourceHref,
  showOverdue,
}: {
  date: string
  today: string
  basePath: string
  schedule: DaySchedule
  resourceHref: (resource: ScheduleResource) => string
  showOverdue?: boolean
}) {
  const previous = shiftSchoolDate(date, -1)
  const next = shiftSchoolDate(date, 1)

  return (
    <div className="space-y-7">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <PageHeader title="Schedule" />
        <div className="flex items-center gap-2">
          {date !== today && (
            <Button asChild variant="ghost"><Link href={basePath}>Today</Link></Button>
          )}
          <Button asChild variant="outline" size="icon">
            <Link href={`${basePath}?date=${previous}`} aria-label="Previous day"><ChevronLeft /></Link>
          </Button>
          <ScheduleDatePicker key={date} date={date} basePath={basePath} />
          <Button asChild variant="outline" size="icon">
            <Link href={`${basePath}?date=${next}`} aria-label="Next day"><ChevronRight /></Link>
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm">
          <span className="font-medium">{formatSchoolDay(date)}</span>
          <span className="text-muted-foreground"> · {schedule.hours?.label ?? "Closed"}</span>
        </p>
        {schedule.hours && <TimelineLegend showOverdue={showOverdue} />}
      </div>

      {!schedule.hours ? (
        <p className="rounded-xl border bg-card py-12 text-center text-sm text-muted-foreground">
          The school is closed on this day.
        </p>
      ) : schedule.resources.length ? (
        <>
          <ResourceList
            title="Rooms"
            range={schedule.hours}
            resourceHref={resourceHref}
            items={schedule.resources.filter((item) => item.type === "ROOM")}
          />
          <ResourceList
            title="Equipment"
            range={schedule.hours}
            resourceHref={resourceHref}
            items={schedule.resources.filter((item) => item.type === "EQUIPMENT")}
          />
        </>
      ) : (
        <p className="rounded-xl border bg-card py-12 text-center text-sm text-muted-foreground">
          No resources available.
        </p>
      )}
    </div>
  )
}

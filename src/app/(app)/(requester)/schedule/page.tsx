import type { Metadata } from "next"

import { ScheduleView } from "@/components/ScheduleView"
import { resolveSchoolDate, schoolDayBounds, todayInSchool } from "@/lib/school-time"
import { getRequesterSchedule } from "./data"

export const metadata: Metadata = { title: "Schedule" }

export default async function SchedulePage({ searchParams }: PageProps<"/schedule">) {
  const { date: rawDate } = await searchParams
  const date = resolveSchoolDate(rawDate)
  const bounds = schoolDayBounds(date)
  if (!bounds) throw new Error("Could not resolve the school day.")

  return (
    <ScheduleView
      date={date}
      today={todayInSchool()}
      basePath="/schedule"
      schedule={await getRequesterSchedule(bounds)}
      resourceHref={(resource) => `/resources/${resource.id}`}
    />
  )
}

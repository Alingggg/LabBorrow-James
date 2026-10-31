import type { Metadata } from "next"

import { ScheduleView } from "@/components/ScheduleView"
import { resolveSchoolDate, todayInSchool } from "@/lib/school-time"
import { getStaffSchedule } from "../data"

export const metadata: Metadata = { title: "Schedule" }

export default async function StaffSchedulePage({ searchParams }: PageProps<"/staff/schedule">) {
  const { date: rawDate } = await searchParams
  const { date, bounds } = resolveSchoolDate(rawDate)

  return (
    <ScheduleView
      date={date}
      today={todayInSchool()}
      basePath="/staff/schedule"
      schedule={await getStaffSchedule(bounds)}
      resourceHref={(resource) =>
        `/staff/reservations?type=${resource.type === "EQUIPMENT" ? "equipment" : "rooms"}&resourceId=${resource.id}`
      }
      showOverdue
    />
  )
}

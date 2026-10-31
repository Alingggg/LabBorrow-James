import "server-only"

import { ne } from "drizzle-orm"

import { resources } from "@/db/schema"
import { requireStaff } from "@/data/auth"
import { getDaySchedule, type SchoolDay } from "@/data/schedule"

export async function getStaffSchedule(day: SchoolDay) {
  await requireStaff()
  // Unavailable resources stay visible so staff can see bookings made before the change
  return getDaySchedule(day, { resourceFilter: ne(resources.status, "RETIRED"), withDetails: true })
}

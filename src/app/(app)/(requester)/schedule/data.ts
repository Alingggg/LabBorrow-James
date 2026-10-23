import "server-only"

import { requireRequester } from "@/data/auth"
import { visibleTo } from "@/data/resources"
import { getDaySchedule, type SchoolDay } from "@/data/schedule"
import type { UserRole } from "@/lib/roles"

export async function getRequesterSchedule(day: SchoolDay) {
  const currentUser = await requireRequester()
  return getDaySchedule(day, {
    resourceFilter: visibleTo(currentUser.role as UserRole),
    withDetails: false,
  })
}

import "server-only"

import { differenceInMinutes, isPast, max, min } from "date-fns"
import { and, asc, eq, gt, inArray, lt, type SQL } from "drizzle-orm"

import { db } from "@/db"
import { reservations, resources, user } from "@/db/schema"
import { getOperatingHours } from "@/data/settings"
import { activeReservationStatuses } from "@/lib/reservation-status"
import { clockToMinutes, formatSchoolTime, formatSchoolTimeRange } from "@/lib/school-time"
import type { DaySchedule, ScheduleSlot } from "@/types/schedule"

export type SchoolDay = { start: Date; end: Date; weekday: number }

// Callers authorize first; withDetails adds requester names and purposes for staff
export async function getDaySchedule(
  day: SchoolDay,
  options: { resourceFilter: SQL | undefined; withDetails: boolean }
): Promise<DaySchedule> {
  const [items, booked, hours] = await Promise.all([
    db
      .select({ id: resources.id, name: resources.name, type: resources.type })
      .from(resources)
      .where(options.resourceFilter)
      .orderBy(asc(resources.name)),
    db
      .select({
        id: reservations.id,
        resourceId: reservations.resourceId,
        startAt: reservations.startAt,
        endAt: reservations.endAt,
        status: reservations.status,
        requesterName: user.name,
        purpose: reservations.purpose,
      })
      .from(reservations)
      .innerJoin(resources, eq(reservations.resourceId, resources.id))
      .innerJoin(user, eq(reservations.userId, user.id))
      .where(
        and(
          options.resourceFilter,
          inArray(reservations.status, activeReservationStatuses),
          lt(reservations.startAt, day.end),
          gt(reservations.endAt, day.start)
        )
      )
      .orderBy(asc(reservations.startAt)),
    getOperatingHours(),
  ])

  const minuteOfDay = (instant: Date) =>
    differenceInMinutes(min([max([instant, day.start]), day.end]), day.start)

  const slotsByResource = new Map<string, ScheduleSlot[]>()
  for (const { resourceId, startAt, endAt, requesterName, purpose, ...slot } of booked) {
    const slots = slotsByResource.get(resourceId) ?? []
    slots.push({
      ...slot,
      when: formatSchoolTimeRange(startAt, endAt),
      startLabel: formatSchoolTime(startAt),
      startMinute: minuteOfDay(startAt),
      endMinute: minuteOfDay(endAt),
      ...(options.withDetails
        ? { requesterName, purpose, overdue: slot.status === "CHECKED_OUT" && isPast(endAt) }
        : {}),
    })
    slotsByResource.set(resourceId, slots)
  }

  const hoursToday = hours.find((row) => row.weekday === day.weekday)
  return {
    hours:
      hoursToday?.hours && hoursToday.openTime && hoursToday.closeTime
        ? {
            label: hoursToday.hours,
            openMinute: clockToMinutes(hoursToday.openTime),
            closeMinute: clockToMinutes(hoursToday.closeTime),
          }
        : null,
    resources: items.map((item) => ({ ...item, slots: slotsByResource.get(item.id) ?? [] })),
  }
}

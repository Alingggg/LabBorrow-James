import "server-only"

import { isFuture } from "date-fns"
import { and, asc, desc, eq, gt, inArray, lte, notInArray, or, sql } from "drizzle-orm"

import { db } from "@/db"
import { reservations, resources } from "@/db/schema"
import { requireRequester } from "@/data/auth"
import { activeReservationStatuses } from "@/lib/reservation-status"
import { formatSchoolRange } from "@/lib/school-time"
import type { MyReservationRow, ReservationView } from "./types"

export async function listMyReservations(view: ReservationView): Promise<MyReservationRow[]> {
  const currentUser = await requireRequester()
  const upcoming = view === "upcoming"
  const rows = await db
    .select({
      id: reservations.id,
      resourceName: resources.name,
      startAt: reservations.startAt,
      endAt: reservations.endAt,
      purpose: reservations.purpose,
      status: reservations.status,
      rejectionReason: reservations.rejectionReason,
    })
    .from(reservations)
    .innerJoin(resources, eq(reservations.resourceId, resources.id))
    .where(
      and(
        eq(reservations.userId, currentUser.id),
        upcoming
          ? and(
              inArray(reservations.status, activeReservationStatuses),
              gt(reservations.endAt, sql`now()`)
            )
          : or(
              notInArray(reservations.status, [...activeReservationStatuses]),
              lte(reservations.endAt, sql`now()`)
            )
      )
    )
    .orderBy(upcoming ? asc(reservations.startAt) : desc(reservations.startAt))
    .limit(100)

  return rows.map(({ startAt, endAt, ...row }) => ({
    ...row,
    when: formatSchoolRange(startAt, endAt),
    canCancel:
      (row.status === "PENDING_APPROVAL" || row.status === "CONFIRMED") && isFuture(startAt),
  }))
}

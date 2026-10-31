import "server-only"

import { isPast } from "date-fns"
import { eq } from "drizzle-orm"

import { db } from "@/db"
import { reservations, resources, user } from "@/db/schema"
import { formatSchoolRange } from "@/lib/school-time"
import type { ReservationRow } from "./types"

const selection = {
  id: reservations.id,
  resourceName: resources.name,
  resourceType: resources.type,
  requesterName: user.name,
  startAt: reservations.startAt,
  endAt: reservations.endAt,
  purpose: reservations.purpose,
  status: reservations.status,
  rejectionReason: reservations.rejectionReason,
}

export const selectReservationRows = () =>
  db
    .select(selection)
    .from(reservations)
    .innerJoin(resources, eq(reservations.resourceId, resources.id))
    .innerJoin(user, eq(reservations.userId, user.id))

export function toRow({
  startAt,
  endAt,
  ...row
}: Omit<ReservationRow, "when" | "ended" | "canComplete"> & { startAt: Date; endAt: Date }): ReservationRow {
  const ended = isPast(endAt)
  return {
    ...row,
    when: formatSchoolRange(startAt, endAt),
    ended,
    canComplete: row.status === "RETURNED" || (row.status === "CONFIRMED" && ended),
  }
}

import "server-only"

import { isPast } from "date-fns"
import { and, asc, desc, eq, ne, sql } from "drizzle-orm"

import { db } from "@/db"
import { reservations, resources, user } from "@/db/schema"
import { formatSchoolRange } from "@/lib/school-time"
import { requireStaff } from "@/data/auth"
import { getDaySchedule, type SchoolDay } from "@/data/schedule"
import type { ResourceType } from "@/lib/resources"
import type { BookingFormData, EquipmentRow, ReservationRow } from "./types"
import { reservationFilterSchema } from "./schemas"

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

function toRow({
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

export async function listPendingReservations(): Promise<ReservationRow[]> {
  await requireStaff()
  const rows = await db
    .select(selection)
    .from(reservations)
    .innerJoin(resources, eq(reservations.resourceId, resources.id))
    .innerJoin(user, eq(reservations.userId, user.id))
    .where(eq(reservations.status, "PENDING_APPROVAL"))
    .orderBy(asc(reservations.startAt))
  return rows.map(toRow)
}

export async function listReservations(rawFilters: {
  type: ResourceType
  status?: string
  resourceId?: string
}) {
  await requireStaff()
  const parsed = reservationFilterSchema.safeParse({
    status: rawFilters.status || undefined,
    resourceId: rawFilters.resourceId || undefined,
  })
  const filters = parsed.success ? parsed.data : {}
  const [rows, resourceOptions] = await Promise.all([
    db
      .select(selection)
      .from(reservations)
      .innerJoin(resources, eq(reservations.resourceId, resources.id))
      .innerJoin(user, eq(reservations.userId, user.id))
      .where(
        and(
          eq(resources.type, rawFilters.type),
          filters.status ? eq(reservations.status, filters.status) : undefined,
          filters.resourceId ? eq(reservations.resourceId, filters.resourceId) : undefined
        )
      )
      .orderBy(
        sql`${reservations.endAt} < now()`,
        sql`case when ${reservations.endAt} >= now() then ${reservations.startAt} end`,
        desc(reservations.startAt)
      )
      .limit(200),
    db
      .select({ id: resources.id, name: resources.name })
      .from(resources)
      .where(eq(resources.type, rawFilters.type))
      .orderBy(asc(resources.name)),
  ])
  return {
    filters,
    resourceOptions,
    rows: rows.map(toRow),
  }
}

export async function listEquipmentWork(): Promise<{
  readyForCheckout: EquipmentRow[]
  checkedOut: EquipmentRow[]
}> {
  await requireStaff()
  const base = () =>
    db
      .select(selection)
      .from(reservations)
      .innerJoin(resources, eq(reservations.resourceId, resources.id))
      .innerJoin(user, eq(reservations.userId, user.id))
  const [ready, out] = await Promise.all([
    base()
      .where(and(eq(resources.type, "EQUIPMENT"), eq(reservations.status, "CONFIRMED")))
      .orderBy(asc(reservations.startAt)),
    base()
      .where(and(eq(resources.type, "EQUIPMENT"), eq(reservations.status, "CHECKED_OUT")))
      .orderBy(asc(reservations.endAt)),
  ])
  return {
    readyForCheckout: ready.map(toRow),
    checkedOut: out.map(toRow),
  }
}

export async function getStaffSchedule(day: SchoolDay) {
  await requireStaff()
  // Unavailable resources stay visible so staff can see bookings made before the change
  return getDaySchedule(day, { resourceFilter: ne(resources.status, "RETIRED"), withDetails: true })
}

export async function getBookingFormData(): Promise<BookingFormData> {
  await requireStaff()
  const [users, available] = await Promise.all([
    db
      .select({ id: user.id, name: user.name, email: user.email })
      .from(user)
      .orderBy(asc(user.name)),
    db
      .select({ id: resources.id, name: resources.name, type: resources.type })
      .from(resources)
      .where(eq(resources.status, "AVAILABLE"))
      .orderBy(asc(resources.name)),
  ])
  return { users, resources: available }
}

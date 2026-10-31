import "server-only"

import { and, asc, desc, eq, sql } from "drizzle-orm"

import { db } from "@/db"
import { reservations, resources, user } from "@/db/schema"
import { requireStaff } from "@/data/auth"
import type { ResourceType } from "@/lib/resources"
import { selectReservationRows, toRow } from "../data"
import type { BookingFormData } from "./types"
import { reservationFilterSchema } from "./schemas"

export async function getReservations(rawFilters: {
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
    selectReservationRows()
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

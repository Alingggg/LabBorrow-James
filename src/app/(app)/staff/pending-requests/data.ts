import "server-only"

import { asc, eq } from "drizzle-orm"

import { reservations } from "@/db/schema"
import { requireStaff } from "@/data/auth"
import { selectReservationRows, toRow } from "../data"
import type { ReservationRow } from "../types"

export async function getPendingReservations(): Promise<ReservationRow[]> {
  await requireStaff()
  const rows = await selectReservationRows()
    .where(eq(reservations.status, "PENDING_APPROVAL"))
    .orderBy(asc(reservations.startAt))
  return rows.map(toRow)
}

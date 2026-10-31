import "server-only"

import { and, asc, eq } from "drizzle-orm"

import { reservations, resources } from "@/db/schema"
import { requireStaff } from "@/data/auth"
import { selectReservationRows, toRow } from "../data"
import type { EquipmentRow } from "./types"

export async function getEquipmentWork(): Promise<{
  readyForCheckout: EquipmentRow[]
  checkedOut: EquipmentRow[]
}> {
  await requireStaff()
  const [ready, out] = await Promise.all([
    selectReservationRows()
      .where(and(eq(resources.type, "EQUIPMENT"), eq(reservations.status, "CONFIRMED")))
      .orderBy(asc(reservations.startAt)),
    selectReservationRows()
      .where(and(eq(resources.type, "EQUIPMENT"), eq(reservations.status, "CHECKED_OUT")))
      .orderBy(asc(reservations.endAt)),
  ])
  return {
    readyForCheckout: ready.map(toRow),
    checkedOut: out.map(toRow),
  }
}

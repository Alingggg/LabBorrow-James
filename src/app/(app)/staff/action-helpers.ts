import "server-only"

import { isFuture } from "date-fns"
import { revalidatePath } from "next/cache"

import type { Failure } from "@/lib/action-helpers"

export function revalidateStaff() {
  revalidatePath("/staff/pending-requests")
  revalidatePath("/staff/reservations")
  revalidatePath("/staff/equipment")
}

export const ended = (reservation: { endAt: Date }): Failure | null =>
  !isFuture(reservation.endAt)
    ? { ok: false, code: "INVALID_STATE", message: "This reservation has already ended." }
    : null

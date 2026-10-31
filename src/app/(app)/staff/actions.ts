"use server"

import { isFuture } from "date-fns"

import { db } from "@/db"
import type { ActionResult } from "@/types/action-result"
import { unexpectedError, validate } from "@/lib/action-helpers"
import { transitionReservation } from "@/data/reservations"
import { authorizeStaff } from "@/data/auth"
import { reservationIdSchema } from "@/schemas/reservations"
import { revalidateStaff } from "./action-helpers"

export async function completeReservationAction(values: {
  reservationId: string
}): Promise<ActionResult> {
  try {
    const auth = await authorizeStaff()
    if ("failure" in auth) return auth.failure
    const input = validate(reservationIdSchema, values)
    if ("failure" in input) return input.failure

    const result = await db.transaction((tx) =>
      transitionReservation(tx, {
        id: input.data.reservationId,
        to: "COMPLETED",
        actor: auth.actor,
        guard: async (reservation) =>
          reservation.status === "CONFIRMED" && isFuture(reservation.endAt)
            ? { ok: false, code: "INVALID_STATE", message: "This reservation hasn't ended yet." }
            : null,
      })
    )
    if (!result.ok) return result
    revalidateStaff()
    return { ok: true, data: undefined }
  } catch (error) {
    return unexpectedError(error)
  }
}

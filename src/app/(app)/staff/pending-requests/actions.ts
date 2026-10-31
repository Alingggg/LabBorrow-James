"use server"

import { db } from "@/db"
import type { ActionResult } from "@/types/action-result"
import { unexpectedError, validate } from "@/lib/action-helpers"
import { transitionReservation } from "@/data/reservations"
import { authorizeStaff } from "@/data/auth"
import { reservationIdSchema } from "@/schemas/reservations"
import { ended, revalidateStaff } from "../action-helpers"
import { rejectReservationInputSchema, type RejectReservationInput } from "./schemas"

export async function approveReservationAction(values: {
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
        to: "CONFIRMED",
        actor: auth.actor,
        guard: async (reservation) => ended(reservation),
      })
    )
    if (!result.ok) return result
    revalidateStaff()
    return { ok: true, data: undefined }
  } catch (error) {
    return unexpectedError(error)
  }
}

export async function rejectReservationAction(
  values: RejectReservationInput
): Promise<ActionResult> {
  try {
    const auth = await authorizeStaff()
    if ("failure" in auth) return auth.failure
    const input = validate(rejectReservationInputSchema, values)
    if ("failure" in input) return input.failure

    const result = await db.transaction((tx) =>
      transitionReservation(tx, {
        id: input.data.reservationId,
        to: "REJECTED",
        actor: auth.actor,
        reason: input.data.reason,
      })
    )
    if (!result.ok) return result
    revalidateStaff()
    return { ok: true, data: undefined }
  } catch (error) {
    return unexpectedError(error)
  }
}

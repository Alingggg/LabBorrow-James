"use server"

import { isFuture } from "date-fns"
import { revalidatePath } from "next/cache"

import { db } from "@/db"
import type { ActionResult } from "@/types/action-result"
import { unexpectedError, validate } from "@/lib/action-helpers"
import { authorizeRequester } from "@/data/auth"
import { transitionReservation } from "@/data/reservations"
import { cancelReservationInputSchema, type CancelReservationInput } from "@/schemas/reservations"

export async function cancelMyReservationAction(
  values: CancelReservationInput
): Promise<ActionResult> {
  try {
    const auth = await authorizeRequester()
    if ("failure" in auth) return auth.failure
    const input = validate(cancelReservationInputSchema, values)
    if ("failure" in input) return input.failure

    const result = await db.transaction((tx) =>
      transitionReservation(tx, {
        id: input.data.reservationId,
        to: "CANCELLED",
        actor: auth.actor,
        ownerId: auth.actor.id,
        reason: input.data.reason || undefined,
        guard: async (reservation) =>
          isFuture(reservation.startAt)
            ? null
            : { ok: false, code: "INVALID_STATE", message: "This reservation has already started." },
      })
    )
    if (!result.ok) return result
    revalidatePath("/reservations")
    revalidatePath(`/resources/${result.data.reservation.resourceId}`)
    return { ok: true, data: undefined }
  } catch (error) {
    return unexpectedError(error)
  }
}

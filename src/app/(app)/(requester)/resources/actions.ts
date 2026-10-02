"use server"

import { revalidatePath } from "next/cache"

import type { ActionResult } from "@/types/action-result"
import { unexpectedError, validate } from "@/lib/action-helpers"
import { authorizeRequester } from "@/data/auth"
import { createReservation } from "@/data/reservations"
import { reservationRequestSchema, type ReservationRequestInput } from "@/schemas/reservations"

export async function requestReservationAction(
  values: ReservationRequestInput
): Promise<ActionResult<{ id: string }>> {
  try {
    const auth = await authorizeRequester()
    if ("failure" in auth) return auth.failure
    const input = validate(reservationRequestSchema, values)
    if ("failure" in input) return input.failure

    const result = await createReservation(auth.actor, { ...input.data, userId: auth.actor.id })
    if (!result.ok) return result
    revalidatePath("/reservations")
    revalidatePath(`/resources/${input.data.resourceId}`)
    return { ok: true, data: { id: result.data.id } }
  } catch (error) {
    return unexpectedError(error)
  }
}

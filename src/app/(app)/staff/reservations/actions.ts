"use server"

import { db } from "@/db"
import type { ActionResult } from "@/types/action-result"
import { unexpectedError, validate } from "@/lib/action-helpers"
import { createReservation, transitionReservation } from "@/data/reservations"
import { authorizeStaff } from "@/data/auth"
import {
  cancelReservationInputSchema,
  type CancelReservationInput,
} from "@/schemas/reservations"
import { revalidateStaff } from "../action-helpers"
import { createReservationInputSchema, type CreateReservationInput } from "./schemas"

export async function createReservationAction(
  values: CreateReservationInput
): Promise<ActionResult<{ id: string }>> {
  try {
    const auth = await authorizeStaff()
    if ("failure" in auth) return auth.failure
    const input = validate(createReservationInputSchema, values)
    if ("failure" in input) return input.failure

    const result = await createReservation(auth.actor, input.data)
    if (!result.ok) return result
    revalidateStaff()
    return { ok: true, data: { id: result.data.id } }
  } catch (error) {
    return unexpectedError(error)
  }
}

export async function cancelReservationAction(
  values: CancelReservationInput
): Promise<ActionResult> {
  try {
    const auth = await authorizeStaff()
    if ("failure" in auth) return auth.failure
    const input = validate(cancelReservationInputSchema, values)
    if ("failure" in input) return input.failure

    const result = await db.transaction((tx) =>
      transitionReservation(tx, {
        id: input.data.reservationId,
        to: "CANCELLED",
        actor: auth.actor,
        reason: input.data.reason || undefined,
      })
    )
    if (!result.ok) return result
    revalidateStaff()
    return { ok: true, data: undefined }
  } catch (error) {
    return unexpectedError(error)
  }
}

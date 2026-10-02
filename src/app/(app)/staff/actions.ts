"use server"

import { isFuture } from "date-fns"
import { eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"

import { db } from "@/db"
import { equipmentCheckouts, resources } from "@/db/schema"
import type { ActionResult } from "@/types/action-result"
import { unexpectedError, validate, type Failure } from "@/lib/action-helpers"
import { createReservation, transitionReservation } from "@/data/reservations"
import { authorizeStaff } from "@/data/auth"
import {
  cancelReservationInputSchema,
  reservationIdSchema,
  type CancelReservationInput,
} from "@/schemas/reservations"
import {
  createReservationInputSchema,
  equipmentNotesInputSchema,
  rejectReservationInputSchema,
  type CreateReservationInput,
  type EquipmentNotesInput,
  type RejectReservationInput,
} from "./schemas"

function revalidateStaff() {
  revalidatePath("/staff")
  revalidatePath("/staff/reservations")
  revalidatePath("/staff/equipment")
}

const ended = (reservation: { endAt: Date }): Failure | null =>
  !isFuture(reservation.endAt)
    ? { ok: false, code: "INVALID_STATE", message: "This reservation has already ended." }
    : null

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

export async function checkoutEquipmentAction(
  values: EquipmentNotesInput
): Promise<ActionResult> {
  try {
    const auth = await authorizeStaff()
    if ("failure" in auth) return auth.failure
    const input = validate(equipmentNotesInputSchema, values)
    if ("failure" in input) return input.failure

    const result = await db.transaction(async (tx) => {
      const transition = await transitionReservation(tx, {
        id: input.data.reservationId,
        to: "CHECKED_OUT",
        actor: auth.actor,
        guard: async (reservation) => {
          const [resource] = await tx
            .select({ type: resources.type })
            .from(resources)
            .where(eq(resources.id, reservation.resourceId))
            .limit(1)
          if (resource?.type !== "EQUIPMENT") {
            return {
              ok: false,
              code: "INVALID_STATE",
              message: "Only equipment reservations can be checked out.",
            }
          }
          return ended(reservation)
        },
      })
      if (!transition.ok) return transition
      await tx.insert(equipmentCheckouts).values({
        reservationId: input.data.reservationId,
        checkedOutBy: auth.actor.id,
        notes: input.data.notes,
      })
      return transition
    })
    if (!result.ok) return result
    revalidateStaff()
    return { ok: true, data: undefined }
  } catch (error) {
    return unexpectedError(error, "This item has already been checked out.")
  }
}

export async function returnEquipmentAction(
  values: EquipmentNotesInput
): Promise<ActionResult> {
  try {
    const auth = await authorizeStaff()
    if ("failure" in auth) return auth.failure
    const input = validate(equipmentNotesInputSchema, values)
    if ("failure" in input) return input.failure

    const result = await db.transaction(async (tx) => {
      const transition = await transitionReservation(tx, {
        id: input.data.reservationId,
        to: "RETURNED",
        actor: auth.actor,
      })
      if (!transition.ok) return transition
      const [checkout] = await tx
        .update(equipmentCheckouts)
        .set({
          returnedTo: auth.actor.id,
          returnedAt: new Date(),
          notes: input.data.notes,
        })
        .where(eq(equipmentCheckouts.reservationId, input.data.reservationId))
        .returning({ id: equipmentCheckouts.id })
      if (!checkout) throw new Error("Checked-out reservation has no checkout record.")
      return transition
    })
    if (!result.ok) return result
    revalidateStaff()
    return { ok: true, data: undefined }
  } catch (error) {
    return unexpectedError(error)
  }
}

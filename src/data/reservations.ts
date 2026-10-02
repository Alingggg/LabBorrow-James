import "server-only"

import { differenceInMinutes, isFuture } from "date-fns"
import { eq } from "drizzle-orm"

import { db } from "@/db"
import {
  operatingHours,
  reservations,
  reservationStatusHistory,
  resources,
  user,
} from "@/db/schema"
import type { ActionResult } from "@/types/action-result"
import { databaseErrorCode } from "@/lib/db-errors"
import { canTransition, type ReservationStatus } from "@/lib/reservation-status"
import { formatMaxDuration, scopesForRole } from "@/lib/resources"
import { isStaffRole, type UserRole } from "@/lib/roles"
import { localPartsToUtc, utcToLocalParts } from "@/lib/school-time"

export type Transaction = Parameters<Parameters<typeof db.transaction>[0]>[0]
export type Actor = { id: string; role: UserRole }

export type NewReservation = {
  userId: string
  resourceId: string
  date: string // school-local YYYY-MM-DD
  startTime: string // school-local HH:mm
  endTime: string // school-local HH:mm
  purpose: string
}

type Failure = Extract<ActionResult<never>, { ok: false }>

const fail = (
  code: Failure["code"],
  message: string,
  fieldErrors?: Record<string, string[]>
): Failure => ({ ok: false, code, message, fieldErrors })

export async function createReservation(
  actor: Actor,
  input: NewReservation
): Promise<ActionResult<{ id: string; status: ReservationStatus }>> {
  try {
    return await db.transaction(async (tx) => {
      const startAt = localPartsToUtc(input.date, input.startTime)
      const endAt = localPartsToUtc(input.date, input.endTime)
      if (!startAt || !endAt) {
        return fail("VALIDATION_ERROR", "That date or time is not valid.")
      }
      if (input.endTime <= input.startTime) {
        return fail("VALIDATION_ERROR", "The end time must be after the start time.", {
          endTime: ["The end time must be after the start time."],
        })
      }
      if (!isFuture(startAt)) {
        return fail("VALIDATION_ERROR", "The reservation must start in the future.", {
          startTime: ["The reservation must start in the future."],
        })
      }

      const { weekday } = utcToLocalParts(startAt)
      const [hours] = await tx
        .select({
          openTime: operatingHours.openTime,
          closeTime: operatingHours.closeTime,
          isClosed: operatingHours.isClosed,
        })
        .from(operatingHours)
        .where(eq(operatingHours.dayOfWeek, weekday))
        .limit(1)
      if (!hours || hours.isClosed || !hours.openTime || !hours.closeTime) {
        return fail("VALIDATION_ERROR", "The school is closed on that day.", {
          date: ["The school is closed on that day."],
        })
      }
      const open = hours.openTime.slice(0, 5)
      const close = hours.closeTime.slice(0, 5)
      if (input.startTime < open || input.endTime > close) {
        return fail(
          "VALIDATION_ERROR",
          `Reservations must fall within operating hours (${open}–${close}).`,
          { startTime: [`Reservations must fall within operating hours (${open}–${close}).`] }
        )
      }

      const [resource] = await tx
        .select({
          status: resources.status,
          accessScope: resources.accessScope,
          maxReservationMinutes: resources.maxReservationMinutes,
        })
        .from(resources)
        .where(eq(resources.id, input.resourceId))
        .limit(1)
      if (!resource) {
        return fail("VALIDATION_ERROR", "Resource not found.", { resourceId: ["Resource not found."] })
      }
      if (resource.status !== "AVAILABLE") {
        return fail("INVALID_STATE", "That resource is not available for reservation.")
      }
      if (differenceInMinutes(endAt, startAt) > resource.maxReservationMinutes) {
        const message = `This resource can be reserved for at most ${formatMaxDuration(resource.maxReservationMinutes)}.`
        return fail("VALIDATION_ERROR", message, { endTime: [message] })
      }

      const [owner] = await tx
        .select({ id: user.id, role: user.role })
        .from(user)
        .where(eq(user.id, input.userId))
        .limit(1)
      if (!owner) {
        return fail("VALIDATION_ERROR", "User not found.", { userId: ["User not found."] })
      }
      if (!scopesForRole(owner.role).includes(resource.accessScope)) {
        const message = "This resource is limited to faculty and staff."
        return fail("VALIDATION_ERROR", message, { resourceId: [message] })
      }

      const status: ReservationStatus =
        isStaffRole(actor.role) && input.userId !== actor.id
          ? "CONFIRMED"
          : "PENDING_APPROVAL"

      const [created] = await tx
        .insert(reservations)
        .values({
          userId: input.userId,
          resourceId: input.resourceId,
          startAt,
          endAt,
          purpose: input.purpose,
          status,
          ...(status === "CONFIRMED"
            ? { reviewedBy: actor.id, reviewedAt: new Date() }
            : {}),
        })
        .returning({ id: reservations.id })
      if (!created) throw new Error("Reservation insert returned no row.")

      await tx.insert(reservationStatusHistory).values({
        reservationId: created.id,
        fromStatus: null,
        toStatus: status,
        changedBy: actor.id,
      })
      return { ok: true, data: { id: created.id, status } }
    })
  } catch (error) {
    // 23P01: exclusion_violation
    if (databaseErrorCode(error) === "23P01") {
      return fail("CONFLICT", "That time overlaps an existing reservation.")
    }
    throw error
  }
}

export type LockedReservation = typeof reservations.$inferSelect

export async function transitionReservation(
  tx: Transaction,
  options: {
    id: string
    to: ReservationStatus
    actor: Actor
    ownerId?: string
    reason?: string
    guard?: (reservation: LockedReservation) => Promise<Failure | null>
  }
): Promise<ActionResult<{ reservation: LockedReservation }>> {
  const [current] = await tx
    .select()
    .from(reservations)
    .where(eq(reservations.id, options.id))
    .for("update")
    .limit(1)
  if (!current || (options.ownerId && current.userId !== options.ownerId)) {
    return fail("NOT_FOUND", "Reservation not found.")
  }

  if (!canTransition(current.status, options.to)) {
    return fail(
      "INVALID_STATE",
      `A ${current.status.toLowerCase().replaceAll("_", " ")} reservation cannot become ${options.to.toLowerCase().replaceAll("_", " ")}.`
    )
  }
  if (options.guard) {
    const failure = await options.guard(current)
    if (failure) return failure
  }

  const reviewing = options.to === "CONFIRMED" || options.to === "REJECTED"
  await tx
    .update(reservations)
    .set({
      status: options.to,
      updatedAt: new Date(),
      ...(reviewing
        ? {
            reviewedBy: options.actor.id,
            reviewedAt: new Date(),
            rejectionReason: options.to === "REJECTED" ? (options.reason ?? null) : null,
          }
        : {}),
    })
    .where(eq(reservations.id, options.id))

  await tx.insert(reservationStatusHistory).values({
    reservationId: options.id,
    fromStatus: current.status,
    toStatus: options.to,
    changedBy: options.actor.id,
    reason: options.reason ?? null,
  })
  return { ok: true, data: { reservation: current } }
}

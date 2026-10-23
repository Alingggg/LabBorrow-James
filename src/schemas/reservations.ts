import { z } from "zod"

const timeOfDay = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Enter a valid time.")

export const reservationRequestSchema = z.object({
  resourceId: z.uuid("Choose a resource."),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Choose a date."),
  startTime: timeOfDay,
  endTime: timeOfDay,
  purpose: z.string().trim().min(1, "Purpose is required.").max(2_000),
})

export const reservationIdSchema = z.object({
  reservationId: z.uuid(),
})

export const cancelReservationInputSchema = reservationIdSchema.extend({
  reason: z.string().trim().max(1_000).default(""),
})

export const requiredReasonFormSchema = z.object({
  reason: z.string().trim().min(1, "A reason is required.").max(1_000),
})

export const optionalReasonFormSchema = z.object({
  reason: z.string().trim().max(1_000),
})

export type ReservationRequestInput = z.input<typeof reservationRequestSchema>
export type CancelReservationInput = z.input<typeof cancelReservationInputSchema>

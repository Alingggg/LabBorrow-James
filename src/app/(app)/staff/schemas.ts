import { z } from "zod"

import { reservationStatuses } from "@/lib/reservation-status"

const timeOfDay = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Enter a valid time.")

export const createReservationInputSchema = z.object({
  userId: z.string().min(1, "Choose a user."),
  resourceId: z.string().uuid("Choose a resource."),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Choose a date."),
  startTime: timeOfDay,
  endTime: timeOfDay,
  purpose: z.string().trim().min(1, "Purpose is required.").max(2_000),
})

export const reservationIdSchema = z.object({
  reservationId: z.string().uuid(),
})

export const rejectReservationInputSchema = reservationIdSchema.extend({
  reason: z.string().trim().min(1, "A reason is required.").max(1_000),
})

export const cancelReservationInputSchema = reservationIdSchema.extend({
  reason: z.string().trim().max(1_000).default(""),
})

export const equipmentNotesInputSchema = reservationIdSchema.extend({
  notes: z.string().trim().max(2_000).default(""),
})

export const reservationFilterSchema = z.object({
  status: z.enum(reservationStatuses).optional(),
  resourceId: z.string().uuid().optional(),
})

export const notesFormSchema = z.object({
  notes: z.string().trim().max(2_000),
})

export const requiredReasonFormSchema = z.object({
  reason: z.string().trim().min(1, "A reason is required.").max(1_000),
})

export const optionalReasonFormSchema = z.object({
  reason: z.string().trim().max(1_000),
})

export const ALL_FILTER = "all"

export const reservationFilterFormSchema = z.object({
  status: z.enum([ALL_FILTER, ...reservationStatuses]),
  resourceId: z.string().min(1),
})

export type ReservationFilterFormValues = z.infer<typeof reservationFilterFormSchema>
export type CreateReservationInput = z.input<typeof createReservationInputSchema>
export type RejectReservationInput = z.input<typeof rejectReservationInputSchema>
export type CancelReservationInput = z.input<typeof cancelReservationInputSchema>
export type EquipmentNotesInput = z.input<typeof equipmentNotesInputSchema>

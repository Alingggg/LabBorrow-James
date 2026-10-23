import { z } from "zod"

import { reservationStatuses } from "@/lib/reservation-status"
import { reservationIdSchema, reservationRequestSchema } from "@/schemas/reservations"

export const createReservationInputSchema = reservationRequestSchema.extend({
  userId: z.string().min(1, "Choose a user."),
})

export const rejectReservationInputSchema = reservationIdSchema.extend({
  reason: z.string().trim().min(1, "A reason is required.").max(1_000),
})

export const equipmentNotesInputSchema = reservationIdSchema.extend({
  notes: z.string().trim().max(2_000).default(""),
})

export const reservationFilterSchema = z.object({
  status: z.enum(reservationStatuses).optional(),
  resourceId: z.uuid().optional(),
})

export const notesFormSchema = z.object({
  notes: z.string().trim().max(2_000),
})

export const ALL_FILTER = "all"

export const reservationFilterFormSchema = z.object({
  status: z.enum([ALL_FILTER, ...reservationStatuses]),
  resourceId: z.string().min(1),
})

export type ReservationFilterFormValues = z.infer<typeof reservationFilterFormSchema>
export type CreateReservationInput = z.input<typeof createReservationInputSchema>
export type RejectReservationInput = z.input<typeof rejectReservationInputSchema>
export type EquipmentNotesInput = z.input<typeof equipmentNotesInputSchema>

import { z } from "zod"

import { reservationStatuses } from "@/lib/reservation-status"
import { reservationRequestSchema } from "@/schemas/reservations"

export const createReservationInputSchema = reservationRequestSchema.extend({
  userId: z.string().min(1, "Choose a user."),
})

export const reservationFilterSchema = z.object({
  status: z.enum(reservationStatuses).optional(),
  resourceId: z.uuid().optional(),
})

export const ALL_FILTER = "all"

export const reservationFilterFormSchema = z.object({
  status: z.enum([ALL_FILTER, ...reservationStatuses]),
  resourceId: z.string().min(1),
})

export type ReservationFilterFormValues = z.infer<typeof reservationFilterFormSchema>
export type CreateReservationInput = z.input<typeof createReservationInputSchema>

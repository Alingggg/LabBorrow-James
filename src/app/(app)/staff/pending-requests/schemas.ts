import { z } from "zod"

import { reservationIdSchema } from "@/schemas/reservations"

export const rejectReservationInputSchema = reservationIdSchema.extend({
  reason: z.string().trim().min(1, "A reason is required.").max(1_000),
})

export type RejectReservationInput = z.input<typeof rejectReservationInputSchema>

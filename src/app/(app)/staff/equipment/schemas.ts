import { z } from "zod"

import { reservationIdSchema } from "@/schemas/reservations"

export const equipmentNotesInputSchema = reservationIdSchema.extend({
  notes: z.string().trim().max(2_000).default(""),
})

export const notesFormSchema = z.object({
  notes: z.string().trim().max(2_000),
})

export type EquipmentNotesInput = z.input<typeof equipmentNotesInputSchema>

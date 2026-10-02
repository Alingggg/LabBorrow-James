import { z } from "zod"

import {
  accessScopes,
  resourceStatuses,
  resourceTypes,
} from "@/lib/resources"

export const resourceInputSchema = z.object({
  id: z.union([z.string().uuid(), z.literal("")]).optional(),
  name: z.string().trim().min(2).max(120),
  description: z.string().trim().max(2_000),
  type: z.enum(resourceTypes),
  status: z.enum(resourceStatuses),
  accessScope: z.enum(accessScopes),
  maxReservationMinutes: z
    .number("Enter a number of minutes.")
    .int("Use whole minutes.")
    .min(1, "Must be at least 1 minute.")
    .max(1_440, "Must be at most 24 hours."),
})

export type ResourceInput = z.input<typeof resourceInputSchema>
export type ResourceOutput = z.output<typeof resourceInputSchema>

import { z } from "zod"

import {
  resourceStatuses,
  resourceTypes,
} from "@/lib/resources"

export const resourceInputSchema = z.object({
  id: z.union([z.string().uuid(), z.literal("")]).optional(),
  name: z.string().trim().min(2).max(120),
  description: z.string().trim().max(2_000),
  type: z.enum(resourceTypes),
  status: z.enum(resourceStatuses),
})

export type ResourceInput = z.input<typeof resourceInputSchema>
export type ResourceOutput = z.output<typeof resourceInputSchema>

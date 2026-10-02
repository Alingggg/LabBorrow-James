import { z } from "zod"

export const facilityInputSchema = z.object({
  institutionName: z.string().trim().min(2).max(120),
  email: z.union([z.literal(""), z.email()]),
  phone: z.string().trim().max(40),
  address: z.string().trim().max(300),
})

export type FacilityInput = z.input<typeof facilityInputSchema>

import { z } from "zod"

export const facilityInputSchema = z.object({
  institutionName: z.string().trim().min(2).max(120),
  email: z.union([z.literal(""), z.email()]),
  phone: z.string().trim().max(40),
  address: z.string().trim().max(300),
})

const timeOfDay = z.union([z.literal(""), z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Enter a valid time.")])

const operatingDaySchema = z
  .object({
    weekday: z.number().int().min(0).max(6),
    status: z.enum(["OPEN", "CLOSED"]),
    openTime: timeOfDay,
    closeTime: timeOfDay,
  })
  .superRefine((day, ctx) => {
    if (day.status === "CLOSED") return
    if (!day.openTime) ctx.addIssue({ code: "custom", path: ["openTime"], message: "Enter an opening time." })
    if (!day.closeTime) ctx.addIssue({ code: "custom", path: ["closeTime"], message: "Enter a closing time." })
    if (day.openTime && day.closeTime && day.openTime >= day.closeTime) {
      ctx.addIssue({ code: "custom", path: ["closeTime"], message: "Closing must be after opening." })
    }
  })

export const operatingHoursInputSchema = z.object({
  days: z
    .array(operatingDaySchema)
    .length(7)
    .refine((days) => new Set(days.map((day) => day.weekday)).size === 7, "Each weekday must appear once."),
})

export type FacilityInput = z.input<typeof facilityInputSchema>
export type OperatingHoursInput = z.input<typeof operatingHoursInputSchema>

import { z } from "zod"

export const scheduleDateFormSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Choose a date."),
})

export type ScheduleDateFormValues = z.infer<typeof scheduleDateFormSchema>

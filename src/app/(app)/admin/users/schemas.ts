import { z } from "zod"

import { userRoleValues } from "@/lib/roles"

export const roleInputSchema = z.object({
  userId: z.string().min(1),
  role: z.enum(userRoleValues),
})

export type RoleInput = z.input<typeof roleInputSchema>

export const createUserInputSchema = z.object({
  name: z.string().trim().min(1).max(120),
  email: z.string().trim().toLowerCase().pipe(z.email()),
  password: z.string().min(8).max(128),
  role: z.enum(userRoleValues),
})

export type CreateUserInput = z.input<typeof createUserInputSchema>

"use server"

import { count, eq, sql } from "drizzle-orm"
import { revalidatePath } from "next/cache"

import { db } from "@/db"
import { createUser } from "@/db/create-user"
import { user } from "@/db/schema"
import { unexpectedError, validate } from "@/lib/action-helpers"
import type { ActionResult } from "@/types/action-result"
import { authorizeAdmin } from "@/data/auth"
import {
  createUserInputSchema,
  roleInputSchema,
  type CreateUserInput,
  type RoleInput,
} from "./schemas"

export async function createUserAction(
  values: CreateUserInput
): Promise<ActionResult<Awaited<ReturnType<typeof createUser>>>> {
  try {
    const auth = await authorizeAdmin()
    if ("failure" in auth) return auth.failure

    const parsed = validate(createUserInputSchema, values)
    if ("failure" in parsed) return parsed.failure

    const created = await createUser(parsed.data)

    revalidatePath("/admin/overview")
    revalidatePath("/admin/users")
    return { ok: true, data: created }
  } catch (error) {
    return unexpectedError(error, "An account with that email already exists.")
  }
}

export async function updateUserRoleAction(
  values: RoleInput
): Promise<ActionResult<RoleInput>> {
  try {
    const auth = await authorizeAdmin()
    if ("failure" in auth) return auth.failure

    const parsed = validate(roleInputSchema, values)
    if ("failure" in parsed) return parsed.failure
    const input = parsed.data

    // All checks run before the update, so returning from the transaction
    // without throwing never leaves partial changes behind.
    const failure = await db.transaction(
      async (tx): Promise<ActionResult<never> | null> => {
        await tx.execute(
          sql`select pg_advisory_xact_lock(hashtext('labborrow-admin-role-management'))`
        )
        const [target] = await tx
          .select({ role: user.role })
          .from(user)
          .where(eq(user.id, input.userId))
          .limit(1)
        if (!target) {
          return { ok: false, code: "NOT_FOUND", message: "User not found." }
        }

        if (target.role === "ADMIN" && input.role !== "ADMIN") {
          const [adminCount] = await tx
            .select({ total: count() })
            .from(user)
            .where(eq(user.role, "ADMIN"))
          if ((adminCount?.total ?? 0) <= 1) {
            return {
              ok: false,
              code: "INVALID_STATE",
              message: "The final Administrator cannot be demoted.",
            }
          }
        }

        await tx
          .update(user)
          .set({ role: input.role, updatedAt: new Date() })
          .where(eq(user.id, input.userId))
        return null
      }
    )
    if (failure) return failure

    revalidatePath("/admin/overview")
    revalidatePath("/admin/users")
    return { ok: true, data: input }
  } catch (error) {
    return unexpectedError(error)
  }
}

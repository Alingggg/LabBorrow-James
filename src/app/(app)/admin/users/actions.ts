"use server"

import { count, eq, sql } from "drizzle-orm"
import { revalidatePath } from "next/cache"

import { db } from "@/db"
import { createUser } from "@/db/create-user"
import { user } from "@/db/schema"
import { getSessionUser } from "@/lib/session"
import { databaseErrorCode } from "@/lib/db-errors"
import type { ActionResult } from "../types"
import {
  createUserInputSchema,
  roleInputSchema,
  type CreateUserInput,
  type RoleInput,
} from "./zod-schemas"

export async function createUserAction(
  values: CreateUserInput
): Promise<ActionResult<Awaited<ReturnType<typeof createUser>>>> {
  try {
    const currentUser = await getSessionUser()
    if (!currentUser) {
      return { ok: false, code: "UNAUTHORIZED", message: "Sign in to continue." }
    }
    if (currentUser.role !== "ADMIN") {
      return { ok: false, code: "FORBIDDEN", message: "Administrator access is required." }
    }

    const parsed = createUserInputSchema.safeParse(values)
    if (!parsed.success) {
      return {
        ok: false,
        code: "VALIDATION_ERROR",
        message: "Please correct the highlighted fields.",
        fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
      }
    }

    const created = await createUser(parsed.data)

    revalidatePath("/admin")
    revalidatePath("/admin/users")
    return { ok: true, data: created }
  } catch (error) {
    if (databaseErrorCode(error) === "23505") {
      return {
        ok: false,
        code: "CONFLICT",
        message: "An account with that email already exists.",
      }
    }
    console.error(error)
    return {
      ok: false,
      code: "DATABASE_ERROR",
      message: "The request could not be completed. Please try again.",
    }
  }
}

export async function updateUserRoleAction(
  values: RoleInput
): Promise<ActionResult<RoleInput>> {
  try {
    const currentUser = await getSessionUser()
    if (!currentUser) {
      return { ok: false, code: "UNAUTHORIZED", message: "Sign in to continue." }
    }
    if (currentUser.role !== "ADMIN") {
      return { ok: false, code: "FORBIDDEN", message: "Administrator access is required." }
    }

    const parsed = roleInputSchema.safeParse(values)
    if (!parsed.success) {
      return {
        ok: false,
        code: "VALIDATION_ERROR",
        message: "Please correct the highlighted fields.",
        fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
      }
    }
    const input = parsed.data

    // All checks run before the update, so returning from the transaction
    // without throwing never leaves partial changes behind.
    const failure = await db.transaction(
      async (tx): Promise<ActionResult<never> | null> => {
        await tx.execute(
          sql`select pg_advisory_xact_lock(hashtext('labreserve-admin-role-management'))`
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

    revalidatePath("/admin")
    revalidatePath("/admin/users")
    return { ok: true, data: input }
  } catch (error) {
    console.error(error)
    return {
      ok: false,
      code: "DATABASE_ERROR",
      message: "The request could not be completed. Please try again.",
    }
  }
}

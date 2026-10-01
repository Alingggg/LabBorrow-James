"use server"

import { eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"

import { db } from "@/db"
import { resources } from "@/db/schema"
import { getSessionUser } from "@/lib/session"
import { databaseErrorCode } from "@/lib/db-errors"
import type { ActionResult } from "../types"
import { resourceInputSchema, type ResourceInput } from "./zod-schemas"

export async function saveResourceAction(
  values: ResourceInput
): Promise<ActionResult<{ id: string }>> {
  try {
    const currentUser = await getSessionUser()
    if (!currentUser) {
      return { ok: false, code: "UNAUTHORIZED", message: "Sign in to continue." }
    }
    if (currentUser.role !== "ADMIN") {
      return { ok: false, code: "FORBIDDEN", message: "Administrator access is required." }
    }

    const parsed = resourceInputSchema.safeParse(values)
    if (!parsed.success) {
      return {
        ok: false,
        code: "VALIDATION_ERROR",
        message: "Please correct the highlighted fields.",
        fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
      }
    }
    const { id, ...fields } = parsed.data

    const [record] = id
      ? await db
          .update(resources)
          .set({ ...fields, updatedAt: new Date() })
          .where(eq(resources.id, id))
          .returning({ id: resources.id })
      : await db.insert(resources).values(fields).returning({ id: resources.id })
    if (!record) {
      return { ok: false, code: "NOT_FOUND", message: "Resource not found." }
    }

    revalidatePath("/admin")
    revalidatePath("/admin/resources")
    return { ok: true, data: record }
  } catch (error) {
    if (databaseErrorCode(error) === "23505") {
      return {
        ok: false,
        code: "CONFLICT",
        message: "A resource with that name already exists.",
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

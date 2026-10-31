"use server"

import { eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"

import { db } from "@/db"
import { resources } from "@/db/schema"
import { unexpectedError, validate } from "@/lib/action-helpers"
import type { ActionResult } from "@/types/action-result"
import { authorizeAdmin } from "@/data/auth"
import { resourceInputSchema, type ResourceInput } from "./schemas"

export async function saveResourceAction(
  values: ResourceInput
): Promise<ActionResult<{ id: string }>> {
  try {
    const auth = await authorizeAdmin()
    if ("failure" in auth) return auth.failure

    const parsed = validate(resourceInputSchema, values)
    if ("failure" in parsed) return parsed.failure
    const { id, description, ...rest } = parsed.data
    const fields = { ...rest, description: description || null }

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

    revalidatePath("/admin/overview")
    revalidatePath("/admin/resources")
    revalidatePath("/resources", "layout")
    return { ok: true, data: record }
  } catch (error) {
    return unexpectedError(error, "A resource with that name already exists.")
  }
}

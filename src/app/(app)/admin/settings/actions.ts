"use server"

import { revalidatePath } from "next/cache"

import { db } from "@/db"
import { facilitySettings } from "@/db/schema"
import { getSessionUser } from "@/lib/session"
import type { ActionResult } from "../types"
import { facilityInputSchema, type FacilityInput } from "./zod-schemas"

export async function updateFacilityAction(
  values: FacilityInput
): Promise<ActionResult<FacilityInput>> {
  try {
    const currentUser = await getSessionUser()
    if (!currentUser) {
      return { ok: false, code: "UNAUTHORIZED", message: "Sign in to continue." }
    }
    if (currentUser.role !== "ADMIN") {
      return { ok: false, code: "FORBIDDEN", message: "Administrator access is required." }
    }

    const parsed = facilityInputSchema.safeParse(values)
    if (!parsed.success) {
      return {
        ok: false,
        code: "VALIDATION_ERROR",
        message: "Please correct the highlighted fields.",
        fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
      }
    }
    const input = parsed.data

    await db
      .insert(facilitySettings)
      .values({ id: "default", ...input })
      .onConflictDoUpdate({
        target: facilitySettings.id,
        set: { ...input, updatedAt: new Date() },
      })

    revalidatePath("/admin")
    revalidatePath("/admin/settings")
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
